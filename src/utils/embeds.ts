import { EmbedBuilder } from 'discord.js';

export function createSuccessEmbed(description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x57F287) // Green
    .setDescription(`✅ ${description}`)
    .setTimestamp();
}

export function createErrorEmbed(description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xED4245) // Red
    .setDescription(`❌ ${description}`)
    .setTimestamp();
}

export function createInfoEmbed(description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x5865F2) // Blurple
    .setDescription(description)
    .setTimestamp();
}

export function createWarningEmbed(description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xFEE75C) // Yellow
    .setDescription(`⚠️ ${description}`)
    .setTimestamp();
}
