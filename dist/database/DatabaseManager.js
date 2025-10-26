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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class DatabaseManager {
    db;
    dbPath;
    constructor() {
        this.dbPath = process.env.DATABASE_PATH || './data/bot.db';
    }
    async initialize() {
        // Ensure data directory exists
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        this.db = new better_sqlite3_1.default(this.dbPath);
        this.db.pragma('journal_mode = WAL');
        this.createTables();
    }
    createTables() {
        // Setup configuration table for Join-to-Create system
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS setup_config (
        guild_id TEXT PRIMARY KEY,
        jtc_channel_id TEXT NOT NULL,
        category_id TEXT,
        text_category_id TEXT,
        channel_name_format TEXT DEFAULT '{username}''s Channel',
        created_at INTEGER NOT NULL
      )
    `);
        // Voice channels table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS voice_channels (
        channel_id TEXT PRIMARY KEY,
        guild_id TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        sticky_message_id TEXT,
        text_channel_id TEXT,
        is_temporary INTEGER DEFAULT 1,
        custom_gif TEXT
      )
    `);
        // Co-owners table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS coowners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        added_by TEXT NOT NULL,
        added_at INTEGER NOT NULL,
        is_permanent INTEGER DEFAULT 0,
        UNIQUE(channel_id, user_id),
        FOREIGN KEY (channel_id) REFERENCES voice_channels(channel_id) ON DELETE CASCADE
      )
    `);
        // Channel permissions (whitelist/blacklist)
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS channel_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        target_type TEXT NOT NULL CHECK(target_type IN ('user', 'role')),
        permission_type TEXT NOT NULL CHECK(permission_type IN ('whitelist', 'blacklist')),
        added_by TEXT NOT NULL,
        added_at INTEGER NOT NULL,
        UNIQUE(channel_id, target_id, permission_type),
        FOREIGN KEY (channel_id) REFERENCES voice_channels(channel_id) ON DELETE CASCADE
      )
    `);
        // Channel settings
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS channel_settings (
        channel_id TEXT PRIMARY KEY,
        soundboard_enabled INTEGER DEFAULT 1,
        slowmode INTEGER DEFAULT 0,
        text_chat_locked INTEGER DEFAULT 0,
        FOREIGN KEY (channel_id) REFERENCES voice_channels(channel_id) ON DELETE CASCADE
      )
    `);
        // User preferences table (for persistent settings like custom GIFs)
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id TEXT PRIMARY KEY,
        guild_id TEXT NOT NULL,
        custom_gif TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
        // Create indexes
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_voice_channels_guild ON voice_channels(guild_id);
      CREATE INDEX IF NOT EXISTS idx_coowners_channel ON coowners(channel_id);
      CREATE INDEX IF NOT EXISTS idx_permissions_channel ON channel_permissions(channel_id);
      CREATE INDEX IF NOT EXISTS idx_user_preferences_guild ON user_preferences(guild_id);
    `);
        // Migration: Add custom_gif column if it doesn't exist (legacy, will use user_preferences now)
        try {
            this.db.exec(`ALTER TABLE voice_channels ADD COLUMN custom_gif TEXT`);
            console.log('✅ Added custom_gif column to voice_channels table');
        }
        catch (error) {
            // Column already exists, ignore error
            if (!error.message.includes('duplicate column')) {
                console.error('Error adding custom_gif column:', error);
            }
        }
    }
    // Setup Configuration Operations
    setSetupConfig(config) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO setup_config 
      (guild_id, jtc_channel_id, category_id, text_category_id, channel_name_format, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(config.guildId, config.jtcChannelId, config.categoryId || null, config.textCategoryId || null, config.channelNameFormat || '{username}\'s Channel', config.createdAt);
    }
    getSetupConfig(guildId) {
        const stmt = this.db.prepare('SELECT * FROM setup_config WHERE guild_id = ?');
        const row = stmt.get(guildId);
        if (!row)
            return null;
        return {
            guildId: row.guild_id,
            jtcChannelId: row.jtc_channel_id,
            categoryId: row.category_id,
            textCategoryId: row.text_category_id,
            channelNameFormat: row.channel_name_format,
            createdAt: row.created_at,
        };
    }
    deleteSetupConfig(guildId) {
        this.db.prepare('DELETE FROM setup_config WHERE guild_id = ?').run(guildId);
    }
    // Voice Channel Operations
    createVoiceChannel(data) {
        const stmt = this.db.prepare(`
      INSERT INTO voice_channels (channel_id, guild_id, owner_id, created_at, text_channel_id, is_temporary)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(data.channelId, data.guildId, data.ownerId, data.createdAt, data.textChannelId, data.isTemporary ? 1 : 0);
        // Create default settings
        this.db.prepare(`
      INSERT INTO channel_settings (channel_id) VALUES (?)
    `).run(data.channelId);
    }
    getVoiceChannel(channelId) {
        const stmt = this.db.prepare(`
      SELECT * FROM voice_channels WHERE channel_id = ?
    `);
        const row = stmt.get(channelId);
        if (!row)
            return null;
        return {
            channelId: row.channel_id,
            guildId: row.guild_id,
            ownerId: row.owner_id,
            createdAt: row.created_at,
            stickyMessageId: row.sticky_message_id,
            textChannelId: row.text_channel_id,
            isTemporary: row.is_temporary === 1,
        };
    }
    updateStickyMessage(channelId, messageId) {
        this.db.prepare(`
      UPDATE voice_channels SET sticky_message_id = ? WHERE channel_id = ?
    `).run(messageId, channelId);
    }
    updateOwner(channelId, newOwnerId) {
        this.db.prepare(`
      UPDATE voice_channels SET owner_id = ? WHERE channel_id = ?
    `).run(newOwnerId, channelId);
    }
    // User Preferences Operations (for persistent custom GIFs per user)
    setUserCustomGif(userId, guildId, gifUrl) {
        const now = Date.now();
        console.log(`💾 Saving custom GIF for user ${userId} in guild ${guildId}: ${gifUrl}`);
        this.db.prepare(`
      INSERT OR REPLACE INTO user_preferences (user_id, guild_id, custom_gif, created_at, updated_at)
      VALUES (?, ?, ?, COALESCE((SELECT created_at FROM user_preferences WHERE user_id = ? AND guild_id = ?), ?), ?)
    `).run(userId, guildId, gifUrl, userId, guildId, now, now);
        console.log(`✅ Saved successfully!`);
    }
    getUserCustomGif(userId, guildId) {
        console.log(`🔍 Looking up custom GIF for user ${userId} in guild ${guildId}`);
        const stmt = this.db.prepare(`
      SELECT custom_gif FROM user_preferences WHERE user_id = ? AND guild_id = ?
    `);
        const row = stmt.get(userId, guildId);
        console.log(`📊 Database result:`, row);
        return row?.custom_gif || null;
    }
    // Legacy methods (for backward compatibility)
    setCustomGif(channelId, gifUrl) {
        this.db.prepare(`
      UPDATE voice_channels SET custom_gif = ? WHERE channel_id = ?
    `).run(gifUrl, channelId);
    }
    getCustomGif(channelId) {
        const stmt = this.db.prepare(`
      SELECT custom_gif FROM voice_channels WHERE channel_id = ?
    `);
        const row = stmt.get(channelId);
        return row?.custom_gif || null;
    }
    deleteVoiceChannel(channelId) {
        this.db.prepare('DELETE FROM voice_channels WHERE channel_id = ?').run(channelId);
    }
    getAllVoiceChannels() {
        const stmt = this.db.prepare('SELECT * FROM voice_channels');
        const rows = stmt.all();
        return rows.map(row => ({
            channelId: row.channel_id,
            guildId: row.guild_id,
            ownerId: row.owner_id,
            createdAt: row.created_at,
            stickyMessageId: row.sticky_message_id,
            textChannelId: row.text_channel_id,
            isTemporary: row.is_temporary === 1,
        }));
    }
    // Co-owner Operations
    addCoOwner(coowner) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO coowners (channel_id, user_id, added_by, added_at, is_permanent)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(coowner.channelId, coowner.userId, coowner.addedBy, coowner.addedAt, coowner.isPermanent ? 1 : 0);
    }
    removeCoOwner(channelId, userId) {
        this.db.prepare(`
      DELETE FROM coowners WHERE channel_id = ? AND user_id = ?
    `).run(channelId, userId);
    }
    getCoOwners(channelId) {
        const stmt = this.db.prepare('SELECT * FROM coowners WHERE channel_id = ?');
        const rows = stmt.all(channelId);
        return rows.map(row => ({
            channelId: row.channel_id,
            userId: row.user_id,
            addedBy: row.added_by,
            addedAt: row.added_at,
            isPermanent: row.is_permanent === 1,
        }));
    }
    clearCoOwners(channelId) {
        this.db.prepare('DELETE FROM coowners WHERE channel_id = ?').run(channelId);
    }
    // Permission Operations
    addPermission(permission) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO channel_permissions 
      (channel_id, target_id, target_type, permission_type, added_by, added_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(permission.channelId, permission.targetId, permission.targetType, permission.permissionType, permission.addedBy, permission.addedAt);
    }
    removePermission(channelId, targetId, permissionType) {
        this.db.prepare(`
      DELETE FROM channel_permissions 
      WHERE channel_id = ? AND target_id = ? AND permission_type = ?
    `).run(channelId, targetId, permissionType);
    }
    getPermissions(channelId) {
        const stmt = this.db.prepare('SELECT * FROM channel_permissions WHERE channel_id = ?');
        const rows = stmt.all(channelId);
        return rows.map(row => ({
            channelId: row.channel_id,
            targetId: row.target_id,
            targetType: row.target_type,
            permissionType: row.permission_type,
            addedBy: row.added_by,
            addedAt: row.added_at,
        }));
    }
    // Settings Operations
    getSettings(channelId) {
        const stmt = this.db.prepare('SELECT * FROM channel_settings WHERE channel_id = ?');
        const row = stmt.get(channelId);
        if (!row) {
            return {
                channelId,
                soundboardEnabled: true,
                slowmode: 0,
                textChatLocked: false,
            };
        }
        return {
            channelId: row.channel_id,
            soundboardEnabled: row.soundboard_enabled === 1,
            slowmode: row.slowmode,
            textChatLocked: row.text_chat_locked === 1,
        };
    }
    updateSettings(channelId, settings) {
        const current = this.getSettings(channelId);
        const updated = { ...current, ...settings };
        this.db.prepare(`
      INSERT OR REPLACE INTO channel_settings 
      (channel_id, soundboard_enabled, slowmode, text_chat_locked)
      VALUES (?, ?, ?, ?)
    `).run(channelId, updated.soundboardEnabled ? 1 : 0, updated.slowmode, updated.textChatLocked ? 1 : 0);
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=DatabaseManager.js.map