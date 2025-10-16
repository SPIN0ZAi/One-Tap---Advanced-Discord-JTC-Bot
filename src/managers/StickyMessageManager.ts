import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel, ChannelType } from 'discord.js';
import { PremiumVCBot } from '../index';
import { ButtonAction } from '../types';

export class StickyMessageManager {
  private bot: PremiumVCBot;
  private stickyMessages: Map<string, string> = new Map();

  constructor(bot: PremiumVCBot) {
    this.bot = bot;
  }

  async initializeAllStickyMessages() {
    const channels = this.bot.db.getAllVoiceChannels();
    for (const channelData of channels) {
      if (channelData.textChannelId) {
        await this.createOrUpdateStickyMessage(channelData.textChannelId, channelData.channelId);
      }
    }
  }

  async createOrUpdateStickyMessage(textChannelId: string, voiceChannelId: string) {
    try {
      console.log('Creating/updating sticky message');
      const textChannel = await this.bot.client.channels.fetch(textChannelId) as TextChannel;
      if (!textChannel || textChannel.type !== ChannelType.GuildText) return;
      
      const channelData = this.bot.db.getVoiceChannel(voiceChannelId);
      if (!channelData) return;

      // Get owner for avatar
      const owner = await this.bot.client.users.fetch(channelData.ownerId);
      
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setAuthor({ 
          name: 'One Tap - Help Panel',
          iconURL: this.bot.client.user?.displayAvatarURL()
        })
        .setDescription(`Need help managing your voice channel? Use the commands below to customize, control, and secure your VC with ease.`)
        .setImage('https://media1.tenor.com/m/4BV0r_fdQBoAAAAd/travis-bickle-cinema.gif')
        .addFields(
          { name: '✏️ | name', value: 'changes the name of the vc', inline: false },
          { name: '🔒 | lock/unlock', value: 'locks/unlocks the vc', inline: false },
          { name: 'ℹ️ | info/stats', value: 'show information vc', inline: false },
          { name: '♾️ | limit', value: 'sets the limit of the vc', inline: false },
          { name: '🔄 | reset', value: 'reset all permissions channel', inline: false },
          { name: '👤 | permit', value: 'gives a user permission to join the vc', inline: false },
          { name: '❌ | blacklist', value: 'blacklist a specific user from your VC', inline: false },
          { name: '👁️ | hide/unhide', value: 'unhides/hides the vc', inline: false },
          { name: '👑 | owner', value: `Owner: <@${channelData.ownerId}>`, inline: false },
          { name: '📝 | Channel', value: `Voice: <#${voiceChannelId}>\nText: <#${textChannelId}>`, inline: false }
        )
        .setThumbnail(owner.displayAvatarURL({ size: 256 }))
        .setFooter({ text: 'Click buttons below to control your channel' })
        .setTimestamp();

      const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(ButtonAction.CHANGE_NAME).setLabel('Rename').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(ButtonAction.LOCK).setLabel('Lock').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(ButtonAction.UNLOCK).setLabel('Unlock').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(ButtonAction.SET_LIMIT).setLabel('Limit').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(ButtonAction.RESET_PERMISSIONS).setLabel('Reset').setStyle(ButtonStyle.Secondary)
      );
      
      const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(ButtonAction.PERMIT_USER).setLabel('Permit').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(ButtonAction.BLACKLIST_USER).setLabel('Reject').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(ButtonAction.HIDE).setLabel('Hide').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(ButtonAction.INFO).setLabel('Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(ButtonAction.MANAGE_COOWNERS).setLabel('Co-owners').setStyle(ButtonStyle.Primary)
      );

      // Check if message already exists - UPDATE instead of DELETE and recreate
      if (channelData.stickyMessageId) {
        try {
          const existingMessage = await textChannel.messages.fetch(channelData.stickyMessageId);
          await existingMessage.edit({ embeds: [embed], components: [row1, row2] });
          console.log('Sticky message updated!');
          return existingMessage;
        } catch (error) {
          console.log('Old sticky message not found, creating new one');
        }
      }

      // Create new message if it doesn't exist
      const message = await textChannel.send({ embeds: [embed], components: [row1, row2] });
      console.log('Sticky message created!');
      
      try { await message.pin(); } catch (error) { console.log('Could not pin message'); }
      
      this.bot.db.updateStickyMessage(voiceChannelId, message.id);
      this.stickyMessages.set(textChannelId, message.id);
      return message;
    } catch (error) {
      console.error('Error creating sticky message:', error);
    }
  }

  async refreshStickyMessage(voiceChannelId: string) {
    const channelData = this.bot.db.getVoiceChannel(voiceChannelId);
    if (!channelData || !channelData.textChannelId) return;
    await this.createOrUpdateStickyMessage(channelData.textChannelId, voiceChannelId);
  }

  async handleMessageDelete(message: any) {
    const channels = this.bot.db.getAllVoiceChannels();
    const channelData = channels.find((vc: any) => vc.stickyMessageId === message.id);
    if (channelData && channelData.textChannelId) {
      await this.createOrUpdateStickyMessage(channelData.textChannelId, channelData.channelId);
    }
  }
}
