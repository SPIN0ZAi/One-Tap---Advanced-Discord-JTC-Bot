import { VoiceState } from 'discord.js';
import { PremiumVCBot } from '../index';
export declare class VoiceChannelManager {
    private bot;
    private db;
    private stickyMessageManager;
    private deletionTimers;
    constructor(bot: PremiumVCBot);
    handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void>;
    private createPersonalVoiceChannel;
    private handleChannelLeave;
    handleChannelDelete(channelId: string): Promise<void>;
    getChannelStats(channelId: string): Promise<any>;
}
//# sourceMappingURL=VoiceChannelManager.d.ts.map