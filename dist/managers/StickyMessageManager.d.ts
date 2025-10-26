import { PremiumVCBot } from '../index';
export declare class StickyMessageManager {
    private bot;
    private stickyMessages;
    constructor(bot: PremiumVCBot);
    initializeAllStickyMessages(): Promise<void>;
    createOrUpdateStickyMessage(textChannelId: string, voiceChannelId: string): Promise<import("discord.js").Message<true> | undefined>;
    refreshStickyMessage(voiceChannelId: string): Promise<void>;
    handleMessageDelete(message: any): Promise<void>;
}
//# sourceMappingURL=StickyMessageManager.d.ts.map