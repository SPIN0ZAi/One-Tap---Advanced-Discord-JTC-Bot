"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StickyMessageManager = void 0;
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
class StickyMessageManager {
    bot;
    stickyMessages = new Map();
    constructor(bot) {
        this.bot = bot;
    }
    async initializeAllStickyMessages() {
        const channels = this.bot.db.getAllVoiceChannels();
        for (const channelData of channels) {
            if (channelData.textChannelId) {
                await this.createOrUpdateStickyMessage(channelData.textChannelId, channelData.channelId);
            }
        }
    }
    async createOrUpdateStickyMessage(textChannelId, voiceChannelId) {
        try {
            console.log('Creating/updating sticky message');
            const textChannel = await this.bot.client.channels.fetch(textChannelId);
            if (!textChannel || textChannel.type !== discord_js_1.ChannelType.GuildText)
                return;
            const channelData = this.bot.db.getVoiceChannel(voiceChannelId);
            if (!channelData)
                return;
            // Get owner for avatar
            const owner = await this.bot.client.users.fetch(channelData.ownerId);
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0x5865F2)
                .setAuthor({
                name: 'One Tap - Help Panel',
                iconURL: this.bot.client.user?.displayAvatarURL()
            })
                .setDescription(`Need help managing your voice channel? Use the commands below to customize, control, and secure your VC with ease.`)
                .setImage('https://media1.tenor.com/m/4BV0r_fdQBoAAAAd/travis-bickle-cinema.gif')
                .addFields({ name: '✏️ | name', value: 'changes the name of the vc', inline: false }, { name: '🔒 | lock/unlock', value: 'locks/unlocks the vc', inline: false }, { name: 'ℹ️ | info/stats', value: 'show information vc', inline: false }, { name: '♾️ | limit', value: 'sets the limit of the vc', inline: false }, { name: '🔄 | reset', value: 'reset all permissions channel', inline: false }, { name: '👤 | permit', value: 'gives a user permission to join the vc', inline: false }, { name: '❌ | blacklist', value: 'blacklist a specific user from your VC', inline: false }, { name: '👁️ | hide/unhide', value: 'unhides/hides the vc', inline: false }, { name: '👑 | owner', value: `Owner: <@${channelData.ownerId}>`, inline: false }, { name: '📝 | Channel', value: `Voice: <#${voiceChannelId}>\nText: <#${textChannelId}>`, inline: false })
                .setThumbnail(owner.displayAvatarURL({ size: 256 }))
                .setFooter({ text: 'Click buttons below to control your channel' })
                .setTimestamp();
            const row1 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.CHANGE_NAME).setLabel('Rename').setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.LOCK).setLabel('Lock').setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.UNLOCK).setLabel('Unlock').setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.SET_LIMIT).setLabel('Limit').setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.RESET_PERMISSIONS).setLabel('Reset').setStyle(discord_js_1.ButtonStyle.Secondary));
            const row2 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.PERMIT_USER).setLabel('Permit').setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.BLACKLIST_USER).setLabel('Reject').setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.HIDE).setLabel('Hide').setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.INFO).setLabel('Info').setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder().setCustomId(types_1.ButtonAction.MANAGE_COOWNERS).setLabel('Co-owners').setStyle(discord_js_1.ButtonStyle.Primary));
            // Check if message already exists - UPDATE instead of DELETE and recreate
            if (channelData.stickyMessageId) {
                try {
                    const existingMessage = await textChannel.messages.fetch(channelData.stickyMessageId);
                    await existingMessage.edit({ embeds: [embed], components: [row1, row2] });
                    console.log('Sticky message updated!');
                    return existingMessage;
                }
                catch (error) {
                    console.log('Old sticky message not found, creating new one');
                }
            }
            // Create new message if it doesn't exist
            const message = await textChannel.send({ embeds: [embed], components: [row1, row2] });
            console.log('Sticky message created!');
            try {
                await message.pin();
            }
            catch (error) {
                console.log('Could not pin message');
            }
            this.bot.db.updateStickyMessage(voiceChannelId, message.id);
            this.stickyMessages.set(textChannelId, message.id);
            return message;
        }
        catch (error) {
            console.error('Error creating sticky message:', error);
        }
    }
    async refreshStickyMessage(voiceChannelId) {
        const channelData = this.bot.db.getVoiceChannel(voiceChannelId);
        if (!channelData || !channelData.textChannelId)
            return;
        await this.createOrUpdateStickyMessage(channelData.textChannelId, voiceChannelId);
    }
    async handleMessageDelete(message) {
        const channels = this.bot.db.getAllVoiceChannels();
        const channelData = channels.find((vc) => vc.stickyMessageId === message.id);
        if (channelData && channelData.textChannelId) {
            await this.createOrUpdateStickyMessage(channelData.textChannelId, channelData.channelId);
        }
    }
}
exports.StickyMessageManager = StickyMessageManager;
//# sourceMappingURL=StickyMessageManager.js.map