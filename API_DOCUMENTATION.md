# 🔧 Developer API Documentation

## Core Classes and Methods

### PremiumVCBot Class
Main bot instance that coordinates all managers and handlers.

```typescript
class PremiumVCBot {
  public client: Client;
  public db: DatabaseManager;
  public stickyManager: StickyMessageManager;
  public vcManager: VoiceChannelManager;
  public permissionManager: PermissionManager;

  constructor();
  async start(): Promise<void>;
  private registerEvents(): void;
}
```

#### Methods

**`start()`**
- Initializes database
- Registers event handlers
- Logs in to Discord
- Throws error if initialization fails

**`registerEvents()`**
- Registers Discord.js event listeners
- Sets up voiceStateUpdate handler
- Sets up interactionCreate handler
- Sets up channelDelete handler
- Sets up messageDelete handler

---

## DatabaseManager API

Manages all SQLite database operations.

```typescript
class DatabaseManager {
  constructor();
  async initialize(): Promise<void>;
  
  // Voice Channel Operations
  createVoiceChannel(data: VoiceChannelData): void;
  getVoiceChannel(channelId: string): VoiceChannelData | null;
  updateStickyMessage(channelId: string, messageId: string): void;
  updateOwner(channelId: string, newOwnerId: string): void;
  deleteVoiceChannel(channelId: string): void;
  getAllVoiceChannels(): VoiceChannelData[];
  
  // Co-owner Operations
  addCoOwner(coowner: CoOwner): void;
  removeCoOwner(channelId: string, userId: string): void;
  getCoOwners(channelId: string): CoOwner[];
  clearCoOwners(channelId: string): void;
  
  // Permission Operations
  addPermission(permission: ChannelPermission): void;
  removePermission(channelId: string, targetId: string, permissionType: string): void;
  getPermissions(channelId: string): ChannelPermission[];
  
  // Settings Operations
  getSettings(channelId: string): ChannelSettings;
  updateSettings(channelId: string, settings: Partial<ChannelSettings>): void;
}
```

### Voice Channel Methods

**`createVoiceChannel(data: VoiceChannelData)`**
- Creates new voice channel entry in database
- Auto-creates default settings entry
- Parameters: VoiceChannelData object
- Throws: Database error if insertion fails

**`getVoiceChannel(channelId: string)`**
- Retrieves voice channel data
- Returns: VoiceChannelData or null
- Use case: Check if channel is tracked

**`updateStickyMessage(channelId: string, messageId: string)`**
- Updates sticky message ID for channel
- Used when sticky message is recreated

**`getAllVoiceChannels()`**
- Returns all tracked voice channels
- Use case: Initialize sticky messages on bot startup

### Co-owner Methods

**`addCoOwner(coowner: CoOwner)`**
- Adds or updates co-owner
- Uses INSERT OR REPLACE for idempotency
- Parameters: CoOwner object with all fields

**`getCoOwners(channelId: string)`**
- Returns all co-owners for a channel
- Includes metadata (added_by, added_at, is_permanent)

### Permission Methods

**`addPermission(permission: ChannelPermission)`**
- Adds whitelist or blacklist entry
- Uses INSERT OR REPLACE (updates if exists)
- Parameters: ChannelPermission object

**`removePermission(channelId, targetId, permissionType)`**
- Removes specific permission entry
- Use for un-whitelisting or un-blacklisting

### Settings Methods

**`getSettings(channelId: string)`**
- Returns channel settings
- Returns defaults if no entry exists
- Never returns null

**`updateSettings(channelId, settings)`**
- Partial update of settings
- Merges with existing settings
- Uses INSERT OR REPLACE

---

## StickyMessageManager API

Manages persistent control panel messages.

```typescript
class StickyMessageManager {
  constructor(bot: PremiumVCBot);
  
  async initializeAllStickyMessages(): Promise<void>;
  async createOrUpdateStickyMessage(textChannelId: string, voiceChannelId: string): Promise<Message | undefined>;
  async handleMessageDelete(message: Message): Promise<void>;
  async refreshStickyMessage(voiceChannelId: string): Promise<void>;
  
  private createStickyEmbed(voiceChannelId: string): EmbedBuilder;
  private createStickyButtons(): ActionRowBuilder<ButtonBuilder>[];
}
```

### Methods

**`initializeAllStickyMessages()`**
- Called on bot startup
- Creates/updates sticky messages for all tracked channels
- Runs asynchronously

**`createOrUpdateStickyMessage(textChannelId, voiceChannelId)`**
- Creates new sticky message or updates existing
- Deletes old sticky message if exists
- Pins new message
- Updates database with message ID
- Returns: Message object or undefined

