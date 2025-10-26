import { VoiceChannelData, CoOwner, ChannelPermission, ChannelSettings, SetupConfig } from '../types';
export declare class DatabaseManager {
    private db;
    private dbPath;
    constructor();
    initialize(): Promise<void>;
    private createTables;
    setSetupConfig(config: SetupConfig): void;
    getSetupConfig(guildId: string): SetupConfig | null;
    deleteSetupConfig(guildId: string): void;
    createVoiceChannel(data: VoiceChannelData): void;
    getVoiceChannel(channelId: string): VoiceChannelData | null;
    updateStickyMessage(channelId: string, messageId: string): void;
    updateOwner(channelId: string, newOwnerId: string): void;
    setUserCustomGif(userId: string, guildId: string, gifUrl: string | null): void;
    getUserCustomGif(userId: string, guildId: string): string | null;
    setCustomGif(channelId: string, gifUrl: string | null): void;
    getCustomGif(channelId: string): string | null;
    deleteVoiceChannel(channelId: string): void;
    getAllVoiceChannels(): VoiceChannelData[];
    addCoOwner(coowner: CoOwner): void;
    removeCoOwner(channelId: string, userId: string): void;
    getCoOwners(channelId: string): CoOwner[];
    clearCoOwners(channelId: string): void;
    addPermission(permission: ChannelPermission): void;
    removePermission(channelId: string, targetId: string, permissionType: string): void;
    getPermissions(channelId: string): ChannelPermission[];
    getSettings(channelId: string): ChannelSettings;
    updateSettings(channelId: string, settings: Partial<ChannelSettings>): void;
}
//# sourceMappingURL=DatabaseManager.d.ts.map