# 🎨 Customization Guide

## Customizing the Sticky Message

### Changing Colors

Edit `src/managers/StickyMessageManager.ts`:

```typescript
const embed = new EmbedBuilder()
  .setColor(0x5865F2) // Change this hex color
  // Discord colors:
  // 0x5865F2 - Blurple (default)
  // 0x57F287 - Green
  // 0xED4245 - Red
  // 0xFEE75C - Yellow
  // 0xEB459E - Fuchsia
  // 0x000000 - Black
```

### Changing Button Styles

Edit button styles in `createStickyButtons()`:

```typescript
new ButtonBuilder()
  .setStyle(ButtonStyle.Primary)   // Blue
  .setStyle(ButtonStyle.Secondary) // Gray
  .setStyle(ButtonStyle.Success)   // Green
  .setStyle(ButtonStyle.Danger)    // Red
```

### Adding Custom Emojis

Use custom emojis from your server:

```typescript
new ButtonBuilder()
  .setEmoji('<:emoji_name:emoji_id>')
  // Or use Unicode emojis:
  .setEmoji('🎵')
```

### Changing Button Labels

```typescript
new ButtonBuilder()
  .setLabel('Your Custom Label')
  .setEmoji('📝')
```

### Modifying Embed Description

```typescript
.setDescription(
  `**Your custom welcome message!**\n\n` +
  `Add your own text here...\n` +
  `Support markdown formatting!`
)
```

## Adding New Features

### Adding a New Button

1. **Add to ButtonAction enum** (`src/types/index.ts`):
```typescript
export enum ButtonAction {
  // ... existing actions
  YOUR_NEW_ACTION = 'vc_your_action',
}
```

2. **Add button to sticky message** (`src/managers/StickyMessageManager.ts`):
```typescript
const row5 = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setCustomId(ButtonAction.YOUR_NEW_ACTION)
    .setLabel('Your Action')
    .setEmoji('⭐')
    .setStyle(ButtonStyle.Primary)
);
// Add row5 to return array
```

3. **Add handler** (`src/handlers/ButtonHandler.ts`):
```typescript
case ButtonAction.YOUR_NEW_ACTION:
  await this.handleYourAction(interaction, voiceChannel);
  break;

// Add method:
private async handleYourAction(interaction: ButtonInteraction, voiceChannel: VoiceChannel) {
  await interaction.deferReply({ ephemeral: true });
  
  try {
    // Your custom logic here
    await interaction.editReply({
      embeds: [createSuccessEmbed('Action completed!')],
    });
  } catch (error) {
    await interaction.editReply({
      embeds: [createErrorEmbed('Action failed.')],
    });
  }
}
```

## Database Customization

### Adding New Settings

1. **Update database schema** (`src/database/DatabaseManager.ts`):
```typescript
this.db.exec(`
  ALTER TABLE channel_settings ADD COLUMN your_setting INTEGER DEFAULT 0;
`);
```

2. **Update interface** (`src/types/index.ts`):
```typescript
export interface ChannelSettings {
  // ... existing fields
  yourSetting: boolean;
}
```

3. **Update getSettings/updateSettings methods** in DatabaseManager

## Permission Customization

### Adding Custom Roles

Edit `src/managers/PermissionManager.ts`:

```typescript
const customRoles = [
  'cowner',
  'channel owner',
  'vc manager',
  'your-custom-role', // Add your roles here
];

const cownerRole = guild.roles.cache.find(role => 
  customRoles.includes(role.name.toLowerCase())
);
```

### Changing Permission Levels

Create custom permission tiers:

```typescript
async hasAdvancedPermission(userId: string, voiceChannelId: string): Promise<boolean> {
  // Your custom logic
  // Could check for specific roles, subscription status, etc.
  return true;
}
```

## UI/UX Customization

### Custom Notification Messages

Edit `src/utils/embeds.ts`:

```typescript
export function createSuccessEmbed(description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x57F287)
    .setDescription(`✅ ${description}`)
    .setFooter({ text: 'Your custom footer' })
    .setTimestamp();
}
```

### Custom Error Messages

Replace error messages throughout handlers:

```typescript
createErrorEmbed('Your custom error message with helpful tips!')
```

### Adding Footer Branding

```typescript
.setFooter({ 
  text: '💎 Your Bot Name • Premium Features',
  iconURL: 'https://your-icon-url.png'
})
```

## Advanced Customization

### Auto-Create Voice Channels

Add to `src/managers/VoiceChannelManager.ts`:

```typescript
async handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
  // Check if user joined a "Join to Create" channel
  if (newState.channelId === 'YOUR_JTC_CHANNEL_ID') {
    await this.createVoiceChannel(
      newState.guild.id,
      newState.id,
      `${newState.member?.displayName}'s Channel`,
      'CATEGORY_ID'
    );
  }
  // ... rest of handler
}
```

### Custom Bitrate Limits by Boost Level

```typescript
private getMaxBitrate(guild: Guild): number {
  switch (guild.premiumTier) {
    case PremiumTier.None: return 96;
    case PremiumTier.Tier1: return 128;
    case PremiumTier.Tier2: return 256;
    case PremiumTier.Tier3: return 384;
    default: return 64;
  }
}
```

### Activity Statistics

Add tracking to database:

```typescript
CREATE TABLE IF NOT EXISTS channel_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp INTEGER NOT NULL
)
```

### Webhook Logging

Add webhook notifications for admin actions:

```typescript
const webhook = new WebhookClient({ url: process.env.WEBHOOK_URL });

await webhook.send({
  content: `🔔 ${user.tag} performed action: ${action}`,
  username: 'VC Manager',
});
```

## Branding Your Bot

### Change Bot Activity

Edit `src/index.ts`:

```typescript
this.client.user?.setActivity('Your Custom Status', { 
  type: ActivityType.Watching // or Playing, Listening, Competing
});
```

### Custom Bot Avatar

Set in Discord Developer Portal > Bot > APP ICON

### Custom Bot Name

Set in Discord Developer Portal > General Information > NAME

## Performance Optimization

### Rate Limit Protection

Add delays for bulk operations:

```typescript
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
```

### Cache Management

Configure Discord.js cache:

```typescript
sweepers: {
  messages: {
    interval: 3600,
    lifetime: 1800,
  },
}
```

### Database Optimization

Add indexes for better performance:

```sql
CREATE INDEX IF NOT EXISTS idx_activity_timestamp 
ON channel_activity(timestamp);
```

## Example: Premium Tier System

Add premium features:

```typescript
interface PremiumUser {
  userId: string;
  tier: 'free' | 'premium' | 'ultra';
  expiresAt: number;
}

async isPremium(userId: string): Promise<boolean> {
  const user = this.db.prepare('SELECT * FROM premium_users WHERE user_id = ?').get(userId);
  return user && user.expires_at > Date.now();
}

// In handlers, check premium status:
if (!await this.isPremium(interaction.user.id)) {
  return await interaction.reply({
    embeds: [createErrorEmbed('This is a premium feature!')],
    ephemeral: true,
  });
}
```

---

**Need more customization help? Check the source code comments or Discord.js documentation!**