**`handleMessageDelete(message)`**
- Checks if deleted message was a sticky message
- Auto-recreates if it was
- Use case: Keep sticky message persistent

**`refreshStickyMessage(voiceChannelId)`**
- Recreates sticky message with updated data
- Call after any channel state change
- Updates stats and settings in embed

**`createStickyEmbed(voiceChannelId)`**
- Creates the embed with current stats
- Shows owner, soundboard status, slowmode, text lock
- Returns: EmbedBuilder

**`createStickyButtons()`**
- Creates 4 rows of buttons
- Returns: Array of ActionRowBuilder

---

## PermissionManager API

Handles all permission checks and enforcement.

```typescript
class PermissionManager {
  constructor(bot: PremiumVCBot);
  
  async hasPermission(userId: string, voiceChannelId: string, guildId: string): Promise<boolean>;
  isOwner(userId: string, voiceChannelId: string): boolean;
  async canPerformOwnerAction(userId: string, voiceChannelId: string, guildId: string): Promise<boolean>;
  async applyChannelPermissions(voiceChannel: VoiceChannel): Promise<void>;
  async lockChannel(voiceChannel: VoiceChannel): Promise<void>;
  async unlockChannel(voiceChannel: VoiceChannel): Promise<void>;
  async hideChannel(voiceChannel: VoiceChannel): Promise<void>;
  async unhideChannel(voiceChannel: VoiceChannel): Promise<void>;
  async resetAllPermissions(voiceChannel: VoiceChannel): Promise<void>;
}
```

### Permission Check Methods

**`hasPermission(userId, voiceChannelId, guildId)`**
- Comprehensive permission check
- Returns true if user can manage channel
- Checks: Owner, Co-owner, cowner role, Administrator
- Use before any channel modification

**`isOwner(userId, voiceChannelId)`**
- Simple owner check
- Returns true only if user is the owner
- Does not check co-owners or roles

**`canPerformOwnerAction(userId, voiceChannelId, guildId)`**
- Check for owner-only actions
- Used for: Transfer ownership, manage co-owners
- Checks: Owner or Administrator only

### Permission Enforcement Methods

**`applyChannelPermissions(voiceChannel)`**
- Applies all database permissions to channel
- Sets whitelist overwrites
- Sets blacklist overwrites
- Ensures owner and co-owners always have access

**`lockChannel(voiceChannel)`**
- Locks channel (Connect: false for @everyone)
- Ensures owner and co-owners can still connect
- Use case: Private meetings

**`unlockChannel(voiceChannel)`**
- Removes lock (Connect: null for @everyone)
- Resets to default permissions

**`hideChannel(voiceChannel)`**
- Hides channel (ViewChannel: false for @everyone)
- Ensures owner and co-owners can still see
- Use case: Secret channels

**`unhideChannel(voiceChannel)`**
- Shows channel (ViewChannel: null for @everyone)

**`resetAllPermissions(voiceChannel)`**
- Removes all permission overwrites except owner
- Clears database permission entries
- Use case: Fresh start

---

## VoiceChannelManager API

Handles voice channel events and operations.

```typescript
class VoiceChannelManager {
  constructor(bot: PremiumVCBot);
  
  async handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void>;
  async handleChannelDelete(channelId: string): Promise<void>;
  async createVoiceChannel(guildId: string, ownerId: string, name: string, categoryId?: string): Promise<VoiceChannel | null>;
  async getChannelStats(channelId: string): Promise<string>;
  
  private async handleUserJoin(state: VoiceState): Promise<void>;
  private async handleUserLeave(state: VoiceState): Promise<void>;
}
```

### Event Handler Methods

**`handleVoiceStateUpdate(oldState, newState)`**
- Main voice state event handler
- Detects joins, leaves, and moves
- Calls appropriate sub-handlers
- Refreshes sticky message

**`handleChannelDelete(channelId)`**
- Cleanup when channel is deleted
- Removes from database
- Called by channelDelete event

**`handleUserJoin(state)`**
- Private method for user join logic
- Refreshes sticky message

**`handleUserLeave(state)`**
- Private method for user leave logic
- Checks if channel is empty
- Handles owner leaving (claim logic)

### Channel Operations Methods

**`createVoiceChannel(guildId, ownerId, name, categoryId?)`**
- Creates new voice channel
- Creates associated text channel
- Sets up initial permissions
- Creates database entry
- Creates sticky message
- Returns: VoiceChannel or null

**`getChannelStats(channelId)`**
- Generates formatted stats string
- Includes: Owner, co-owners, members, limits, settings, permissions
- Returns: Markdown-formatted string

