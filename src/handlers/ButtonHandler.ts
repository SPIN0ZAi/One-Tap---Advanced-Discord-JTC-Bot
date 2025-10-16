import {
  ButtonInteraction,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  VoiceChannel,
  ChannelType,
  InteractionResponse,
  UserSelectMenuBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
} from 'discord.js';
import { PremiumVCBot } from '../index';
import { ButtonAction } from '../types';
import { createSuccessEmbed, createErrorEmbed, createInfoEmbed } from '../utils/embeds';

export class ButtonHandler {
  private bot: PremiumVCBot;

  constructor(bot: PremiumVCBot) {
    this.bot = bot;
  }

  async handle(interaction: ButtonInteraction) {
    try {
      // For modal buttons, show modal immediately to avoid timeout
      // Permission checks will be done in the modal handler
      if (interaction.customId === ButtonAction.CHANGE_NAME ||
          interaction.customId === ButtonAction.SET_LIMIT ||
          interaction.customId === ButtonAction.TRANSFER_OWNERSHIP ||
          interaction.customId === ButtonAction.SET_CUSTOM_GIF) {
        const voiceChannel = await this.getVoiceChannelFromInteraction(interaction);
        if (!voiceChannel) {
          return await interaction.reply({
            embeds: [createErrorEmbed('Voice channel not found or no longer exists.')],
            ephemeral: true,
          });
        }
        
        // Show modal immediately
        if (interaction.customId === ButtonAction.CHANGE_NAME) {
          return await this.handleChangeName(interaction, voiceChannel);
        } else if (interaction.customId === ButtonAction.SET_LIMIT) {
          return await this.handleSetLimit(interaction, voiceChannel);
        } else if (interaction.customId === ButtonAction.TRANSFER_OWNERSHIP) {
          return await this.handleTransferOwnership(interaction, voiceChannel);
        } else if (interaction.customId === ButtonAction.SET_CUSTOM_GIF) {
          return await this.handleSetCustomGif(interaction, voiceChannel);
        }
      }

      // For buttons that show new menus (don't defer for these)
      if (interaction.customId === ButtonAction.MANAGE_COOWNERS ||
          interaction.customId === ButtonAction.ADD_COOWNER ||
          interaction.customId === ButtonAction.REMOVE_COOWNER ||
          interaction.customId === ButtonAction.PERMIT_USER ||
          interaction.customId === ButtonAction.BLACKLIST_USER) {
        // Don't defer - these will reply with their own components
      } else {
        // For all other buttons, defer immediately to prevent timeout
        await interaction.deferReply({ ephemeral: true });
      }

      // Get voice channel from text channel
      const voiceChannel = await this.getVoiceChannelFromInteraction(interaction);
      if (!voiceChannel) {
        if (interaction.deferred) {
          return await interaction.editReply({
            embeds: [createErrorEmbed('Voice channel not found or no longer exists.')],
          });
        } else {
          return await interaction.reply({
            embeds: [createErrorEmbed('Voice channel not found or no longer exists.')],
            ephemeral: true,
          });
        }
      }

      // Check permissions
      const hasPermission = await this.bot.permissionManager.hasPermission(
        interaction.user.id,
        voiceChannel.id,
        interaction.guildId!
      );

      if (!hasPermission) {
        if (interaction.deferred) {
          return await interaction.editReply({
            embeds: [createErrorEmbed('You don\'t have permission to manage this voice channel.')],
          });
        } else {
          return await interaction.reply({
            embeds: [createErrorEmbed('You don\'t have permission to manage this voice channel.')],
            ephemeral: true,
          });
        }
      }

      // Route to appropriate handler
      switch (interaction.customId) {
        case ButtonAction.LOCK:
          await this.handleLock(interaction, voiceChannel);
          break;
        case ButtonAction.UNLOCK:
          await this.handleUnlock(interaction, voiceChannel);
          break;
        case ButtonAction.INFO:
          await this.handleInfo(interaction, voiceChannel);
          break;
        case ButtonAction.RESET_PERMISSIONS:
          await this.handleResetPermissions(interaction, voiceChannel);
          break;
        case ButtonAction.PERMIT_USER:
          await this.handlePermitUser(interaction, voiceChannel);
          break;
        case ButtonAction.BLACKLIST_USER:
          await this.handleBlacklistUser(interaction, voiceChannel);
          break;
        case ButtonAction.TOGGLE_SOUNDBOARD:
          await this.handleToggleSoundboard(interaction, voiceChannel);
          break;
        case ButtonAction.HIDE:
          await this.handleHide(interaction, voiceChannel);
          break;
        case ButtonAction.UNHIDE:
          await this.handleUnhide(interaction, voiceChannel);
          break;
        case ButtonAction.SHOW_OWNERSHIP:
          await this.handleShowOwnership(interaction, voiceChannel);
          break;
        case ButtonAction.TRANSFER_OWNERSHIP:
          await this.handleTransferOwnership(interaction, voiceChannel);
          break;
        case ButtonAction.CLAIM_OWNERSHIP:
          await this.handleClaimOwnership(interaction, voiceChannel);
          break;
        case ButtonAction.SLOWMODE:
          await this.handleSlowmode(interaction, voiceChannel);
          break;
        case ButtonAction.BITRATE:
          await this.handleBitrate(interaction, voiceChannel);
          break;
        case ButtonAction.SET_STATUS:
          await this.handleSetStatus(interaction, voiceChannel);
          break;
        case ButtonAction.LOCK_TEXT:
          await this.handleLockText(interaction, voiceChannel);
          break;
        case ButtonAction.MANAGE_COOWNERS:
          await this.handleManageCoOwners(interaction, voiceChannel);
          break;
        case ButtonAction.ADD_COOWNER:
          await this.handleAddCoOwner(interaction, voiceChannel);
          break;
        case ButtonAction.REMOVE_COOWNER:
          await this.handleRemoveCoOwner(interaction, voiceChannel);
          break;
        case ButtonAction.LIST_COOWNERS:
          await this.handleListCoOwners(interaction, voiceChannel);
          break;
        case ButtonAction.CLEAR_COOWNERS:
          await this.handleClearCoOwners(interaction, voiceChannel);
          break;
        case ButtonAction.BULK_ACTIONS:
          await this.handleBulkActions(interaction, voiceChannel);
          break;
        default:
          await interaction.reply({
            embeds: [createErrorEmbed('Unknown action.')],
            ephemeral: true,
          });
      }
    } catch (error) {
      console.error('Error handling button interaction:', error);
      // Don't try to reply if modal was shown or interaction already handled
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            embeds: [createErrorEmbed('An error occurred while processing your request.')],
            ephemeral: true,
          });
        }
      } catch (replyError) {
        // Silently ignore - interaction might have expired or been handled already
        console.error('Could not send error message:', replyError);
      }
    }
  }

  private async getVoiceChannelFromInteraction(interaction: ButtonInteraction): Promise<VoiceChannel | null> {
    // First check if the interaction is directly from a voice channel
    const channelData = this.bot.db.getVoiceChannel(interaction.channelId);
    
    if (channelData) {
      // Direct voice channel interaction
      try {
        const channel = await this.bot.client.channels.fetch(channelData.channelId);
        if (channel && channel.type === ChannelType.GuildVoice) {
          return channel as VoiceChannel;
        }
      } catch (error) {
        console.error('Error fetching voice channel:', error);
      }
    }
    
    // Fallback: check if it's from a text channel (old behavior)
    const channels = this.bot.db.getAllVoiceChannels();
    const textChannelMatch = channels.find(vc => vc.textChannelId === interaction.channelId);
    
    if (textChannelMatch) {
      try {
        const channel = await this.bot.client.channels.fetch(textChannelMatch.channelId);
        if (channel && channel.type === ChannelType.GuildVoice) {
          return channel as VoiceChannel;
        }
      } catch (error) {
        console.error('Error fetching voice channel:', error);
      }
    }

    return null;
  }

  // Handler Methods
  private async handleChangeName(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    // Immediately show modal to prevent timeout
    const modal = new ModalBuilder()
      .setCustomId('modal_change_name')
      .setTitle('Change Voice Channel Name');

    const nameInput = new TextInputBuilder()
      .setCustomId('name_input')
      .setLabel('New Channel Name')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(100)
      .setPlaceholder('Enter new channel name...')
      .setValue(voiceChannel.name)
      .setRequired(true);

    const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nameInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }

  private async handleLock(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    try {
      await this.bot.permissionManager.lockChannel(voiceChannel);
      await interaction.editReply({
        embeds: [createSuccessEmbed('🔒 Voice channel locked! Only you and co-owners can join.')],
      });
      await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to lock the channel. Please try again.')],
      });
    }
  }

  private async handleUnlock(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    try {
      await this.bot.permissionManager.unlockChannel(voiceChannel);
      await interaction.editReply({
        embeds: [createSuccessEmbed('🔓 Voice channel unlocked! Everyone can join now.')],
      });
      await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to unlock the channel. Please try again.')],
      });
    }
  }

  private async handleInfo(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    const stats = await this.bot.vcManager.getChannelStats(voiceChannel.id);
    
    if (!stats) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Channel information not found.')],
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('ℹ️ Voice Channel Information')
      .addFields(
        { name: '👑 Owner', value: `<@${stats.owner}>`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(stats.createdAt / 1000)}:R>`, inline: true },
        { name: '🔒 Locked', value: stats.locked ? 'Yes' : 'No', inline: true },
        { name: '👁️ Hidden', value: stats.hidden ? 'Yes' : 'No', inline: true },
        { name: '👥 User Limit', value: stats.userLimit === 0 ? 'Unlimited' : `${stats.userLimit}`, inline: true },
        { name: '🤝 Co-owners', value: stats.coowners.length > 0 ? stats.coowners.map((id: string) => `<@${id}>`).join(', ') : 'None', inline: false }
      )
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
  }

  private async handleSetLimit(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    const modal = new ModalBuilder()
      .setCustomId('modal_set_limit')
      .setTitle('Set User Limit');

    const limitInput = new TextInputBuilder()
      .setCustomId('limit_input')
      .setLabel('User Limit (0 for unlimited)')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(2)
      .setPlaceholder('0-99')
      .setValue(voiceChannel.userLimit.toString())
      .setRequired(true);

    const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(limitInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }

  private async handleSetCustomGif(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    const modal = new ModalBuilder()
      .setCustomId('modal_set_custom_gif')
      .setTitle('Set Custom GIF');

    const gifInput = new TextInputBuilder()
      .setCustomId('gif_url_input')
      .setLabel('GIF URL (Giphy, Tenor, or direct link)')
      .setStyle(TextInputStyle.Short)
      .setMinLength(10)
      .setMaxLength(500)
      .setPlaceholder('https://media.giphy.com/media/.../giphy.gif')
      .setRequired(true);

    const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(gifInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }

  private async handleResetPermissions(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    try {
      await this.bot.permissionManager.resetAllPermissions(voiceChannel);
      await interaction.editReply({
        embeds: [createSuccessEmbed('🔄 All channel permissions have been reset to default.')],
      });
      await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to reset permissions. Please try again.')],
      });
    }
  }

  private async handlePermitUser(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    // Get all members currently in the voice channel and in the guild
    const members = voiceChannel.members;
    
    if (members.size === 0) {
      return await interaction.reply({
        embeds: [createInfoEmbed('No users are currently in the voice channel. You can also mention a user by typing @username in your text channel and I\'ll help you permit them.')],
        ephemeral: true,
      });
    }

    const userSelect = new UserSelectMenuBuilder()
      .setCustomId('select_permit_user')
      .setPlaceholder('Select a user to permit')
      .setMinValues(1)
      .setMaxValues(1);

    const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelect);

    await interaction.reply({
      content: '👥 Select a user to permit access to this channel:',
      components: [row],
      ephemeral: true,
    });
  }

  private async handleBlacklistUser(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    // Get all members currently in the voice channel
    const members = voiceChannel.members;
    
    if (members.size === 0) {
      return await interaction.reply({
        embeds: [createInfoEmbed('No users are currently in the voice channel. You can also mention a user by typing @username in your text channel and I\'ll help you reject them.')],
        ephemeral: true,
      });
    }

    const userSelect = new UserSelectMenuBuilder()
      .setCustomId('select_blacklist_user')
      .setPlaceholder('Select a user to reject')
      .setMinValues(1)
      .setMaxValues(1);

    const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelect);

    await interaction.reply({
      content: '👥 Select a user to reject from this channel:',
      components: [row],
      ephemeral: true,
    });
  }

  private async handleToggleSoundboard(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    await interaction.deferReply({ ephemeral: true });
    
    const settings = this.bot.db.getSettings(voiceChannel.id);
    const newState = !settings.soundboardEnabled;
    
    try {
      await voiceChannel.edit({
        flags: newState ? [] : ['GuildVoiceSuppressSoundboardSounds' as any],
      });
      
      this.bot.db.updateSettings(voiceChannel.id, { soundboardEnabled: newState });
      
      await interaction.editReply({
        embeds: [createSuccessEmbed(`🎵 Soundboard ${newState ? 'enabled' : 'disabled'} successfully!`)],
      });
      await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to toggle soundboard. Please try again.')],
      });
    }
  }

  private async handleHide(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      await this.bot.permissionManager.hideChannel(voiceChannel);
      await interaction.editReply({
        embeds: [createSuccessEmbed('👁️ Voice channel hidden from everyone except you and co-owners.')],
      });
      await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to hide the channel. Please try again.')],
      });
    }
  }

  private async handleUnhide(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      await this.bot.permissionManager.unhideChannel(voiceChannel);
      await interaction.editReply({
        embeds: [createSuccessEmbed('👁️‍🗨️ Voice channel is now visible to everyone.')],
      });
      await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to unhide the channel. Please try again.')],
      });
    }
  }

  private async handleShowOwnership(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    await interaction.deferReply({ ephemeral: true });
    
    const channelData = this.bot.db.getVoiceChannel(voiceChannel.id);
    const coowners = this.bot.db.getCoOwners(voiceChannel.id);
    
    if (!channelData) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Channel data not found.')],
      });
    }
    
    let description = `**Owner:** <@${channelData.ownerId}>\n\n`;
    
    if (coowners.length > 0) {
      description += `**Co-Owners (${coowners.length}):**\n`;
      for (const coowner of coowners) {
        const permanent = coowner.isPermanent ? '🔒' : '';
        const addedDate = new Date(coowner.addedAt);
        description += `• <@${coowner.userId}> ${permanent}\n`;
        description += `  *Added <t:${Math.floor(coowner.addedAt / 1000)}:R> by <@${coowner.addedBy}>*\n`;
      }
    } else {
      description += `**Co-Owners:** None`;
    }
    
    const embed = createInfoEmbed(description);
    embed.setTitle('👑 Channel Ownership');
    
    await interaction.editReply({ embeds: [embed] });
  }

  private async handleTransferOwnership(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    const canTransfer = await this.bot.permissionManager.canPerformOwnerAction(
      interaction.user.id,
      voiceChannel.id,
      interaction.guildId!
    );
    
    if (!canTransfer) {
      return await interaction.reply({
        embeds: [createErrorEmbed('Only the channel owner can transfer ownership.')],
        ephemeral: true,
      });
    }
    
    const modal = new ModalBuilder()
      .setCustomId('modal_transfer_ownership')
      .setTitle('Transfer Ownership');

    const userInput = new TextInputBuilder()
      .setCustomId('user_input')
      .setLabel('New Owner (mention or ID)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('@user or user ID...')
      .setRequired(true);

    const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(userInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }

  private async handleClaimOwnership(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    await interaction.deferReply({ ephemeral: true });
    
    const channelData = this.bot.db.getVoiceChannel(voiceChannel.id);
    if (!channelData) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Channel data not found.')],
      });
    }
    
    // Check if owner is in the channel
    const ownerInChannel = voiceChannel.members.has(channelData.ownerId);
    
    if (ownerInChannel) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Cannot claim ownership while the current owner is in the channel.')],
      });
    }
    
    // Check if user is a co-owner or has permission
    const coowners = this.bot.db.getCoOwners(voiceChannel.id);
    const isCoOwner = coowners.some(co => co.userId === interaction.user.id);
    
    if (!isCoOwner) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Only co-owners can claim ownership when the owner is absent.')],
      });
    }
    
    // Transfer ownership
    this.bot.db.updateOwner(voiceChannel.id, interaction.user.id);
    this.bot.db.removeCoOwner(voiceChannel.id, interaction.user.id);
    
    await interaction.editReply({
      embeds: [createSuccessEmbed(`✋ You are now the owner of **${voiceChannel.name}**!`)],
    });
    
    await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
  }

  private async handleSlowmode(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    const modal = new ModalBuilder()
      .setCustomId('modal_slowmode')
      .setTitle('Set Slowmode');

    const slowmodeInput = new TextInputBuilder()
      .setCustomId('slowmode_input')
      .setLabel('Slowmode in seconds (0 to disable)')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(5)
      .setPlaceholder('0-21600')
      .setRequired(true);

    const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(slowmodeInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }

  private async handleBitrate(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    const modal = new ModalBuilder()
      .setCustomId('modal_bitrate')
      .setTitle('Set Bitrate');

    const bitrateInput = new TextInputBuilder()
      .setCustomId('bitrate_input')
      .setLabel('Bitrate in kbps (8-384)')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(3)
      .setPlaceholder('64, 96, 128, 256, 384...')
      .setValue((voiceChannel.bitrate / 1000).toString())
      .setRequired(true);

    const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(bitrateInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }

  private async handleSetStatus(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    const modal = new ModalBuilder()
      .setCustomId('modal_set_status')
      .setTitle('Set Voice Channel Status');

    const statusInput = new TextInputBuilder()
      .setCustomId('status_input')
      .setLabel('Channel Status')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(500)
      .setPlaceholder('Enter status message...')
      .setRequired(false);

    const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(statusInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }

  private async handleLockText(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    await interaction.deferReply({ ephemeral: true });
    
    const settings = this.bot.db.getSettings(voiceChannel.id);
    const newState = !settings.textChatLocked;
    
    const channelData = this.bot.db.getVoiceChannel(voiceChannel.id);
    if (!channelData?.textChannelId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Text channel not found.')],
      });
    }
    
    try {
      const textChannel = await this.bot.client.channels.fetch(channelData.textChannelId);
      if (textChannel && textChannel.type === ChannelType.GuildText) {
        await (textChannel as any).permissionOverwrites.edit(interaction.guild!.roles.everyone, {
          SendMessages: newState ? false : null,
        });
        
        this.bot.db.updateSettings(voiceChannel.id, { textChatLocked: newState });
        
        await interaction.editReply({
          embeds: [createSuccessEmbed(`💬 Text chat ${newState ? 'locked' : 'unlocked'} successfully!`)],
        });
        await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
      }
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to toggle text chat lock. Please try again.')],
      });
    }
  }

  private async handleManageCoOwners(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    const canManage = await this.bot.permissionManager.canPerformOwnerAction(
      interaction.user.id,
      voiceChannel.id,
      interaction.guildId!
    );
    
    if (!canManage) {
      return await interaction.reply({
        embeds: [createErrorEmbed('Only the channel owner can manage co-owners.')],
        ephemeral: true,
      });
    }
    
    // Get current co-owners
    const coowners = this.bot.db.getCoOwners(voiceChannel.id);
    
    // Show co-owner management menu with buttons
    const addButton = new ButtonBuilder()
      .setCustomId(ButtonAction.ADD_COOWNER)
      .setLabel('Add Co-owner')
      .setStyle(2) // Primary
      .setEmoji('➕');
    
    const removeButton = new ButtonBuilder()
      .setCustomId(ButtonAction.REMOVE_COOWNER)
      .setLabel('Remove Co-owner')
      .setStyle(2) // Primary
      .setEmoji('➖')
      .setDisabled(coowners.length === 0);
    
    const listButton = new ButtonBuilder()
      .setCustomId(ButtonAction.LIST_COOWNERS)
      .setLabel('List Co-owners')
      .setStyle(1) // Secondary
      .setEmoji('📋');
    
    const clearButton = new ButtonBuilder()
      .setCustomId(ButtonAction.CLEAR_COOWNERS)
      .setLabel('Clear All')
      .setStyle(4) // Danger
      .setEmoji('🗑️')
      .setDisabled(coowners.length === 0);
    
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(addButton, removeButton, listButton, clearButton);
    
    await interaction.reply({
      embeds: [createInfoEmbed(
        `**👑 Co-Owner Management**\n\n` +
        `Current co-owners: **${coowners.length}**\n\n` +
        `• **Add Co-owner** - Select a user to add as co-owner\n` +
        `• **Remove Co-owner** - Select a co-owner to remove\n` +
        `• **List Co-owners** - View all current co-owners\n` +
        `• **Clear All** - Remove all co-owners`
      )],
      components: [row],
      ephemeral: true,
    });
  }

  private async handleAddCoOwner(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    // Show user select menu
    const userSelect = new UserSelectMenuBuilder()
      .setCustomId('select_add_coowner')
      .setPlaceholder('Select a user to add as co-owner')
      .setMinValues(1)
      .setMaxValues(1);

    const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelect);

    await interaction.reply({
      embeds: [createInfoEmbed('Select a user to add as co-owner:')],
      components: [row],
      ephemeral: true,
    });
  }

  private async handleRemoveCoOwner(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    const coowners = this.bot.db.getCoOwners(voiceChannel.id);
    
    if (coowners.length === 0) {
      return await interaction.reply({
        embeds: [createErrorEmbed('There are no co-owners to remove.')],
        ephemeral: true,
      });
    }

    // Show user select menu with only current co-owners
    const userSelect = new UserSelectMenuBuilder()
      .setCustomId('select_remove_coowner')
      .setPlaceholder('Select a co-owner to remove')
      .setMinValues(1)
      .setMaxValues(1);

    const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelect);

    const coownerList = coowners.map(co => `<@${co.userId}>`).join(', ');

    await interaction.reply({
      embeds: [createInfoEmbed(`**Current Co-owners:**\n${coownerList}\n\nSelect a user to remove:`)],
      components: [row],
      ephemeral: true,
    });
  }

  private async handleListCoOwners(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    await interaction.deferReply({ ephemeral: true });
    
    const channelData = this.bot.db.getVoiceChannel(voiceChannel.id);
    const coowners = this.bot.db.getCoOwners(voiceChannel.id);
    
    if (!channelData) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Channel data not found.')],
      });
    }
    
    let description = `**Owner:** <@${channelData.ownerId}>\n\n`;
    
    if (coowners.length > 0) {
      description += `**Co-Owners (${coowners.length}):**\n`;
      for (const coowner of coowners) {
        const permanent = coowner.isPermanent ? '🔒' : '';
        description += `• <@${coowner.userId}> ${permanent}\n`;
        description += `  *Added <t:${Math.floor(coowner.addedAt / 1000)}:R> by <@${coowner.addedBy}>*\n`;
      }
    } else {
      description += `**Co-Owners:** None`;
    }
    
    const embed = createInfoEmbed(description);
    embed.setTitle('👑 Channel Ownership');
    
    await interaction.editReply({ embeds: [embed] });
  }

  private async handleClearCoOwners(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    const coowners = this.bot.db.getCoOwners(voiceChannel.id);
    
    if (coowners.length === 0) {
      return await interaction.reply({
        embeds: [createErrorEmbed('There are no co-owners to clear.')],
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    // Remove all co-owners
    for (const coowner of coowners) {
      this.bot.db.removeCoOwner(voiceChannel.id, coowner.userId);
    }

    await interaction.editReply({
      embeds: [createSuccessEmbed(`Removed all ${coowners.length} co-owner(s).`)],
    });
  }

  private async handleBulkActions(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
    await interaction.reply({
      embeds: [createInfoEmbed(
        '**⚡ Bulk Actions Menu**\n\n' +
        'Use the manage co-owners button to:\n' +
        '• Batch reject multiple users\n' +
        '• Batch whitelist multiple roles\n' +
        '• Clear all permissions at once\n\n' +
        'For advanced bulk operations, use the `/bulk` command (coming soon).'
      )],
      ephemeral: true,
    });
  }
}
