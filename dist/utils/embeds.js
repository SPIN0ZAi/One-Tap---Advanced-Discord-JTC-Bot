"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccessEmbed = createSuccessEmbed;
exports.createErrorEmbed = createErrorEmbed;
exports.createInfoEmbed = createInfoEmbed;
exports.createWarningEmbed = createWarningEmbed;
const discord_js_1 = require("discord.js");
function createSuccessEmbed(description) {
    return new discord_js_1.EmbedBuilder()
        .setColor(0x57F287) // Green
        .setDescription(`✅ ${description}`)
        .setTimestamp();
}
function createErrorEmbed(description) {
    return new discord_js_1.EmbedBuilder()
        .setColor(0xED4245) // Red
        .setDescription(`❌ ${description}`)
        .setTimestamp();
}
function createInfoEmbed(description) {
    return new discord_js_1.EmbedBuilder()
        .setColor(0x5865F2) // Blurple
        .setDescription(description)
        .setTimestamp();
}
function createWarningEmbed(description) {
    return new discord_js_1.EmbedBuilder()
        .setColor(0xFEE75C) // Yellow
        .setDescription(`⚠️ ${description}`)
        .setTimestamp();
}
//# sourceMappingURL=embeds.js.map