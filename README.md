# 🎙️ Premium Voice Channel Manager Bot

A high-end Discord bot for advanced voice channel management with a beautiful, intuitive sticky message control panel. Inspired by Tempy, featuring premium UX and instant feedback for all actions.

![Discord.js](https://img.shields.io/badge/discord.js-v14.14.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📸 Bot Interface

![Bot Sticky Message Panel](https://raw.githubusercontent.com/SPIN0ZAi/One-Tap---Advanced-Discord-JTC-Bot/feature/initial-release/Screenshot%202025-10-16%20165334.png)

*Interactive sticky message with all control buttons displayed in voice channel chat*

## ✨ Features

### 🎯 Core Functionality
- **Persistent Sticky Message**: Beautiful, always-visible control panel in VC text chat
- **Role-Based Access**: Only visible to owners, co-owners, and users with "cowner" role
- **Instant Feedback**: Real-time notifications for every action
- **Premium UX**: Modern, bold, and friendly interface with clear iconography

### 🎛️ Voice Channel Controls

#### 📝 Basic Management
- **Change VC Name**: Rename your voice channel instantly
- **Lock/Unlock VC**: Control who can join
- **Set User Limit**: Limit the number of users (0-99 or unlimited)
- **Show VC Info/Stats**: Detailed channel statistics and settings
- **VC Status**: Set custom status messages

#### 🔒 Permissions & Access
- **Permit User/Role**: Whitelist specific users or roles
- **Blacklist User/Role**: Block specific users or roles
- **Remove Permissions**: Remove specific permission entries
- **Reset All Permissions**: Clear all custom permissions
- **Hide/Unhide VC**: Toggle channel visibility

#### ⚙️ Advanced Settings
- **Toggle Soundboard**: Enable/disable soundboard usage
- **Change Slowmode**: Set text chat slowmode (0-21600 seconds)
- **Adjust Bitrate**: Set audio quality (8-384 kbps) with premium warnings
- **Lock/Unlock Text Chat**: Control text channel message permissions

#### 👥 Ownership Management
- **Show Ownership**: View owner and all co-owners
- **Transfer Ownership**: Transfer full ownership to another user
- **Claim Ownership**: Co-owners can claim if owner leaves
- **Manage Co-Owners**: Add, remove, list, or clear co-owners
  - Add individual co-owners
  - Remove co-owners
  - List all co-owners with details
  - Clear all co-owners at once
  - Permanent co-owner option

#### ⚡ Bulk Actions
- Batch blacklist/whitelist operations
- Advanced permission management
- Quick channel setup presets

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v16.11.0 or higher
- **Discord Bot Token**: [Create a bot](https://discord.com/developers/applications)
- **Bot Permissions**: Administrator (or specific permissions listed below)

### Installation

1. **Clone or download this project**
   ```powershell
   cd "c:\Users\ssola\Downloads\project one tap"
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env`
   - Fill in your bot token and configuration:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here
   DATABASE_PATH=./data/bot.db
   ```

4. **Build the project**
   ```powershell
   npm run build
   ```

5. **Start the bot**
   ```powershell
   npm start
   ```

   Or for development with auto-reload:
   ```powershell
   npm run dev
   ```

## 🔧 Bot Setup

### Required Bot Permissions
Your bot needs the following permissions:
- `Manage Channels` - To modify voice channels
- `Manage Roles` - To set permission overwrites
- `View Channels` - To access voice channels
- `Connect` - To monitor voice states
- `Move Members` - To disconnect blacklisted users
- `Mute Members` - Optional for extended features
- `Manage Messages` - To manage sticky messages
- `Send Messages` - To send control panel
- `Embed Links` - For rich embeds
- `Read Message History` - To manage pins

### Invite Link
Generate an invite link with this URL:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8589934592&scope=bot%20applications.commands
```

Replace `YOUR_CLIENT_ID` with your bot's client ID.

## 📚 Usage Guide

### For Server Administrators

1. **Create a "cowner" Role (Optional)**
   - Create a role named "cowner", "channel owner", or "vc manager"
   - Assign this role to trusted members who should manage all VCs

2. **Initial Setup**
   - The bot will automatically track voice channels
   - Sticky messages appear in associated text channels
   - Only owners, co-owners, and cowner role members see buttons

### For Voice Channel Owners

#### Creating a Channel
When you create or claim a voice channel, the bot will:
1. Track your ownership
2. Create a sticky message in the associated text channel
3. Give you full control through the button panel

#### Using the Control Panel
Click any button in the sticky message to:
- **Change Name**: Opens a modal to enter new name
- **Lock/Unlock**: Instantly locks/unlocks the channel
- **Info**: Shows detailed channel statistics
- **Set Limit**: Opens modal to set user limit
- **Permit/Blacklist**: Opens modal to add users/roles
- **Toggle Settings**: Instantly toggles soundboard, text lock, etc.
- **Manage Co-Owners**: Opens modal with actions (add/remove/list/clear)

#### Managing Co-Owners
Co-owners can:
- Use all channel controls except ownership transfer
- Claim ownership if the original owner leaves
- Be promoted to permanent status (survives owner leave)

**To add a co-owner:**
1. Click "Co-Owners" button
2. Enter "add" as action
3. Enter user mention or ID
4. They immediately gain control panel access

**To remove a co-owner:**
1. Click "Co-Owners" button
2. Enter "remove" as action
3. Enter user mention or ID

**To list co-owners:**
1. Click "Co-Owners" button
2. Enter "list" as action

**To clear all co-owners:**
1. Click "Co-Owners" button
2. Enter "clear" as action

### Permission System

#### Whitelist
- Explicitly allows users/roles to join
- Overrides default permissions
- Useful for private channels

#### Blacklist
- Explicitly blocks users/roles from joining
- Disconnects them if already in channel
- Owner cannot be blacklisted

#### Priority
1. Owner always has access
2. Co-owners always have access
3. Blacklist blocks access
4. Whitelist grants access
5. Default permissions apply

## 🎨 Sticky Message Design

The sticky message features:
- **Premium Embed**: Discord Blurple color scheme
- **4 Rows of Buttons**: Organized by category
  - Row 1: Essential controls (name, lock, info, limit)
  - Row 2: Permissions (permit, blacklist, reset, hide/unhide)
  - Row 3: Settings (soundboard, slowmode, bitrate, status, text lock)
  - Row 4: Ownership (show, transfer, claim, co-owners, bulk)
- **Real-time Updates**: Stats update when channel changes
- **Auto-recreation**: If deleted, instantly recreates
- **Always Pinned**: Stays at top of text channel

## 🔐 Security Features

- **Permission Checks**: Every action validates user permissions
- **Owner Protection**: Cannot blacklist or remove owner
- **Ephemeral Responses**: All control messages are private
- **Audit Trail**: All actions logged with user ID and timestamp
- **Safe Transfers**: Ownership transfers require explicit confirmation

## 📊 Database

The bot uses SQLite (better-sqlite3) with:
- **voice_channels**: Channel tracking and ownership
- **coowners**: Co-owner relationships
- **channel_permissions**: Whitelist/blacklist entries
- **channel_settings**: Soundboard, slowmode, text lock states

Database location: `./data/bot.db` (configurable via .env)

## 🛠️ Development

### Project Structure
```
project-one-tap/
├── src/
│   ├── index.ts                 # Main bot entry point
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── database/
│   │   └── DatabaseManager.ts  # SQLite operations
│   ├── managers/
│   │   ├── StickyMessageManager.ts   # Sticky message logic
│   │   ├── VoiceChannelManager.ts    # VC event handling
│   │   └── PermissionManager.ts      # Permission logic
│   ├── handlers/
│   │   ├── ButtonHandler.ts          # Button interactions
│   │   ├── ModalHandler.ts           # Modal submissions
│   │   └── SelectMenuHandler.ts      # Select menus
│   └── utils/
│       └── embeds.ts                 # Embed builders
├── data/
│   └── bot.db                  # SQLite database (auto-created)
├── package.json
├── tsconfig.json
├── .env                        # Your configuration (create from .env.example)
└── README.md
```

### Building
```powershell
npm run build
```

### Watch Mode
```powershell
npm run watch
```

### Running
```powershell
# Production
npm start

# Development
npm run dev
```

## 🐛 Troubleshooting

### Bot doesn't respond to buttons
- Verify bot has required permissions
- Check bot is online and connected
- Ensure interaction token hasn't expired
- Check console for error messages

### Sticky message not appearing
- Verify voice channel is tracked in database
- Check bot can send messages in text channel
- Ensure text channel is linked to voice channel
- Try manually creating channel with bot

### Permissions not working
- Verify bot has `Manage Channels` permission
- Check role hierarchy (bot role must be higher)
- Ensure bot has permission overwrites enabled
- Check for conflicting permission rules

### Database errors
- Ensure `./data` directory exists (auto-created)
- Check file permissions on bot.db
- Verify SQLite is working: `npm ls better-sqlite3`

## 📝 Advanced Configuration

### Custom Role Names
Edit `PermissionManager.ts` to add custom role names:
```typescript
const cownerRole = guild.roles.cache.find(role => 
  role.name.toLowerCase() === 'your-custom-role-name'
);
```

### Bitrate Limits
Adjust in `ModalHandler.ts`:
```typescript
if (bitrate < 8 || bitrate > 384) // Modify these values
```

### Slowmode Limits
Adjust in `ModalHandler.ts`:
```typescript
if (slowmode < 0 || slowmode > 21600) // Modify max value
```

## 🎯 Planned Features

- [ ] Slash commands for advanced operations
- [ ] Web dashboard for bulk management
- [ ] Activity logging and statistics
- [ ] Automatic role assignment on join
- [ ] Template system for quick channel setup
- [ ] Multi-guild support with separate configs
- [ ] Voice channel analytics and insights

## 📄 License

MIT License - feel free to use and modify for your server!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 💬 Support

For issues or questions:
1. Check the troubleshooting section
2. Review error messages in console
3. Check Discord.js documentation
4. Open an issue on GitHub

## 🙏 Credits

Inspired by **Tempy** Discord Bot for the premium voice channel management experience.

Built with:
- [Discord.js v14](https://discord.js.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)

---

**Made with ❤️ for premium Discord server management**
