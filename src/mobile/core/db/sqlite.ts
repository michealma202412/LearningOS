/**
 * LearningOS SQLite 数据库模块（移动端）
 * 
 * 使用 @capacitor-community/sqlite 插件实现本地数据存储
 * 替代 Web 版的 IndexedDB，提供更好的移动端性能和稳定性
 */

import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | null = null;

/**
 * 初始化数据库连接和表结构
 */
export async function initDB(): Promise<void> {
  if (db) {
    console.log('✅ 数据库已初始化');
    return;
  }

  try {
    // 创建数据库连接
    db = await sqlite.createConnection(
      'learningos',
      false, // no-encryption for development
      'no-encryption',
      1,
      false
    );
    
    await db.open();
    console.log('✅ 数据库连接已打开');

    // 创建笔记表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT DEFAULT '',
        content TEXT NOT NULL,
        audio_path TEXT DEFAULT '',
        tags TEXT DEFAULT '',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );
    `);

    // 创建复习计划表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        noteId TEXT NOT NULL,
        scheduledAt TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE
      );
    `);

    console.log('✅ SQLite 数据库初始化完成');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
}

/**
 * 插入新笔记
 */
export async function insertNote(note: {
  id: string;
  title?: string;
  content: string;
  audio_path?: string;
  tags?: string;
}): Promise<void> {
  if (!db) await initDB();

  const now = new Date().toISOString();
  
  try {
    await db!.run(
      `INSERT INTO notes (id, title, content, audio_path, tags, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        note.id,
        note.title || '',
        note.content,
        note.audio_path || '',
        note.tags || '',
        now,
        now
      ]
    );
    console.log('✅ 笔记已保存:', note.id);
  } catch (error) {
    console.error('❌ 保存笔记失败:', error);
    throw error;
  }
}

/**
 * 获取所有笔记（按时间倒序）
 */
export async function getNotes(): Promise<any[]> {
  if (!db) await initDB();

  try {
    const res = await db!.query('SELECT * FROM notes ORDER BY createdAt DESC');
    return res.values || [];
  } catch (error) {
    console.error('❌ 获取笔记列表失败:', error);
    throw error;
  }
}

/**
 * 根据 ID 获取单个笔记
 */
export async function getNoteById(id: string): Promise<any> {
  if (!db) await initDB();

  try {
    const res = await db!.query('SELECT * FROM notes WHERE id = ?', [id]);
    return res.values?.[0] || null;
  } catch (error) {
    console.error('❌ 获取笔记详情失败:', error);
    throw error;
  }
}

/**
 * 更新笔记
 */
export async function updateNote(
  id: string,
  updates: Partial<{
    title: string;
    content: string;
    audio_path: string;
    tags: string;
  }>
): Promise<void> {
  if (!db) await initDB();

  const now = new Date().toISOString();
  const fields = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), now, id];

  try {
    await db!.run(
      `UPDATE notes SET ${fields}, updatedAt = ? WHERE id = ?`,
      values
    );
    console.log('✅ 笔记已更新:', id);
  } catch (error) {
    console.error('❌ 更新笔记失败:', error);
    throw error;
  }
}

/**
 * 删除笔记
 */
export async function deleteNote(id: string): Promise<void> {
  if (!db) await initDB();

  try {
    await db!.run('DELETE FROM notes WHERE id = ?', [id]);
    console.log('✅ 笔记已删除:', id);
  } catch (error) {
    console.error('❌ 删除笔记失败:', error);
    throw error;
  }
}

/**
 * 关闭数据库连接
 */
export async function closeDB(): Promise<void> {
  if (db) {
    await db.close();
    await sqlite.closeConnection('learningos', false);
    db = null;
    console.log('✅ 数据库连接已关闭');
  }
}