---

## ButtonHandler API

Handles all button interaction events.

```typescript
class ButtonHandler {
  constructor(bot: PremiumVCBot);
  
  async handle(interaction: ButtonInteraction): Promise<void>;
  
  private async getVoiceChannelFromInteraction(interaction: ButtonInteraction): Promise<VoiceChannel | null>;
  
  // Individual button handlers
  private async handleChangeName(interaction: ButtonInteraction, voiceChannel: VoiceChannel): Promise<void>;
  private async handleLock(interaction: ButtonInteraction, voiceChannel: VoiceChannel): Promise<void>;
  private async handleUnlock(interaction: ButtonInteraction, voiceChannel: VoiceChannel): Promise<void>;
  // ... (20+ more handlers)
}
```

### Main Methods

**`handle(interaction: ButtonInteraction)`**
- Main entry point for button clicks
- Gets voice channel from interaction
- Checks permissions
- Routes to appropriate handler
- Handles errors gracefully

**`getVoiceChannelFromInteraction(interaction)`**
- Finds voice channel associated with text channel
- Returns VoiceChannel or null
- Use case: Map interaction to VC

### Handler Pattern

All handler methods follow this pattern:
```typescript
private async handleActionName(interaction, voiceChannel) {
  // For immediate actions
  await interaction.deferReply({ ephemeral: true });
  
  try {
    // Perform action
    await someOperation();
    
    // Send success feedback
    await interaction.editReply({
      embeds: [createSuccessEmbed('Action completed!')]
    });
    
    // Refresh sticky message
    await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
  } catch (error) {
    // Send error feedback
    await interaction.editReply({
      embeds: [createErrorEmbed('Action failed.')]
    });
  }
}
```

For modal actions:
```typescript
private async handleActionName(interaction, voiceChannel) {
  const modal = new ModalBuilder()
    .setCustomId('modal_action_name')
    .setTitle('Action Title');
  
  // Add input fields
  
  await interaction.showModal(modal);
}
```

---

## ModalHandler API

Handles all modal submission events.

```typescript
class ModalHandler {
  constructor(bot: PremiumVCBot);
  
  async handle(interaction: ModalSubmitInteraction): Promise<void>;
  
  private async getVoiceChannelFromInteraction(interaction: ModalSubmitInteraction): Promise<VoiceChannel | null>;
  private extractId(str: string): string | null;
  private async determineTargetType(guildId: string, targetId: string): Promise<'user' | 'role' | null>;
  
  // Individual modal handlers
  private async handleChangeName(interaction: ModalSubmitInteraction, voiceChannel: VoiceChannel): Promise<void>;
  // ... (more handlers)
}
```

### Main Methods

**`handle(interaction: ModalSubmitInteraction)`**
- Main entry point for modal submissions
- Gets voice channel
- Checks permissions
- Routes to appropriate handler

**`extractId(str: string)`**
- Extracts Discord ID from mention or plain ID
- Regex: `/(\d{17,19})/`
- Returns: ID string or null

**`determineTargetType(guildId, targetId)`**
- Determines if ID is user or role
- Checks guild roles cache
- Attempts to fetch member
- Returns: 'user', 'role', or null

---

## Utility Functions (embeds.ts)

Helper functions for creating consistent embeds.

```typescript
function createSuccessEmbed(description: string): EmbedBuilder;
function createErrorEmbed(description: string): EmbedBuilder;
function createInfoEmbed(description: string): EmbedBuilder;
function createWarningEmbed(description: string): EmbedBuilder;
```

### Embed Functions

