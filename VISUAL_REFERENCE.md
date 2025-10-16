# 🎨 Sticky Message Visual Reference

## Sticky Message Layout

The sticky message appears as a pinned message in the voice channel's text chat with this structure:

```
╔════════════════════════════════════════════════════════════╗
║  🎙️ Voice Channel Control Panel                           ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Welcome to your premium voice channel!                   ║
║                                                            ║
║  This control panel is exclusively for the channel        ║
║  owner and trusted co-owners.                             ║
║  Click any button below to manage your voice channel      ║
║  instantly.                                                ║
║                                                            ║
║  👤 Owner: @username                                       ║
║                                                            ║
║  ⚙️ Quick Status:                                          ║
║  🔊 Soundboard: ✅ Enabled                                 ║
║  ⏱️ Slowmode: 0s                                           ║
║  🔒 Text Chat: Unlocked                                    ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║  [✏️ Change Name] [🔒 Lock] [🔓 Unlock] [ℹ️ Info] [👥 Set Limit]  ║
║                                                            ║
║  [➕ Permit User] [🚫 Blacklist] [🔄 Reset Perms]          ║
║  [👁️ Hide VC] [👁️‍🗨️ Unhide VC]                              ║
║                                                            ║
║  [🎵 Soundboard] [⏱️ Slowmode] [📡 Bitrate]                ║
║  [📝 VC Status] [💬 Lock Text]                             ║
║                                                            ║
║  [👑 Show Ownership] [🔄 Transfer] [✋ Claim]               ║
║  [👥 Co-Owners] [⚡ Bulk Actions]                          ║
╠════════════════════════════════════════════════════════════╣
║  💎 Premium Voice Management • Powered by Your Bot        ║
║  Today at 12:34 PM                                         ║
╚════════════════════════════════════════════════════════════╝
```

## Button Layout Details

### Row 1: Essential Controls (Blue/Primary)
```
[✏️ Change Name] - Opens modal to rename channel
[🔒 Lock]        - Locks channel (red/danger style)
[🔓 Unlock]      - Unlocks channel (green/success style)
[ℹ️ Info]        - Shows statistics (gray/secondary style)
[👥 Set Limit]   - Opens modal to set user limit
```

### Row 2: Permissions & Access
```
[➕ Permit User]  - Opens modal to whitelist (green/success style)
[🚫 Blacklist]    - Opens modal to blacklist (red/danger style)
[🔄 Reset Perms]  - Resets all permissions (gray/secondary style)
[👁️ Hide VC]      - Hides channel from everyone (gray/secondary style)
[👁️‍🗨️ Unhide VC]   - Shows channel to everyone (gray/secondary style)
```

### Row 3: Settings & Configuration (Blue/Primary)
```
[🎵 Soundboard] - Toggles soundboard on/off
[⏱️ Slowmode]   - Opens modal to set slowmode
[📡 Bitrate]    - Opens modal to adjust audio quality
[📝 VC Status]  - Opens modal to set channel status
[💬 Lock Text]  - Toggles text chat lock (gray/secondary style)
```

### Row 4: Ownership & Advanced
```
[👑 Show Ownership]   - Lists owner and co-owners (gray/secondary style)
[🔄 Transfer]         - Transfers ownership (red/danger style)
[✋ Claim]             - Claims ownership if owner left (green/success style)
[👥 Co-Owners]        - Opens co-owner management modal (blue/primary style)
[⚡ Bulk Actions]     - Shows bulk operations menu (gray/secondary style)
```

## Color Scheme

