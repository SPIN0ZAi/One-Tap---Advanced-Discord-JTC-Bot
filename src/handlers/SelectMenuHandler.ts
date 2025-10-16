import { StringSelectMenuInteraction, UserSelectMenuInteraction, VoiceChannel, ChannelType } from 'discord.js';
import { PremiumVCBot } from '../index';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds';

export class SelectMenuHandler {
  private bot: PremiumVCBot;

  constructor(bot: PremiumVCBot) {
    this.bot = bot;
  }

  async handle(interaction: StringSelectMenuInteraction | UserSelectMenuInteraction) {
    try {
      console.log('SelectMenuHandler.handle() called with customId:', interaction.customId);
      
      if (interaction.isUserSelectMenu()) {
        console.log('Processing user select menu');
        await this.handleUserSelectMenu(interaction);
      } else if (interaction.isStringSelectMenu()) {
        console.log('Processing string select menu');
        await this.handleStringSelectMenu(interaction);
      }
    } catch (error) {
      console.error('Error handling select menu:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          embeds: [createErrorEmbed('An error occurred while processing your selection.')],
          ephemeral: true,
        });
      }
    }
  }

  private async handleUserSelectMenu(interaction: UserSelectMenuInteraction) {
    console.log('handleUserSelectMenu called');
    
    // Defer immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    console.log('Deferred reply');

    const voiceChannel = await this.getVoiceChannelFromInteraction(interaction);
    console.log('Voice channel:', voiceChannel?.name);
    
    if (!voiceChannel) {
      console.log('Voice channel not found');
      return await interaction.editReply({
        embeds: [createErrorEmbed('Could not find the associated voice channel.')],
      });
    }

    // Check if user is owner or has permission
    const channelData = this.bot.db.getVoiceChannel(voiceChannel.id);
    if (!channelData) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Channel data not found.')],
      });
    }

    if (interaction.user.id !== channelData.ownerId) {
      const coowners = this.bot.db.getCoOwners(voiceChannel.id);
      const isCoOwner = coowners.some(co => co.userId === interaction.user.id);
      
      if (!isCoOwner) {
        return await interaction.editReply({
          embeds: [createErrorEmbed('Only the channel owner or co-owners can modify permissions.')],
        });
      }
    }

    const selectedUserId = interaction.values[0];

    switch (interaction.customId) {
      case 'select_permit_user':
        await this.handlePermitUserSelect(interaction, voiceChannel, selectedUserId);
        break;
      case 'select_blacklist_user':
        await this.handleBlacklistUserSelect(interaction, voiceChannel, selectedUserId);
        break;
      case 'select_add_coowner':
        await this.handleAddCoOwnerSelect(interaction, voiceChannel, selectedUserId);
        break;
      case 'select_remove_coowner':
        await this.handleRemoveCoOwnerSelect(interaction, voiceChannel, selectedUserId);
        break;
      default:
        await interaction.editReply({
          embeds: [createErrorEmbed('Unknown select menu action.')],
        });
    }
  }

  private async handleStringSelectMenu(interaction: StringSelectMenuInteraction) {
    // Future implementation for string select menus
    await interaction.reply({
      embeds: [createErrorEmbed('Select menu not implemented yet.')],
      ephemeral: true,
    });
  }

  private async getVoiceChannelFromInteraction(interaction: UserSelectMenuInteraction): Promise<VoiceChannel | null> {
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

  private async handlePermitUserSelect(interaction: UserSelectMenuInteraction, voiceChannel: VoiceChannel, userId: string) {
    try {
      // Add to whitelist
      this.bot.db.addPermission({
        channelId: voiceChannel.id,
        targetId: userId,
        targetType: 'user',
        permissionType: 'whitelist',
        addedBy: interaction.user.id,
        addedAt: Date.now(),
      });

      // Apply permissions
      await voiceChannel.permissionOverwrites.edit(userId, {
        Connect: true,
        ViewChannel: true,
      });

      await interaction.editReply({
        embeds: [createSuccessEmbed(`✅ <@${userId}> has been permitted to join the channel.`)],
      });
      
      // Don't refresh sticky message - it doesn't need to update
    } catch (error) {
      console.error('Error permitting user:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to permit user. Please try again.')],
      });
    }
  }

  private async handleBlacklistUserSelect(interaction: UserSelectMenuInteraction, voiceChannel: VoiceChannel, userId: string) {
    // Check if trying to reject owner
    const channelData = this.bot.db.getVoiceChannel(voiceChannel.id);
    if (channelData && userId === channelData.ownerId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('You cannot reject the channel owner.')],
      });
    }

    try {
      // Add to reject list
      this.bot.db.addPermission({
        channelId: voiceChannel.id,
        targetId: userId,
        targetType: 'user',
        permissionType: 'blacklist',
        addedBy: interaction.user.id,
        addedAt: Date.now(),
      });

      // Apply strict permissions - explicit deny for ALL voice permissions
      // This creates a permission overwrite that even admins must respect
      await voiceChannel.permissionOverwrites.edit(userId, {
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
      const member = voiceChannel.members.get(userId);
      if (member) {
        await member.voice.disconnect('Rejected from voice channel');
      }

      await interaction.editReply({
        embeds: [createSuccessEmbed(`❌ <@${userId}> has been rejected from the channel.`)],
      });
      
      // Don't refresh sticky message - it doesn't need to update
    } catch (error) {
      console.error('Error rejecting user:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to reject user. Please try again.')],
      });
    }
  }

  private async handleAddCoOwnerSelect(interaction: UserSelectMenuInteraction, voiceChannel: VoiceChannel, userId: string) {
    const channelData = this.bot.db.getVoiceChannel(voiceChannel.id);
    
    if (!channelData) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Channel data not found.')],
      });
    }

    // Check if user is already owner
    if (userId === channelData.ownerId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('This user is already the channel owner.')],
      });
    }

    // Check if already a co-owner
    const coowners = this.bot.db.getCoOwners(voiceChannel.id);
    if (coowners.some(co => co.userId === userId)) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('This user is already a co-owner.')],
      });
    }

    try {
      // Add co-owner
      this.bot.db.addCoOwner({
        channelId: voiceChannel.id,
        userId: userId,
        addedBy: interaction.user.id,
        addedAt: Date.now(),
        isPermanent: false,
      });

      // Grant permissions
      await voiceChannel.permissionOverwrites.edit(userId, {
        Connect: true,
        ViewChannel: true,
        ManageChannels: true,
      });

      await interaction.editReply({
        embeds: [createSuccessEmbed(`✅ <@${userId}> has been added as a co-owner.`)],
      });
    } catch (error) {
      console.error('Error adding co-owner:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to add co-owner. Please try again.')],
      });
    }
  }

  private async handleRemoveCoOwnerSelect(interaction: UserSelectMenuInteraction, voiceChannel: VoiceChannel, userId: string) {
    const coowners = this.bot.db.getCoOwners(voiceChannel.id);
    
    // Check if user is actually a co-owner
    if (!coowners.some(co => co.userId === userId)) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('This user is not a co-owner.')],
      });
    }

    try {
      // Remove co-owner
      this.bot.db.removeCoOwner(voiceChannel.id, userId);

      // Remove special permissions (reset to default)
      await voiceChannel.permissionOverwrites.delete(userId);

      await interaction.editReply({
        embeds: [createSuccessEmbed(`✅ <@${userId}> has been removed as a co-owner.`)],
      });
    } catch (error) {
      console.error('Error removing co-owner:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to remove co-owner. Please try again.')],
      });
    }
  }
}