**`createSuccessEmbed(description)`**
- Green embed (#57F287)
- Adds ✅ prefix
- Includes timestamp
- Use for: Successful operations

**`createErrorEmbed(description)`**
- Red embed (#ED4245)
- Adds ❌ prefix
- Includes timestamp
- Use for: Errors, validation failures

**`createInfoEmbed(description)`**
- Blue embed (#5865F2)
- No prefix
- Includes timestamp
- Use for: Information, stats

**`createWarningEmbed(description)`**
- Yellow embed (#FEE75C)
- Adds ⚠️ prefix
- Includes timestamp
- Use for: Warnings, important notices

---

## Type Definitions

### VoiceChannelData
```typescript
interface VoiceChannelData {
  channelId: string;
  guildId: string;
  ownerId: string;
  createdAt: number;
  stickyMessageId?: string;
  textChannelId?: string;
}
```

### CoOwner
```typescript
interface CoOwner {
  channelId: string;
  userId: string;
  addedBy: string;
  addedAt: number;
  isPermanent: boolean;
}
```

### ChannelPermission
```typescript
interface ChannelPermission {
  channelId: string;
  targetId: string;
  targetType: 'user' | 'role';
  permissionType: 'whitelist' | 'blacklist';
  addedBy: string;
  addedAt: number;
}
```

### ChannelSettings
```typescript
interface ChannelSettings {
  channelId: string;
  soundboardEnabled: boolean;
  slowmode: number;
  textChatLocked: boolean;
}
```

### ButtonAction (Enum)
```typescript
enum ButtonAction {
  CHANGE_NAME = 'vc_change_name',
  LOCK = 'vc_lock',
  UNLOCK = 'vc_unlock',
  INFO = 'vc_info',
  SET_LIMIT = 'vc_set_limit',
  // ... (20+ more actions)
}
```

---

## Event Flow Diagrams

### Button Click Flow
```
User clicks button
  ↓
ButtonHandler.handle()
  ↓
Get voice channel from text channel
  ↓
Check user permissions
  ↓
Route to specific handler
  ↓
Show modal OR perform action
  ↓
Send ephemeral feedback
  ↓
Refresh sticky message
```

### Modal Submit Flow
```
User submits modal
  ↓
ModalHandler.handle()
  ↓
Get voice channel from text channel
  ↓
Check user permissions
  ↓
Extract and validate input
  ↓
Perform action (DB + Discord API)
  ↓
Send ephemeral feedback
  ↓
Refresh sticky message
```

### Voice State Update Flow
```
User joins/leaves VC
  ↓
VoiceChannelManager.handleVoiceStateUpdate()
  ↓
Determine action (join/leave/move)
  ↓
Call sub-handler
  ↓
Check for special conditions
  ↓
Refresh sticky message
```

---

## Error Handling

### Standard Error Pattern
```typescript
try {
  // Operation
  await someAsyncOperation();
  
  // Success feedback
  await interaction.editReply({
    embeds: [createSuccessEmbed('Success!')],
  });
} catch (error) {
  console.error('Error description:', error);
  
  // User-friendly error message
  await interaction.editReply({
    embeds: [createErrorEmbed('Friendly error message')],
  });
}
```

### Error Types
1. **Permission Errors**: User lacks permissions
2. **Validation Errors**: Invalid input data
3. **Discord API Errors**: Rate limits, missing access
4. **Database Errors**: Query failures
5. **Not Found Errors**: Channel/User doesn't exist

---

## Best Practices

### 1. Always Check Permissions
```typescript
const hasPermission = await this.bot.permissionManager.hasPermission(
  interaction.user.id,
  voiceChannel.id,
  interaction.guildId!
);

if (!hasPermission) {
  return await interaction.reply({
    embeds: [createErrorEmbed('No permission')],
    ephemeral: true,
  });
}
```

### 2. Use Ephemeral Responses
```typescript
await interaction.reply({
  embeds: [createSuccessEmbed('Done!')],
  ephemeral: true, // Always use this for control panel responses
});
```

### 3. Refresh Sticky After Changes
```typescript
await someChannelOperation();
await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
```

### 4. Defer Long Operations
```typescript
await interaction.deferReply({ ephemeral: true });
// ... long operation ...
await interaction.editReply({ embeds: [createSuccessEmbed('Done!')] });
```

### 5. Validate Input
```typescript
const limit = parseInt(input);
if (isNaN(limit) || limit < 0 || limit > 99) {
  return await interaction.reply({
    embeds: [createErrorEmbed('Invalid input')],
    ephemeral: true,
  });
}
```

---

## Extension Examples

### Adding a New Button

1. Add to ButtonAction enum:
```typescript
enum ButtonAction {
  // ...
  NEW_ACTION = 'vc_new_action',
}
```

2. Add button to sticky message:
```typescript
new ButtonBuilder()
  .setCustomId(ButtonAction.NEW_ACTION)
  .setLabel('New Action')
  .setEmoji('⭐')
  .setStyle(ButtonStyle.Primary)
```

3. Add handler:
```typescript
case ButtonAction.NEW_ACTION:
  await this.handleNewAction(interaction, voiceChannel);
  break;

private async handleNewAction(interaction, voiceChannel) {
  await interaction.deferReply({ ephemeral: true });
  
  try {
    // Your logic here
    
    await interaction.editReply({
      embeds: [createSuccessEmbed('Action completed!')],
    });
    await this.bot.stickyManager.refreshStickyMessage(voiceChannel.id);
  } catch (error) {
    await interaction.editReply({
      embeds: [createErrorEmbed('Action failed.')],
    });
  }
}
```

---

**This API documentation provides everything needed to understand, extend, and maintain the bot!**
