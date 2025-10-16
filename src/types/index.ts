export interface VoiceChannelData {
  channelId: string;
  guildId: string;
  ownerId: string;
  createdAt: number;
  stickyMessageId?: string;
  textChannelId?: string;
  isTemporary?: boolean;
  customGif?: string;
}

export interface SetupConfig {
  guildId: string;
  jtcChannelId: string;
  categoryId?: string;
  textCategoryId?: string;
  channelNameFormat?: string;
  createdAt: number;
}

export interface CoOwner {
  channelId: string;
  userId: string;
  addedBy: string;
  addedAt: number;
  isPermanent: boolean;
}

export interface ChannelPermission {
  channelId: string;
  targetId: string; // User ID or Role ID
  targetType: 'user' | 'role';
  permissionType: 'whitelist' | 'blacklist';
  addedBy: string;
  addedAt: number;
}

export interface ChannelSettings {
  channelId: string;
  soundboardEnabled: boolean;
  slowmode: number;
  textChatLocked: boolean;
}

export enum ButtonAction {
  CHANGE_NAME = 'vc_change_name',
  LOCK = 'vc_lock',
  UNLOCK = 'vc_unlock',
  INFO = 'vc_info',
  SET_LIMIT = 'vc_set_limit',
  RESET_PERMISSIONS = 'vc_reset_perms',
  PERMIT_USER = 'vc_permit_user',
  PERMIT_ROLE = 'vc_permit_role',
  REMOVE_PERMISSION = 'vc_remove_perm',
  TOGGLE_SOUNDBOARD = 'vc_toggle_soundboard',
  HIDE = 'vc_hide',
  UNHIDE = 'vc_unhide',
  SHOW_OWNERSHIP = 'vc_show_ownership',
  TRANSFER_OWNERSHIP = 'vc_transfer_ownership',
  CLAIM_OWNERSHIP = 'vc_claim_ownership',
  SLOWMODE = 'vc_slowmode',
  BITRATE = 'vc_bitrate',
  MUTE_USER_TEXT = 'vc_mute_text',
  UNMUTE_USER_TEXT = 'vc_unmute_text',
  SET_STATUS = 'vc_set_status',
  LOCK_TEXT = 'vc_lock_text',
  UNLOCK_TEXT = 'vc_unlock_text',
  BLACKLIST_USER = 'vc_blacklist_user',
  BLACKLIST_ROLE = 'vc_blacklist_role',
  WHITELIST_USER = 'vc_whitelist_user',
  WHITELIST_ROLE = 'vc_whitelist_role',
  MANAGE_COOWNERS = 'vc_manage_coowners',
  ADD_COOWNER = 'vc_add_coowner',
  REMOVE_COOWNER = 'vc_remove_coowner',
  LIST_COOWNERS = 'vc_list_coowners',
  CLEAR_COOWNERS = 'vc_clear_coowners',
  BULK_ACTIONS = 'vc_bulk_actions',
  SET_CUSTOM_GIF = 'vc_set_custom_gif',
}
