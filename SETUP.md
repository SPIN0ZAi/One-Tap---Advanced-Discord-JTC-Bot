# 🚀 Quick Setup Guide

## Step-by-Step Installation

### 1. Install Node.js (if not already installed)
Download and install from: https://nodejs.org/ (LTS version recommended)

Verify installation:
```powershell
node --version
npm --version
```

### 2. Create Discord Bot

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name your bot (e.g., "Premium VC Manager")
4. Go to "Bot" tab
5. Click "Add Bot"
6. Under "Privileged Gateway Intents", enable:
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
7. Click "Reset Token" and copy your bot token (keep this secret!)

### 3. Get Your IDs

**Client ID:**
- In your Discord Application, go to "General Information"
- Copy "APPLICATION ID"

**Guild ID (Server ID):**
- Enable Developer Mode in Discord: Settings > Advanced > Developer Mode
- Right-click your server icon > Copy ID

### 4. Configure the Bot

Create a `.env` file in the project root:

```env
DISCORD_TOKEN=your_bot_token_from_step_2
CLIENT_ID=your_application_id
GUILD_ID=your_server_id
DATABASE_PATH=./data/bot.db
LOG_LEVEL=info
```

### 5. Install Dependencies

```powershell
cd "c:\Users\ssola\Downloads\project one tap"
npm install
```

This will install:
- discord.js (Discord API wrapper)
- better-sqlite3 (Database)
- dotenv (Environment variables)
- TypeScript and type definitions

### 6. Build the Project

```powershell
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### 7. Invite Bot to Your Server

Use this URL (replace YOUR_CLIENT_ID):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8589934592&scope=bot
```

**Required Permissions:**
- Manage Channels
- Manage Roles
- View Channels
- Connect
- Move Members
- Manage Messages
- Send Messages
- Embed Links
- Read Message History

### 8. Start the Bot

```powershell
npm start
```

You should see:
```
✅ Database initialized
🤖 Bot is ready! Logged in as YourBotName#1234
```

### 9. Test the Bot

1. Create a voice channel in your server
2. Create a text channel (e.g., "vc-chat")
3. Join the voice channel
4. The bot should create a sticky message with buttons in the text channel
5. Click any button to test functionality!

## Common Setup Issues

### "Cannot find module 'discord.js'"
**Solution:** Run `npm install` again

### "Invalid token"
**Solution:** 
- Verify your token in .env matches your bot token
- Regenerate token in Discord Developer Portal
- Make sure there are no extra spaces in .env

### "Missing Access"
**Solution:**
- Reinvite bot with correct permissions
- Check bot role is above managed roles
- Verify bot has channel access

### "Database locked"
**Solution:**
- Close any other instances of the bot
- Delete bot.db and restart (will lose data)

### TypeScript errors
**Solution:**
- Install dev dependencies: `npm install --save-dev @types/node`
- Run `npm run build` to compile

## Testing Checklist

After setup, test these features:

- [ ] Bot comes online and shows as "Watching Voice Channels"
- [ ] Sticky message appears with all buttons
- [ ] Change Name button opens modal and updates channel
- [ ] Lock/Unlock buttons work instantly
- [ ] Info button shows channel statistics
- [ ] Set Limit modal works
- [ ] Permit/Blacklist modals work
- [ ] Toggle Soundboard works
- [ ] Hide/Unhide buttons work
- [ ] Slowmode modal works
- [ ] Bitrate modal works (shows warning above 64kbps)
- [ ] Co-owner management (add/remove/list/clear)
- [ ] Transfer ownership works
- [ ] Claim ownership works when owner leaves
- [ ] Text chat lock toggle works
- [ ] Sticky message recreates if deleted
- [ ] Permissions check correctly

## Next Steps

1. **Create a "cowner" role** in your server for channel managers
2. **Assign the role** to trusted members
3. **Configure auto-channel creation** (optional, custom implementation)
4. **Customize button labels** in `StickyMessageManager.ts`
5. **Add custom features** as needed

## Production Deployment

For production use:

1. Use PM2 or similar process manager:
   ```powershell
   npm install -g pm2
   pm2 start npm --name "vc-bot" -- start
   pm2 save
   pm2 startup
   ```

2. Set up logging:
   ```powershell
   pm2 logs vc-bot
   ```

3. Enable auto-restart:
   ```powershell
   pm2 restart vc-bot --watch
   ```

4. Regular backups of `./data/bot.db`

## Useful Commands

```powershell
# Start bot
npm start

# Development mode (auto-reload)
npm run dev

# Build TypeScript
npm run build

# Watch TypeScript (auto-compile)
npm run watch

# Check for errors
npm run build

# View logs (if using PM2)
pm2 logs vc-bot

# Restart bot (PM2)
pm2 restart vc-bot

# Stop bot (PM2)
pm2 stop vc-bot
```

## Support & Resources

- **Discord.js Guide**: https://discordjs.guide/
- **Discord.js Docs**: https://discord.js.org/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Node.js Docs**: https://nodejs.org/docs/

---

**You're all set! Enjoy your premium voice channel management bot! 🎉**
