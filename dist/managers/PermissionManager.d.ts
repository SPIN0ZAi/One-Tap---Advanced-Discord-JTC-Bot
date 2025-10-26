import { VoiceChannel } from 'discord.js';
import { PremiumVCBot } from '../index';
export declare class PermissionManager {
    private bot;
    constructor(bot: PremiumVCBot);
    /**
     * Check if a user has permission to manage a voice channel
     * Owner, co-owners, and users with "cowner" role have access
     */
    hasPermission(userId: string, voiceChannelId: string, guildId: string): Promise<boolean>;
    /**
     * Check if the user is the channel owner (not co-owner)
     */
    isOwner(userId: string, voiceChannelId: string): boolean;
    /**
     * Check if user can perform owner-only actions (transfer, add co-owners, etc.)
     */
    canPerformOwnerAction(userId: string, voiceChannelId: string, guildId: string): Promise<boolean>;
    /**
     * Apply channel permissions based on whitelist/blacklist
     */
    applyChannelPermissions(voiceChannel: VoiceChannel): Promise<void>;
    /**
     * Lock the voice channel (only owner and co-owners can join)
     */
    lockChannel(voiceChannel: VoiceChannel): Promise<void>;
    /**
     * Unlock the voice channel
     */
    unlockChannel(voiceChannel: VoiceChannel): Promise<void>;
    /**
     * Hide the voice channel
     */
    hideChannel(voiceChannel: VoiceChannel): Promise<void>;
    /**
     * Unhide the voice channel
     */
    unhideChannel(voiceChannel: VoiceChannel): Promise<void>;
    /**
     * Reset all channel permissions to default
     */
    resetAllPermissions(voiceChannel: VoiceChannel): Promise<void>;
}
//# sourceMappingURL=PermissionManager.d.ts.map