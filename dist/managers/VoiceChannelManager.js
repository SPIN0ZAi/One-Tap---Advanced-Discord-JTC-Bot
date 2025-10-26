"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceChannelManager = void 0;
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
class VoiceChannelManager {
    bot;
    db;
    stickyMessageManager;
    deletionTimers;
    constructor(bot) {
        this.bot = bot;
        this.db = bot.db;
        this.stickyMessageManager = bot.stickyManager;
        this.deletionTimers = new Map();
    }
    async handleVoiceStateUpdate(oldState, newState) {
        const member = newState.member || oldState.member;
        if (!member || member.user.bot)
            return;
        const guild = newState.guild;
        const setupConfig = this.db.getSetupConfig(guild.id);
        if (!setupConfig)
            return;
        const joinedChannel = newState.channel;
        const leftChannel = oldState.channel;
        // Check if user joined a managed voice channel and if they're rejected
        if (joinedChannel && joinedChannel.type === discord_js_1.ChannelType.GuildVoice) {
            const channelData = this.db.getVoiceChannel(joinedChannel.id);
            if (channelData) {
                console.log(`🔍 Checking user ${member.user.tag} joining managed channel ${joinedChannel.name}`);
                // Check if user is the owner (owner is immune to all restrictions)
                if (member.id !== channelData.ownerId) {
                    // Check if user is rejected (user-specific)
                    const permissions = this.db.getPermissions(joinedChannel.id);
                    console.log(`📋 Found ${permissions.length} permissions for channel`);
                    const isUserBlacklisted = permissions.some(p => p.permissionType === 'blacklist' &&
                        p.targetType === 'user' &&
                        p.targetId === member.id);
                    // Check if any of user's roles are rejected
                    const isRoleBlacklisted = member.roles.cache.some(role => permissions.some(p => p.permissionType === 'blacklist' &&
                        p.targetType === 'role' &&
                        p.targetId === role.id));
                    console.log(`🚫 User rejected: ${isUserBlacklisted}, Role rejected: ${isRoleBlacklisted}`);
                    if (isUserBlacklisted || isRoleBlacklisted) {
                        // Disconnect the user immediately (even if they're admin)
                        try {
                            console.log(`⚠️ Attempting to disconnect ${member.user.tag}...`);
                            await member.voice.disconnect('You are rejected from this voice channel');
                            console.log(`⛔ Disconnected rejected user ${member.user.tag} from ${joinedChannel.name} (Admin bypass blocked)`);
                            // Also immediately re-apply the permission overwrite to ensure it sticks
                            await joinedChannel.permissionOverwrites.edit(member.id, {
                                ViewChannel: false,
                                Connect: false,
                                Speak: false,
                                Stream: false,
                                UseVAD: false,
                                PrioritySpeaker: false,
                                MuteMembers: false,
                                DeafenMembers: false,
                                MoveMembers: false,
                            });
                            console.log(`✅ Re-applied permission denials for ${member.user.tag}`);
                        }
                        catch (error) {
                            console.error('❌ Error disconnecting rejected user:', error);
                        }
                        return; // Don't process further
                    }
                }
                else {
                    console.log(`👑 User is owner, allowing entry`);
                }
            }
        }
        // User joined the JTC channel
        if (joinedChannel?.id === setupConfig.jtcChannelId) {
            console.log(`User ${member.user.tag} joined JTC channel`);
            await this.createPersonalVoiceChannel(member, guild, setupConfig);
        }
        // User left a channel - check if it's empty and temporary
        if (leftChannel && leftChannel.type === discord_js_1.ChannelType.GuildVoice) {
            await this.handleChannelLeave(leftChannel);
        }
        // User joined a temporary channel - cancel deletion timer
        if (joinedChannel) {
            const timer = this.deletionTimers.get(joinedChannel.id);
            if (timer) {
                console.log(`Cancelling deletion timer for ${joinedChannel.name} - user rejoined`);
                clearTimeout(timer);
                this.deletionTimers.delete(joinedChannel.id);
            }
        }
    }
    async createPersonalVoiceChannel(member, guild, setupConfig) {
        try {
            const category = guild.channels.cache.get(setupConfig.categoryId);
            if (!category) {
                console.error('Category not found');
                return;
            }
            // Format channel name using display name
            const channelName = setupConfig.channelNameFormat.replace('{username}', member.displayName);
            console.log(`Creating voice channel: ${channelName}`);
            // Create voice channel
            const voiceChannel = await guild.channels.create({
                name: channelName,
                type: discord_js_1.ChannelType.GuildVoice,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        allow: [discord_js_1.PermissionFlagsBits.Connect, discord_js_1.PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: member.id,
                        allow: [
                            discord_js_1.PermissionFlagsBits.Connect,
                            discord_js_1.PermissionFlagsBits.ViewChannel,
                            discord_js_1.PermissionFlagsBits.ManageChannels,
                            discord_js_1.PermissionFlagsBits.MoveMembers,
                        ],
                    },
                ],
            });
            console.log(`Created voice channel: ${voiceChannel.name}`);
            // Get owner for avatar
            const owner = await this.bot.client.users.fetch(member.id);
            // Determine which GIF to use - priority: user custom GIF > user-specific hardcoded > default
            let gifUrl = 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Z3EzYzFjNDFyZjYxYnJ1NjQ1NWw4emkzdHc0ODUxd3g3Y3R0cnVxcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/UC8DbMqXvkpd6/giphy.gif';
            // Check if user has set a custom GIF (persistent across all their channels)
            const userCustomGif = this.bot.db.getUserCustomGif(member.id, guild.id);
            console.log(`🎨 Checking custom GIF for user ${member.user.tag} (${member.id}):`, userCustomGif);
            if (userCustomGif) {
                gifUrl = userCustomGif;
                console.log(`✅ Using user's custom GIF: ${gifUrl}`);
            }
            else if (member.id === '828350357867724841') {
                gifUrl = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc25ncnA1bmdrdDRmNXZkNWNhZG9xZzdpOGJkZm9odjZxN29vdHkxdyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/10m3iotMeYwSYw/giphy.gif';
                console.log(`✅ Using hardcoded GIF for user 828350357867724841`);
            }
            else if (member.id === '302125862340526120') {
                gifUrl = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnlubDV5cXRkdzV0bzFjMDI5dHVicHAyaXo0MnE0NDk1dDBsdmR3eSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/DeSZZmHos0XvOGN117/giphy.gif';
                console.log(`✅ Using hardcoded GIF for user 302125862340526120`);
            }
            else {
                console.log(`ℹ️ Using default GIF`);
            }
            // Create embed with all the controls - with bot icon at top left and custom GIF
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0x5865F2)
                .setAuthor({
                name: `${this.bot.client.user?.username}`,
                iconURL: this.bot.client.user?.displayAvatarURL({ size: 64 }) // Small bot profile at top left
            })
                .setDescription(`Need help managing your voice channel? Use the commands below to customize, control, and secure your VC with ease.`)
                .setImage(gifUrl)
                .addFields({ name: '✏️ | name', value: 'changes the name of the vc', inline: false }, { name: '🔒 | lock/unlock', value: 'locks/unlocks the vc', inline: false }, { name: 'ℹ️ | info/stats', value: 'show information vc', inline: false }, { name: '♾️ | limit', value: 'sets the limit of the vc', inline: false }, { name: '🔄 | reset', value: 'reset all permissions channel', inline: false }, { name: '✅ | permit', value: 'permit a specific user to your VC', inline: false }, { name: '❌ | reject', value: 'reject a specific user from your VC', inline: false }, { name: '👁️ | hide', value: 'hide your VC from the server list', inline: false }, { name: '👑 | owner', value: `Owner: <@${member.id}>`, inline: false }, { name: '📝 | Channel', value: `Voice: <#${voiceChannel.id}>`, inline: false })
                .setThumbnail(owner.displayAvatarURL({ size: 256 }))
                .setFooter({ text: 'Click buttons below to control your channel' })
                .setTimestamp();
            // Create button rows
            const row1 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.CHANGE_NAME).setLabel('Rename').setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.LOCK).setLabel('Lock').setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.UNLOCK).setLabel('Unlock').setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.SET_LIMIT).setLabel('Limit').setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.RESET_PERMISSIONS).setLabel('Reset').setStyle(discord_js_1.ButtonStyle.Secondary));
            const row2 = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.PERMIT_USER).setLabel('Permit').setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.BLACKLIST_USER).setLabel('Reject').setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.HIDE).setLabel('Hide').setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.INFO).setLabel('Info').setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.MANAGE_COOWNERS).setLabel('Co-owners').setStyle(discord_js_1.ButtonStyle.Primary));
            const row3 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.SET_CUSTOM_GIF).setLabel('🎨 Set GIF').setStyle(discord_js_1.ButtonStyle.Secondary).setEmoji('🖼️'));
            // Send the sticky message with buttons directly to the voice channel's text chat
            const vcChannel = await this.bot.client.channels.fetch(voiceChannel.id);
            if (vcChannel?.isVoiceBased()) {
                const sentMessage = await vcChannel.send({ embeds: [embed], components: [row1, row2, row3] });
                console.log(`✅ Sent sticky message to voice channel chat: ${sentMessage.id}`);
                // Store in database
                this.db.updateStickyMessage(voiceChannel.id, sentMessage.id);
            }
            // Move user to the new voice channel
            console.log(`Moving ${member.user.tag} to ${voiceChannel.name}`);
            await member.voice.setChannel(voiceChannel);
            // Save to database with is_temporary flag (no text channel)
            this.db.createVoiceChannel({
                guildId: guild.id,
                channelId: voiceChannel.id,
                ownerId: member.id,
                isTemporary: true,
                createdAt: Date.now(),
            });
        }
        catch (error) {
            console.error('Error creating personal voice channel:', error);
        }
    }
    async handleChannelLeave(channel) {
        // Check if channel is in database and marked as temporary
        const channelData = this.db.getVoiceChannel(channel.id);
        if (!channelData || !channelData.isTemporary)
            return;
        // Check if channel is empty
        if (channel.members.size > 0)
            return;
        console.log(`Channel ${channel.name} is empty - starting 10 second deletion timer`);
        // Set deletion timer for 10 seconds
        const timer = setTimeout(async () => {
            try {
                // Double check channel is still empty
                const currentChannel = await channel.guild.channels.fetch(channel.id).catch(() => null);
                if (!currentChannel || currentChannel.type !== discord_js_1.ChannelType.GuildVoice)
                    return;
                const voiceChannel = currentChannel;
                if (voiceChannel.members.size > 0) {
                    console.log(`Channel ${channel.name} has users again - cancelling deletion`);
                    return;
                }
                console.log(`Deleting empty channel: ${channel.name}`);
                // Delete voice channel (no text channel to delete)
                await channel.delete();
                console.log(`Deleted voice channel: ${channel.name}`);
                // Remove from database
                this.db.deleteVoiceChannel(channel.id);
                this.deletionTimers.delete(channel.id);
            }
            catch (error) {
                console.error(`Error deleting channel ${channel.name}:`, error);
            }
        }, 10000); // 10 seconds
        this.deletionTimers.set(channel.id, timer);
    }
    async handleChannelDelete(channelId) {
        // Clean up deletion timer if exists
        const timer = this.deletionTimers.get(channelId);
        if (timer) {
            clearTimeout(timer);
            this.deletionTimers.delete(channelId);
        }
        // Remove from database
        this.db.deleteVoiceChannel(channelId);
    }
    async getChannelStats(channelId) {
        const channelData = this.db.getVoiceChannel(channelId);
        if (!channelData)
            return null;
        const settings = this.db.getSettings(channelId);
        const coowners = this.db.getCoOwners(channelId);
        return {
            owner: channelData.ownerId,
            createdAt: channelData.createdAt,
            locked: false, // TODO: implement lock status
            hidden: false, // TODO: implement hide status
            userLimit: 0, // TODO: implement user limit
            coowners: coowners.map((c) => c.userId),
            permitted: [],
            blacklisted: [],
        };
    }
}
exports.VoiceChannelManager = VoiceChannelManager;
//# sourceMappingURL=VoiceChannelManager.js.map