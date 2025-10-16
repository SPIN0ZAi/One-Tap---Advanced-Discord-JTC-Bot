import { ModalSubmitInteraction, VoiceChannel, ChannelType } from 'discord.js';
import { PremiumVCBot } from '../index';
import { createSuccessEmbed, createErrorEmbed, createWarningEmbed } from '../utils/embeds';

export class ModalHandler {
  private bot: PremiumVCBot;

  constructor(bot: PremiumVCBot) {
    this.bot = bot;
  }

  async handle(interaction: ModalSubmitInteraction) {
    try {
      const voiceChannel = await this.getVoiceChannelFromInteraction(interaction);
      if (!voiceChannel) {
        return await interaction.reply({
          embeds: [createErrorEmbed('Voice channel not found.')],
          ephemeral: true,
        });
      }

      // Check permissions
      const hasPermission = await this.bot.permissionManager.hasPermission(
        interaction.user.id,
        voiceChannel.id,
        interaction.guildId!
      );

      if (!hasPermission) {
        return await interaction.reply({
          embeds: [createErrorEmbed('You don\'t have permission to manage this voice channel.')],
          ephemeral: true,
        });
      }

      // Route to appropriate handler
      switch (interaction.customId) {
        case 'modal_change_name':
          await this.handleChangeName(interaction, voiceChannel);
          break;
        case 'modal_set_limit':
          await this.handleSetLimit(interaction, voiceChannel);
          break;
        case 'modal_set_custom_gif':
          await this.handleSetCustomGif(interaction, voiceChannel);
          break;
        case 'modal_permit_user':
          await this.handlePermitUser(interaction, voiceChannel);
          break;
        case 'modal_blacklist_user':
          await this.handleBlacklistUser(interaction, voiceChannel);
          break;
        case 'modal_transfer_ownership':
          await this.handleTransferOwnership(interaction, voiceChannel);
          break;
        case 'modal_slowmode':
          await this.handleSlowmode(interaction, voiceChannel);
          break;
        case 'modal_bitrate':
          await this.handleBitrate(interaction, voiceChannel);
          break;
        case 'modal_set_status':
          await this.handleSetStatus(interaction, voiceChannel);
          break;
        case 'modal_manage_coowners':
          await this.handleManageCoOwners(interaction, voiceChannel);
          break;
        default:
          await interaction.reply({
            embeds: [createErrorEmbed('Unknown modal action.')],
            ephemeral: true,
          });
      }
    } catch (error) {
      console.error('Error handling modal:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          embeds: [createErrorEmbed('An error occurred while processing your request.')],
          ephemeral: true,
        });
      }
    }
  }

  private async getVoiceChannelFromInteraction(interaction: ModalSubmitInteraction): Promise<VoiceChannel | null> {
    // First check if the interaction is directly from a voice channel
    if (interaction.channelId) {
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
    }

    return null;
  }

  private async handleChangeName(interaction: ModalSubmitInteraction, voiceChannel: VoiceChannel) {
    const newName = interaction.fields.getTextInputValue('name_input');
    
    await interaction.deferReply({ ephemeral: true });
    
    try {
      await voiceChannel.setName(newName);
      await interaction.editReply({
        embeds: [createSuccessEmbed(`Channel name changed to **${newName}**`)],
      });
      await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to change channel name. Please try again.')],
      });
    }
  }

  private async handleSetLimit(interaction: ModalSubmitInteraction, voiceChannel: VoiceChannel) {
    const limitStr = interaction.fields.getTextInputValue('limit_input');
    const limit = parseInt(limitStr);
    
    if (isNaN(limit) || limit < 0 || limit > 99) {
      return await interaction.reply({
        embeds: [createErrorEmbed('Invalid limit. Please enter a number between 0 and 99.')],
        ephemeral: true,
      });
    }
    
    await interaction.deferReply({ ephemeral: true });
    
    try {
      await voiceChannel.setUserLimit(limit);
      const message = limit === 0 ? 'User limit removed (unlimited)' : `User limit set to **${limit}**`;
      await interaction.editReply({
        embeds: [createSuccessEmbed(message)],
      });
      await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to set user limit. Please try again.')],
      });
    }
  }

  private async handleSetCustomGif(interaction: ModalSubmitInteraction, voiceChannel: VoiceChannel) {
    const gifUrl = interaction.fields.getTextInputValue('gif_url_input').trim();
    
    // Defer immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    // Basic URL validation
    if (!gifUrl.startsWith('http://') && !gifUrl.startsWith('https://')) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Invalid URL. Please provide a valid HTTP/HTTPS link.')],
      });
    }
    
    try {
      // Save custom GIF to user preferences (persists across all channels)
      this.bot.db.setUserCustomGif(interaction.user.id, interaction.guildId!, gifUrl);
      
      await interaction.editReply({
        embeds: [createSuccessEmbed(`🎨 Custom GIF saved! It will appear in all your future channels. Leave and rejoin to see it now!`)],
      });
      
      console.log(`✅ User ${interaction.user.tag} set custom GIF: ${gifUrl}`);
    } catch (error) {
      console.error('Error setting custom GIF:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to set custom GIF. Please try again.')],
      });
    }
  }

  private async handlePermitUser(interaction: ModalSubmitInteraction, voiceChannel: VoiceChannel) {
    const targetStr = interaction.fields.getTextInputValue('target_input');
    
    await interaction.deferReply({ ephemeral: true });
    
    const targetId = this.extractId(targetStr);
    if (!targetId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Invalid user or role. Please use a mention or valid ID.')],
      });
    }
    
    // Determine if it's a user or role
    const targetType = await this.determineTargetType(interaction.guildId!, targetId);
    
    if (!targetType) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Could not find user or role with that ID.')],
      });
    }
    
    try {
      // Add to whitelist
      this.bot.db.addPermission({
        channelId: voiceChannel.id,
        targetId: targetId,
        targetType: targetType,
        permissionType: 'whitelist',
        addedBy: interaction.user.id,
        addedAt: Date.now(),
      });
      
      // Apply permissions
      await voiceChannel.permissionOverwrites.edit(targetId, {
        Connect: true,
        ViewChannel: true,
      });
      
      const targetMention = targetType === 'user' ? `<@${targetId}>` : `<@&${targetId}>`;
      await interaction.editReply({
        embeds: [createSuccessEmbed(`${targetMention} has been permitted to join the channel.`)],
      });
      await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to permit user/role. Please try again.')],
      });
    }
  }

  private async handleBlacklistUser(interaction: ModalSubmitInteraction, voiceChannel: VoiceChannel) {
    const targetStr = interaction.fields.getTextInputValue('target_input');
    
    await interaction.deferReply({ ephemeral: true });
    
    const targetId = this.extractId(targetStr);
    if (!targetId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Invalid user or role. Please use a mention or valid ID.')],
      });
    }
    
    // Check if trying to reject owner
    const channelData = this.bot.db.getVoiceChannel(voiceChannel.id);
    if (channelData && targetId === channelData.ownerId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('You cannot reject the channel owner.')],
      });
    }
    
    const targetType = await this.determineTargetType(interaction.guildId!, targetId);
    
    if (!targetType) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Could not find user or role with that ID.')],
      });
    }
    
    try {
      // Add to reject list
      this.bot.db.addPermission({
        channelId: voiceChannel.id,
        targetId: targetId,
        targetType: targetType,
        permissionType: 'blacklist',
        addedBy: interaction.user.id,
        addedAt: Date.now(),
      });
      
      // Apply strict permissions - explicit deny for ALL voice permissions
      await voiceChannel.permissionOverwrites.edit(targetId, {
        ViewChannel: false,
        Connect: false,
        Speak: false,
        Stream: false,
        UseVAD: false,
        PrioritySpeaker: false,
        MuteMembers: false,
        DeafenMembers: false,
        MoveMembers: false,
      });
      
      // Disconnect the user if they're in the channel
      if (targetType === 'user') {
        const member = voiceChannel.members.get(targetId);
        if (member) {
          await member.voice.disconnect('Rejected from voice channel');
        }
      }
      
      const targetMention = targetType === 'user' ? `<@${targetId}>` : `<@&${targetId}>`;
      await interaction.editReply({
        embeds: [createSuccessEmbed(`${targetMention} has been rejected from the channel.`)],
      });
      await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to reject user/role. Please try again.')],
      });
    }
  }

  private async handleTransferOwnership(interaction: ModalSubmitInteraction, voiceChannel: VoiceChannel) {
    const userStr = interaction.fields.getTextInputValue('user_input');
    
    await interaction.deferReply({ ephemeral: true });
    
    const userId = this.extractId(userStr);
    if (!userId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Invalid user. Please use a mention or valid user ID.')],
      });
    }
    
    // Verify user exists in guild
    try {
      const guild = await this.bot.client.guilds.fetch(interaction.guildId!);
      const member = await guild.members.fetch(userId);
      
      if (!member) {
        return await interaction.editReply({
          embeds: [createErrorEmbed('User not found in this server.')],
        });
      }
      
      // Transfer ownership
      this.bot.db.updateOwner(voiceChannel.id, userId);
      
      // Update permissions
      await voiceChannel.permissionOverwrites.edit(userId, {
        Connect: true,
        ViewChannel: true,
        ManageChannels: true,
        MoveMembers: true,
        MuteMembers: true,
        DeafenMembers: true,
      });
      
      await interaction.editReply({
        embeds: [createSuccessEmbed(`Ownership transferred to <@${userId}> successfully!`)],
      });
      await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to transfer ownership. Please try again.')],
      });
    }
  }

  private async handleSlowmode(interaction: ModalSubmitInteraction, voiceChannel: VoiceChannel) {
    const slowmodeStr = interaction.fields.getTextInputValue('slowmode_input');
    const slowmode = parseInt(slowmodeStr);
    
    if (isNaN(slowmode) || slowmode < 0 || slowmode > 21600) {
      return await interaction.reply({
        embeds: [createErrorEmbed('Invalid slowmode. Please enter a number between 0 and 21600 seconds.')],
        ephemeral: true,
      });
    }
    
    await interaction.deferReply({ ephemeral: true });
    
    const channelData = this.bot.db.getVoiceChannel(voiceChannel.id);
    if (!channelData?.textChannelId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Text channel not found.')],
      });
    }
    
    try {
      const textChannel = await this.bot.client.channels.fetch(channelData.textChannelId);
      if (textChannel && textChannel.type === ChannelType.GuildText) {
        await (textChannel as any).setRateLimitPerUser(slowmode);
        this.bot.db.updateSettings(voiceChannel.id, { slowmode });
        
        const message = slowmode === 0 ? 'Slowmode disabled' : `Slowmode set to **${slowmode} seconds**`;
        await interaction.editReply({
          embeds: [createSuccessEmbed(message)],
        });
        await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
      }
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to set slowmode. Please try again.')],
      });
    }
  }

  private async handleBitrate(interaction: ModalSubmitInteraction, voiceChannel: VoiceChannel) {
    const bitrateStr = interaction.fields.getTextInputValue('bitrate_input');
    const bitrate = parseInt(bitrateStr);
    
    if (isNaN(bitrate) || bitrate < 8 || bitrate > 384) {
      return await interaction.reply({
        embeds: [createErrorEmbed('Invalid bitrate. Please enter a number between 8 and 384 kbps.')],
        ephemeral: true,
      });
    }
    
    await interaction.deferReply({ ephemeral: true });
    
    // Check for premium warning
    if (bitrate > 64) {
      const warning = createWarningEmbed(
        `Setting bitrate above 64kbps requires a boosted server or premium features. ` +
        `Current: **${bitrate} kbps**`
      );
      await interaction.followUp({
        embeds: [warning],
        ephemeral: true,
      });
    }
    
    try {
      await voiceChannel.setBitrate(bitrate * 1000);
      await interaction.editReply({
        embeds: [createSuccessEmbed(`Bitrate set to **${bitrate} kbps**`)],
      });
      await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
    } catch (error: any) {
      let errorMessage = 'Failed to set bitrate. ';
      if (error.code === 50035) {
        errorMessage += 'The bitrate is too high for this server\'s boost level.';
      } else {
        errorMessage += 'Please try again.';
      }
      await interaction.editReply({
        embeds: [createErrorEmbed(errorMessage)],
      });
    }
  }

  private async handleSetStatus(interaction: ModalSubmitInteraction, voiceChannel: VoiceChannel) {
    const status = interaction.fields.getTextInputValue('status_input');
    
    await interaction.deferReply({ ephemeral: true });
    
    try {
      if (status.trim().length === 0) {
        // Clear status
        await (voiceChannel as any).setStatus(null);
        await interaction.editReply({
          embeds: [createSuccessEmbed('Voice channel status cleared.')],
        });
      } else {
        await (voiceChannel as any).setStatus(status);
        await interaction.editReply({
          embeds: [createSuccessEmbed(`Voice channel status set to: **${status}**`)],
        });
      }
      await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to set status. This feature may require a boosted server.')],
      });
    }
  }

  private async handleManageCoOwners(interaction: ModalSubmitInteraction, voiceChannel: VoiceChannel) {
    const action = interaction.fields.getTextInputValue('action_input').toLowerCase().trim();
    const targetStr = interaction.fields.getTextInputValue('target_input');
    
    await interaction.deferReply({ ephemeral: true });
    
    if (action === 'list') {
      const coowners = this.bot.db.getCoOwners(voiceChannel.id);
      if (coowners.length === 0) {
        return await interaction.editReply({
          embeds: [createSuccessEmbed('No co-owners set for this channel.')],
        });
      }
      
      let list = '**Co-Owners:**\n';
      for (const coowner of coowners) {
        const permanent = coowner.isPermanent ? '🔒 ' : '';
        list += `${permanent}<@${coowner.userId}>\n`;
      }
      
      return await interaction.editReply({
        embeds: [createSuccessEmbed(list)],
      });
    }
    
    if (action === 'clear') {
      this.bot.db.clearCoOwners(voiceChannel.id);
      return await interaction.editReply({
        embeds: [createSuccessEmbed('All co-owners have been removed.')],
      });
    }
    
    const targetId = this.extractId(targetStr);
    if (!targetId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Please provide a valid user mention or ID.')],
      });
    }
    
    if (action === 'add') {
      // Verify user exists
      try {
        const guild = await this.bot.client.guilds.fetch(interaction.guildId!);
        const member = await guild.members.fetch(targetId);
        
        if (!member) {
          return await interaction.editReply({
            embeds: [createErrorEmbed('User not found in this server.')],
          });
        }
        
        this.bot.db.addCoOwner({
          channelId: voiceChannel.id,
          userId: targetId,
          addedBy: interaction.user.id,
          addedAt: Date.now(),
          isPermanent: false,
        });
        
        // Grant permissions
        await voiceChannel.permissionOverwrites.edit(targetId, {
          Connect: true,
          ViewChannel: true,
          MoveMembers: true,
          MuteMembers: true,
        });
        
        await interaction.editReply({
          embeds: [createSuccessEmbed(`<@${targetId}> added as co-owner.`)],
        });
        await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
      } catch (error) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Failed to add co-owner. Please try again.')],
        });
      }
    } else if (action === 'remove') {
      this.bot.db.removeCoOwner(voiceChannel.id, targetId);
      await interaction.editReply({
        embeds: [createSuccessEmbed(`<@${targetId}> removed as co-owner.`)],
      });
      await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed('Invalid action. Use: add, remove, list, or clear')],
      });
    }
  }

  private extractId(str: string): string | null {
    // Remove mentions and extract ID
    const match = str.match(/(\d{17,19})/);
    return match ? match[1] : null;
  }

  private async determineTargetType(guildId: string, targetId: string): Promise<'user' | 'role' | null> {
    try {
      const guild = await this.bot.client.guilds.fetch(guildId);
      
      // Check if it's a role
      if (guild.roles.cache.has(targetId)) {
        return 'role';
      }
      
      // Check if it's a user
      try {
        await guild.members.fetch(targetId);
        return 'user';
      } catch {
        return null;
      }
    } catch (error) {
      return null;
    }
  }
}
