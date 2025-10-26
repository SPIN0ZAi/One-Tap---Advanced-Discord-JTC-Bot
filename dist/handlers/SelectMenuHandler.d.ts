import { StringSelectMenuInteraction, UserSelectMenuInteraction } from 'discord.js';
import { PremiumVCBot } from '../index';
export declare class SelectMenuHandler {
    private bot;
    constructor(bot: PremiumVCBot);
    handle(interaction: StringSelectMenuInteraction | UserSelectMenuInteraction): Promise<void>;
    private handleUserSelectMenu;
    private handleStringSelectMenu;
    private getVoiceChannelFromInteraction;
    private handlePermitUserSelect;
    private handleBlacklistUserSelect;
    private handleAddCoOwnerSelect;
    private handleRemoveCoOwnerSelect;
}
//# sourceMappingURL=SelectMenuHandler.d.ts.map