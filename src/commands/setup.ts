import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  VoiceChannel,
  CategoryChannel,
} from 'discord.js';
import { PremiumVCBot } from '../index';

export const data = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Setup the Join-to-Create voice channel system')
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('The voice channel that users will join to create their own VC')
      .addChannelTypes(ChannelType.GuildVoice)
      .setRequired(true)
  )
  .addChannelOption((option) =>
    option
      .setName('category')
      .setDescription('Category where new voice channels will be created (optional)')
      .addChannelTypes(ChannelType.GuildCategory)
      .setRequired(false)
  )
  .addChannelOption((option) =>
    option
      .setName('text-category')
      .setDescription('Category where text channels will be created (optional)')
      .addChannelTypes(ChannelType.GuildCategory)
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName('name-format')
      .setDescription('Channel name format (use {username} for user\'s name) - Default: {username}\'s room')
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction, bot: PremiumVCBot) {
  try {
    // Check permissions
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return await interaction.reply({
        content: '❌ You need Administrator permission to use this command!',
        ephemeral: true,
      });
    }

    const jtcChannel = interaction.options.getChannel('channel') as VoiceChannel;
    const category = interaction.options.getChannel('category') as CategoryChannel | null;
    const textCategory = interaction.options.getChannel('text-category') as CategoryChannel | null;
    const nameFormat = interaction.options.getString('name-format') || '{username}\'s room';

    if (!jtcChannel || jtcChannel.type !== ChannelType.GuildVoice) {
      return await interaction.reply({
        content: '❌ Please select a valid voice channel!',
        ephemeral: true,
      });
    }

    // If no category specified, use the same category as the JTC channel
    const finalCategoryId = category?.id || jtcChannel.parentId || undefined;

    // Save setup configuration
    bot.db.setSetupConfig({
      guildId: interaction.guildId!,
      jtcChannelId: jtcChannel.id,
      categoryId: finalCategoryId,
      textCategoryId: textCategory?.id || finalCategoryId,
      channelNameFormat: nameFormat,
      createdAt: Date.now(),
    });

    // Build response message
    let message = `✅ **Join-to-Create System Configured!**\n\n`;
    message += `🎤 **JTC Channel:** ${jtcChannel}\n`;
    message += `📝 **Name Format:** \`${nameFormat}\`\n`;
    
    if (category) {
      message += `📂 **Voice Category:** ${category.name}\n`;
    }
    
    if (textCategory) {
      message += `📂 **Text Category:** ${textCategory.name}\n`;
    }
    
    message += `\n**How it works:**\n`;
    message += `• Users join ${jtcChannel}\n`;
    message += `• A personal VC is automatically created\n`;
    message += `• User becomes the owner with full control\n`;
    message += `• Channel is deleted when empty\n`;

    await interaction.reply({
      content: message,
      ephemeral: false,
    });

    console.log(`✅ JTC setup configured in ${interaction.guild?.name} by ${interaction.user.tag}`);
  } catch (error) {
    console.error('Error in setup command:', error);
    await interaction.reply({
      content: '❌ An error occurred while setting up the JTC system!',
      ephemeral: true,
    });
  }
}
