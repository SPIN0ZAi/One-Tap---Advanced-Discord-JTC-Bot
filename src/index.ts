import { Client, GatewayIntentBits, Partials, Collection, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { DatabaseManager } from './database/DatabaseManager';
import { StickyMessageManager } from './managers/StickyMessageManager';
import { VoiceChannelManager } from './managers/VoiceChannelManager';
import { PermissionManager } from './managers/PermissionManager';
import * as setupCommand from './commands/setup';

config();

export class PremiumVCBot {
  public client: Client;
  public db: DatabaseManager;
  public stickyManager: StickyMessageManager;
  public vcManager: VoiceChannelManager;
  public permissionManager: PermissionManager;
  public commands: Collection<string, any>;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
    });

    this.db = new DatabaseManager();
    this.stickyManager = new StickyMessageManager(this);
    this.vcManager = new VoiceChannelManager(this);
    this.permissionManager = new PermissionManager(this);
    this.commands = new Collection();
    
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
    } catch (error) {
      console.error('❌ Failed to start bot:', error);
      process.exit(1);
    }
  }

  private async registerSlashCommands() {
    try {
      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
      const commands = [setupCommand.data.toJSON()];

      console.log('🔄 Registering slash commands...');
      
      await rest.put(
        Routes.applicationCommands(this.client.user!.id),
        { body: commands }
      );

      console.log('✅ Slash commands registered successfully');
    } catch (error) {
      console.error('❌ Error registering slash commands:', error);
    }
  }

  private registerEvents() {
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
          } catch (error) {
            console.error('Error executing command:', error);
            await interaction.reply({
              content: '❌ An error occurred while executing this command!',
              ephemeral: true,
            });
          }
        }
      } else if (interaction.isButton()) {
        console.log('Button interaction:', interaction.customId);
        await this.handleButtonInteraction(interaction);
      } else if (interaction.isStringSelectMenu() || interaction.isUserSelectMenu()) {
        console.log('Select menu interaction:', interaction.customId);
        await this.handleSelectMenuInteraction(interaction);
      } else if (interaction.isModalSubmit()) {
        console.log('Modal submit interaction:', interaction.customId);
        await this.handleModalSubmit(interaction);
      } else {
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
      if (message.partial) await message.fetch();
      await this.stickyManager.handleMessageDelete(message);
    });
  }

  private async handleButtonInteraction(interaction: any) {
    const { ButtonHandler } = await import('./handlers/ButtonHandler');
    const handler = new ButtonHandler(this);
    await handler.handle(interaction);
  }

  private async handleSelectMenuInteraction(interaction: any) {
    const { SelectMenuHandler } = await import('./handlers/SelectMenuHandler');
    const handler = new SelectMenuHandler(this);
    await handler.handle(interaction);
  }

  private async handleModalSubmit(interaction: any) {
    const { ModalHandler } = await import('./handlers/ModalHandler');
    const handler = new ModalHandler(this);
    await handler.handle(interaction);
  }
}

// Start the bot
const bot = new PremiumVCBot();
bot.start();

export default bot;
