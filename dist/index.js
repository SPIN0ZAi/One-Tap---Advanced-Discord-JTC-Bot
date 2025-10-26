"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PremiumVCBot = void 0;
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
const DatabaseManager_1 = require("./database/DatabaseManager");
const StickyMessageManager_1 = require("./managers/StickyMessageManager");
const VoiceChannelManager_1 = require("./managers/VoiceChannelManager");
const PermissionManager_1 = require("./managers/PermissionManager");
const setupCommand = __importStar(require("./commands/setup"));
(0, dotenv_1.config)();
class PremiumVCBot {
    client;
    db;
    stickyManager;
    vcManager;
    permissionManager;
    commands;
    constructor() {
        this.client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildVoiceStates,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.GuildMembers,
            ],
            partials: [discord_js_1.Partials.Channel, discord_js_1.Partials.Message, discord_js_1.Partials.GuildMember],
        });
        this.db = new DatabaseManager_1.DatabaseManager();
        this.stickyManager = new StickyMessageManager_1.StickyMessageManager(this);
        this.vcManager = new VoiceChannelManager_1.VoiceChannelManager(this);
        this.permissionManager = new PermissionManager_1.PermissionManager(this);
        this.commands = new discord_js_1.Collection();
        // Register commands
        this.commands.set(setupCommand.data.name, setupCommand);
    }
    async start() {
        try {
            // Initialize database
            await this.db.initialize();
            console.log('✅ Database initialized');
            // Register event handlers
            this.registerEvents();
            // Login
            await this.client.login(process.env.DISCORD_TOKEN);
            console.log('✅ Bot logged in successfully');
        }
        catch (error) {
            console.error('❌ Failed to start bot:', error);
            process.exit(1);
        }
    }
    async registerSlashCommands() {
        try {
            const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
            const commands = [setupCommand.data.toJSON()];
            console.log('🔄 Registering slash commands...');
            await rest.put(discord_js_1.Routes.applicationCommands(this.client.user.id), { body: commands });
            console.log('✅ Slash commands registered successfully');
        }
        catch (error) {
            console.error('❌ Error registering slash commands:', error);
        }
    }
    registerEvents() {
        this.client.once('ready', async () => {
            console.log(`🤖 Bot is ready! Logged in as ${this.client.user?.tag}`);
            this.client.user?.setActivity('Voice Channels 🎙️', { type: 3 }); // Watching
            // Register slash commands
            await this.registerSlashCommands();
            // Initialize sticky messages for all tracked channels
            this.stickyManager.initializeAllStickyMessages();
        });
        this.client.on('voiceStateUpdate', async (oldState, newState) => {
            await this.vcManager.handleVoiceStateUpdate(oldState, newState);
        });
        this.client.on('interactionCreate', async (interaction) => {
            if (interaction.isChatInputCommand()) {
                const command = this.commands.get(interaction.commandName);
                if (command) {
                    try {
                        await command.execute(interaction, this);
                    }
                    catch (error) {
                        console.error('Error executing command:', error);
                        await interaction.reply({
                            content: '❌ An error occurred while executing this command!',
                            ephemeral: true,
                        });
                    }
                }
            }
            else if (interaction.isButton()) {
                console.log('Button interaction:', interaction.customId);
                await this.handleButtonInteraction(interaction);
            }
            else if (interaction.isStringSelectMenu() || interaction.isUserSelectMenu()) {
                console.log('Select menu interaction:', interaction.customId);
                await this.handleSelectMenuInteraction(interaction);
            }
            else if (interaction.isModalSubmit()) {
                console.log('Modal submit interaction:', interaction.customId);
                await this.handleModalSubmit(interaction);
            }
            else {
                console.log('Unknown interaction type:', interaction.type);
            }
        });
        this.client.on('channelDelete', async (channel) => {
            if (channel.isVoiceBased()) {
                await this.vcManager.handleChannelDelete(channel.id);
            }
        });
        this.client.on('messageDelete', async (message) => {
            // Re-create sticky message if deleted
            if (message.partial)
                await message.fetch();
            await this.stickyManager.handleMessageDelete(message);
        });
    }
    async handleButtonInteraction(interaction) {
        const { ButtonHandler } = await Promise.resolve().then(() => __importStar(require('./handlers/ButtonHandler')));
        const handler = new ButtonHandler(this);
        await handler.handle(interaction);
    }
    async handleSelectMenuInteraction(interaction) {
        const { SelectMenuHandler } = await Promise.resolve().then(() => __importStar(require('./handlers/SelectMenuHandler')));
        const handler = new SelectMenuHandler(this);
        await handler.handle(interaction);
    }
    async handleModalSubmit(interaction) {
        const { ModalHandler } = await Promise.resolve().then(() => __importStar(require('./handlers/ModalHandler')));
        const handler = new ModalHandler(this);
        await handler.handle(interaction);
    }
}
exports.PremiumVCBot = PremiumVCBot;
// Start the bot
const bot = new PremiumVCBot();
bot.start();
exports.default = bot;
//# sourceMappingURL=index.js.map