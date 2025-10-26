import { Client, Collection } from 'discord.js';
import { DatabaseManager } from './database/DatabaseManager';
import { StickyMessageManager } from './managers/StickyMessageManager';
import { VoiceChannelManager } from './managers/VoiceChannelManager';
import { PermissionManager } from './managers/PermissionManager';
export declare class PremiumVCBot {
    client: Client;
    db: DatabaseManager;
    stickyManager: StickyMessageManager;
    vcManager: VoiceChannelManager;
    permissionManager: PermissionManager;
    commands: Collection<string, any>;
    constructor();
    start(): Promise<void>;
    private registerSlashCommands;
    private registerEvents;
    private handleButtonInteraction;
    private handleSelectMenuInteraction;
    private handleModalSubmit;
}
declare const bot: PremiumVCBot;
export default bot;
//# sourceMappingURL=index.d.ts.map