### Embed Colors
- **Header**: Discord Blurple (#5865F2)
- **Success**: Green (#57F287)
- **Error**: Red (#ED4245)
- **Warning**: Yellow (#FEE75C)
- **Info**: Blurple (#5865F2)

### Button Styles
- **Primary (Blue)**: Main actions, neutral operations
- **Success (Green)**: Positive actions (unlock, permit, claim)
- **Danger (Red)**: Destructive actions (lock, blacklist, transfer)
- **Secondary (Gray)**: Information and toggles

## Modal Examples

### Change Name Modal
```
╔═══════════════════════════════════╗
║  Change Voice Channel Name        ║
╠═══════════════════════════════════╣
║                                   ║
║  New Channel Name                 ║
║  ┌─────────────────────────────┐  ║
║  │ My Awesome Channel          │  ║
║  └─────────────────────────────┘  ║
║  1-100 characters                 ║
║                                   ║
║         [Cancel]  [Submit]        ║
╚═══════════════════════════════════╝
```

### Set Limit Modal
```
╔═══════════════════════════════════╗
║  Set User Limit                   ║
╠═══════════════════════════════════╣
║                                   ║
║  User Limit (0 for unlimited)     ║
║  ┌─────────────────────────────┐  ║
║  │ 10                          │  ║
║  └─────────────────────────────┘  ║
║  0-99                             ║
║                                   ║
║         [Cancel]  [Submit]        ║
╚═══════════════════════════════════╝
```

### Permit/Blacklist User Modal
```
╔═══════════════════════════════════╗
║  Permit User or Role              ║
╠═══════════════════════════════════╣
║                                   ║
║  User/Role (mention or ID)        ║
║  ┌─────────────────────────────┐  ║
║  │ @username or ID             │  ║
║  └─────────────────────────────┘  ║
║                                   ║
║         [Cancel]  [Submit]        ║
╚═══════════════════════════════════╝
```

### Manage Co-Owners Modal
```
╔═══════════════════════════════════╗
║  Manage Co-Owners                 ║
╠═══════════════════════════════════╣
║                                   ║
║  Action: add, remove, list, clear ║
║  ┌─────────────────────────────┐  ║
║  │ add                         │  ║
║  └─────────────────────────────┘  ║
║                                   ║
║  User (mention or ID)             ║
║  ┌─────────────────────────────┐  ║
║  │ @username or ID             │  ║
║  └─────────────────────────────┘  ║
║  For add/remove only              ║
║                                   ║
║         [Cancel]  [Submit]        ║
╚═══════════════════════════════════╝
```

### Bitrate Modal
```
╔═══════════════════════════════════╗
║  Set Bitrate                      ║
╠═══════════════════════════════════╣
║                                   ║
║  Bitrate in kbps (8-384)          ║
║  ┌─────────────────────────────┐  ║
║  │ 128                         │  ║
║  └─────────────────────────────┘  ║
║  64, 96, 128, 256, 384...         ║
║                                   ║
║         [Cancel]  [Submit]        ║
╚═══════════════════════════════════╝
```

## Response Messages

### Success Messages (Green)
```
✅ Channel name changed to New Name
✅ Voice channel locked! Only you and co-owners can join.
✅ Voice channel unlocked! Everyone can join now.
✅ User limit set to 10
✅ @user has been permitted to join the channel.
✅ @user has been blacklisted from the channel.
✅ Soundboard enabled successfully!
✅ Voice channel hidden from everyone except you and co-owners.
✅ Bitrate set to 128 kbps
✅ @user added as co-owner.
```

### Error Messages (Red)
```
❌ Voice channel not found or no longer exists.
❌ You don't have permission to manage this voice channel.
❌ Invalid user or role. Please use a mention or valid ID.
❌ You cannot blacklist the channel owner.
❌ Failed to lock the channel. Please try again.
❌ Only the channel owner can transfer ownership.
❌ Cannot claim ownership while the current owner is in the channel.
```

### Warning Messages (Yellow)
```
⚠️ Setting bitrate above 64kbps requires a boosted server or premium features. Current: 128 kbps
⚠️ This action will affect all current permissions. Are you sure?
```

### Info Messages (Blue)
```
📊 Channel Statistics

Name: My Voice Channel
Owner: @username
Co-Owners: 3
Created: 2 days ago

Current Members: 5
User Limit: 10
Bitrate: 128 kbps
Region: Automatic

Soundboard: Enabled
Slowmode: 5s
Text Chat: Unlocked

Blacklisted: 2
Whitelisted: 4
```

## Visibility Rules

### Who Can See the Sticky Message?
✅ Channel Owner
✅ Co-Owners
✅ Users with "cowner" role
✅ Users with "channel owner" role
✅ Users with "vc manager" role
✅ Server Administrators

### Who Can Use the Buttons?
Same as above - only authorized users see interactive buttons.

### What Happens If Unauthorized User Clicks?
```
❌ You don't have permission to manage this voice channel.
(Ephemeral message - only visible to them)
```

## Auto-Update Triggers

The sticky message automatically updates when:
- ✅ Channel name changes
- ✅ User limit changes
- ✅ Soundboard toggled
- ✅ Slowmode changed
- ✅ Text chat lock toggled
- ✅ Owner changes
- ✅ Co-owners added/removed
- ✅ User joins/leaves voice channel

## Special Features

### Auto-Recreation
If the sticky message is deleted, it automatically recreates within seconds.

### Always Pinned
The sticky message stays pinned at the top of the text channel for easy access.

### Ephemeral Responses
All button click responses are ephemeral (only visible to the user who clicked).

### Real-Time Stats
The embed shows live stats including current members, settings, and ownership info.

---

**This layout ensures a premium, intuitive user experience with clear visual hierarchy and instant feedback!**
