import { ButtonInteraction, InteractionResponse } from 'discord.js';
import { PremiumVCBot } from '../index';
export declare class ButtonHandler {
    private bot;
    constructor(bot: PremiumVCBot);
    handle(interaction: ButtonInteraction): Promise<void | InteractionResponse<boolean> | import("discord.js").Message<boolean>>;
    private getVoiceChannelFromInteraction;
    private handleChangeName;
    private handleLock;
    private handleUnlock;
    private handleInfo;
    private handleSetLimit;
    private handleSetCustomGif;
    private handleResetPermissions;
    private handlePermitUser;
    private handleBlacklistUser;
    private handleToggleSoundboard;
    private handleHide;
    private handleUnhide;
    private handleShowOwnership;
    private handleTransferOwnership;
    private handleClaimOwnership;
    private handleSlowmode;
    private handleBitrate;
    private handleSetStatus;
    private handleLockText;
    private handleManageCoOwners;
    private handleAddCoOwner;
    private handleRemoveCoOwner;
    private handleListCoOwners;
    private handleClearCoOwners;
    private handleBulkActions;
}
//# sourceMappingURL=ButtonHandler.d.ts.map