import { ModalSubmitInteraction } from 'discord.js';
import { PremiumVCBot } from '../index';
export declare class ModalHandler {
    private bot;
    constructor(bot: PremiumVCBot);
    handle(interaction: ModalSubmitInteraction): Promise<import("discord.js").InteractionResponse<boolean> | undefined>;
    private getVoiceChannelFromInteraction;
    private handleChangeName;
    private handleSetLimit;
    private handleSetCustomGif;
    private handlePermitUser;
    private handleBlacklistUser;
    private handleTransferOwnership;
    private handleSlowmode;
    private handleBitrate;
    private handleSetStatus;
    private handleManageCoOwners;
    private extractId;
    private determineTargetType;
}
//# sourceMappingURL=ModalHandler.d.ts.map