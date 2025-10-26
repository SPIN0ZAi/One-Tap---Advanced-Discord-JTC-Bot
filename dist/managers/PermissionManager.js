"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionManager = void 0;
const discord_js_1 = require("discord.js");
class PermissionManager {
    bot;
    constructor(bot) {
        this.bot = bot;
    }
    /**
     * Check if a user has permission to manage a voice channel
     * Owner, co-owners, and users with "cowner" role have access
     */
    async hasPermission(userId, voiceChannelId, guildId) {
        const channelData = this.bot.db.getVoiceChannel(voiceChannelId);
        if (!channelData)
            return false;
        // Check if user is the owner
        if (channelData.ownerId === userId)
            return true;
        // Check if user is a co-owner
        const coowners = this.bot.db.getCoOwners(voiceChannelId);
        if (coowners.some(co => co.userId === userId))
            return true;
        // Check if user has the "cowner" role
        try {
            const guild = await this.bot.client.guilds.fetch(guildId);
            const member = await guild.members.fetch(userId);
            const cownerRole = guild.roles.cache.find(role => role.name.toLowerCase() === 'cowner' ||
                role.name.toLowerCase() === 'channel owner' ||
                role.name.toLowerCase() === 'vc manager');
            if (cownerRole && member.roles.cache.has(cownerRole.id))
                return true;
            // Check for administrator permission
            if (member.permissions.has(discord_js_1.PermissionFlagsBits.Administrator))
                return true;
        }
        catch (error) {
            console.error('Error checking permissions:', error);
        }
        return false;
    }
    /**
     * Check if the user is the channel owner (not co-owner)
     */
    isOwner(userId, voiceChannelId) {
        const channelData = this.bot.db.getVoiceChannel(voiceChannelId);
        return channelData?.ownerId === userId;
    }
    /**
     * Check if user can perform owner-only actions (transfer, add co-owners, etc.)
     */
    async canPerformOwnerAction(userId, voiceChannelId, guildId) {
        if (this.isOwner(userId, voiceChannelId))
            return true;
        // Check for administrator permission
        try {
            const guild = await this.bot.client.guilds.fetch(guildId);
            const member = await guild.members.fetch(userId);
            if (member.permissions.has(discord_js_1.PermissionFlagsBits.Administrator))
                return true;
        }
        catch (error) {
            console.error('Error checking owner permissions:', error);
        }
        return false;
    }
    /**
     * Apply channel permissions based on whitelist/blacklist
     */
    async applyChannelPermissions(voiceChannel) {
        const permissions = this.bot.db.getPermissions(voiceChannel.id);
        const channelData = this.bot.db.getVoiceChannel(voiceChannel.id);
        if (!channelData)
            return;
        try {
            // Get all current permission overwrites
            const currentOverwrites = voiceChannel.permissionOverwrites.cache;
            // Apply rejected users - strict deny all voice permissions
            const blacklists = permissions.filter(p => p.permissionType === 'blacklist');
            for (const blacklist of blacklists) {
                await voiceChannel.permissionOverwrites.edit(blacklist.targetId, {
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
            }
            // Apply whitelists
            const whitelists = permissions.filter(p => p.permissionType === 'whitelist');
            for (const whitelist of whitelists) {
                await voiceChannel.permissionOverwrites.edit(whitelist.targetId, {
                    Connect: true,
                    ViewChannel: true,
                });
            }
            // Always ensure owner has full access
            await voiceChannel.permissionOverwrites.edit(channelData.ownerId, {
                Connect: true,
                ViewChannel: true,
                ManageChannels: true,
                MoveMembers: true,
                MuteMembers: true,
                DeafenMembers: true,
            });
            // Ensure co-owners have access
            const coowners = this.bot.db.getCoOwners(voiceChannel.id);
            for (const coowner of coowners) {
                await voiceChannel.permissionOverwrites.edit(coowner.userId, {
                    Connect: true,
                    ViewChannel: true,
                    ManageChannels: false,
                    MoveMembers: true,
                    MuteMembers: true,
                });
            }
        }
        catch (error) {
            console.error('Error applying channel permissions:', error);
        }
    }
    /**
     * Lock the voice channel (only owner and co-owners can join)
     */
    async lockChannel(voiceChannel) {
        try {
            await voiceChannel.permissionOverwrites.edit(voiceChannel.guild.roles.everyone, {
                Connect: false,
            });
            const channelData = this.bot.db.getVoiceChannel(voiceChannel.id);
            if (!channelData)
                return;
            // Ensure owner can connect
            await voiceChannel.permissionOverwrites.edit(channelData.ownerId, {
                Connect: true,
            });
            // Ensure co-owners can connect
            const coowners = this.bot.db.getCoOwners(voiceChannel.id);
            for (const coowner of coowners) {
                await voiceChannel.permissionOverwrites.edit(coowner.userId, {
                    Connect: true,
                });
            }
        }
        catch (error) {
            console.error('Error locking channel:', error);
            throw error;
        }
    }
    /**
     * Unlock the voice channel
     */
    async unlockChannel(voiceChannel) {
        try {
            await voiceChannel.permissionOverwrites.edit(voiceChannel.guild.roles.everyone, {
                Connect: null, // Reset to default
            });
        }
        catch (error) {
            console.error('Error unlocking channel:', error);
            throw error;
        }
    }
    /**
     * Hide the voice channel
     */
    async hideChannel(voiceChannel) {
        try {
            await voiceChannel.permissionOverwrites.edit(voiceChannel.guild.roles.everyone, {
                ViewChannel: false,
            });
            const channelData = this.bot.db.getVoiceChannel(voiceChannel.id);
            if (!channelData)
                return;
            // Ensure owner can see
            await voiceChannel.permissionOverwrites.edit(channelData.ownerId, {
                ViewChannel: true,
            });
            // Ensure co-owners can see
            const coowners = this.bot.db.getCoOwners(voiceChannel.id);
            for (const coowner of coowners) {
                await voiceChannel.permissionOverwrites.edit(coowner.userId, {
                    ViewChannel: true,
                });
            }
        }
        catch (error) {
            console.error('Error hiding channel:', error);
            throw error;
        }
    }
    /**
     * Unhide the voice channel
     */
    async unhideChannel(voiceChannel) {
        try {
            await voiceChannel.permissionOverwrites.edit(voiceChannel.guild.roles.everyone, {
                ViewChannel: null, // Reset to default
            });
        }
        catch (error) {
            console.error('Error unhiding channel:', error);
            throw error;
        }
    }
    /**
     * Reset all channel permissions to default
     */
    async resetAllPermissions(voiceChannel) {
        try {
            // Clear all permission overwrites except owner
            const channelData = this.bot.db.getVoiceChannel(voiceChannel.id);
            if (!channelData)
                return;
            for (const [id, overwrite] of voiceChannel.permissionOverwrites.cache) {
                if (id !== channelData.ownerId) {
                    await overwrite.delete();
                }
            }
            // Clear database permissions
            const permissions = this.bot.db.getPermissions(voiceChannel.id);
            for (const perm of permissions) {
                this.bot.db.removePermission(voiceChannel.id, perm.targetId, perm.permissionType);
            }
        }
        catch (error) {
            console.error('Error resetting permissions:', error);
            throw error;
        }
    }
}
exports.PermissionManager = PermissionManager;
//# sourceMappingURL=PermissionManager.js.map