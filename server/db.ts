import { createRequire } from 'module';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { coursesToSeed } from './coursesSeed.js';

const require = createRequire(import.meta.url);

let sqlite3: any = null;
try {
  sqlite3 = require('sqlite3');
} catch (e) {
  console.warn('[SQLite] Native sqlite3 module unavailable, running with memory vault.');
}

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ENCRYPTED_DB_PATH = path.join(DATA_DIR, 'academy_encrypted.db');
const RUNTIME_DB_PATH = path.join(DATA_DIR, 'academy_runtime.db');

// Encryption Secret Key for DB File Vault
const ENCRYPTION_SECRET = process.env.DB_ENCRYPTION_KEY || 'L_ELIXIR_DE_MATHIEU_SECURE_SQLITE_AES256_KEY_2026';
const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.scryptSync(ENCRYPTION_SECRET, 'salt_elixir_v1', 32);

// Decrypt DB file to runtime DB at startup if encrypted DB exists
function initEncryptedStorage() {
  if (fs.existsSync(ENCRYPTED_DB_PATH)) {
    try {
      const encryptedData = fs.readFileSync(ENCRYPTED_DB_PATH);
      if (encryptedData.length > 16) {
        const iv = encryptedData.subarray(0, 16);
        const ciphertext = encryptedData.subarray(16);
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        fs.writeFileSync(RUNTIME_DB_PATH, decrypted);
        console.log('[SQLite Security] Successfully decrypted database payload into runtime engine.');
      }
    } catch (err) {
      console.error('[SQLite Security Error] Decryption failed, creating fresh database file:', err);
    }
  }
}

// Encrypt runtime DB back to disk vault
export function persistEncryptedDatabase() {
  try {
    if (fs.existsSync(RUNTIME_DB_PATH)) {
      const rawData = fs.readFileSync(RUNTIME_DB_PATH);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
      const encrypted = Buffer.concat([iv, cipher.update(rawData), cipher.final()]);
      fs.writeFileSync(ENCRYPTED_DB_PATH, encrypted);
      console.log('[SQLite Security] Database encrypted and persisted to disk vault.');
    }
  } catch (err) {
    console.error('[SQLite Security Error] Encryption persistence failed:', err);
  }
}

initEncryptedStorage();

let sqliteDb: any = null;
try {
  if (sqlite3) {
    sqliteDb = new sqlite3.Database(RUNTIME_DB_PATH, (err: any) => {
      if (err) {
        console.error('[SQLite] Error opening database file, using fallback driver:', err);
      } else {
        console.log('[SQLite] Runtime Database connected successfully.');
      }
    });
  } else {
    console.warn('[SQLite] Driver null, using fallback memory store.');
  }
} catch (e) {
  console.warn('[SQLite] Native driver unavailable, initializing memory store.');
}

// Memory store fallback
const memStore: Record<string, any[]> = {
  users: [],
  challenges: [],
  quizzes: [],
  user_progress: [],
  overdue_tasks: [],
  courses: [],
  lessons: [],
  user_course_progress: []
};
let autoIncId = 1;

function fallbackQuery(sql: string, params: any[]): any[] {
  const lower = sql.toLowerCase().trim();
  if (lower.includes('count(*)')) {
    let tableName = 'users';
    if (lower.includes('from users')) tableName = 'users';
    if (lower.includes('from challenges')) tableName = 'challenges';
    if (lower.includes('from quizzes')) tableName = 'quizzes';
    if (lower.includes('from courses')) tableName = 'courses';
    if (lower.includes('from lessons')) tableName = 'lessons';
    return [{ count: (memStore[tableName] || []).length }];
  }
  if (lower.includes('from users')) {
    if (lower.includes('where username = ?')) {
      return memStore.users.filter(u => u.username === params[0]);
    }
    if (lower.includes('where id = ?')) {
      return memStore.users.filter(u => u.id === Number(params[0]));
    }
    if (lower.includes('where username = ? or email = ?')) {
      return memStore.users.filter(u => u.username === params[0] || u.email === params[1]);
    }
    return memStore.users;
  }
  if (lower.includes('from user_progress')) {
    if (lower.includes('where userid = ?')) {
      return memStore.user_progress.filter(p => p.userId === Number(params[0]));
    }
    return memStore.user_progress;
  }
  if (lower.includes('from challenges')) {
    if (lower.includes('where id = ?')) {
      return memStore.challenges.filter(c => c.id === Number(params[0]));
    }
    return memStore.challenges;
  }
  if (lower.includes('from quizzes')) {
    if (lower.includes('where id = ?')) {
      return memStore.quizzes.filter(q => q.id === Number(params[0]));
    }
    return memStore.quizzes;
  }
  if (lower.includes('from overdue_tasks')) {
    if (lower.includes('where userid = ?')) {
      return memStore.overdue_tasks.filter(t => t.userId === Number(params[0]) && (!t.isCompleted || t.isCompleted === 0));
    }
    return memStore.overdue_tasks;
  }
  if (lower.includes('from courses')) {
    if (lower.includes('where id = ?')) {
      return memStore.courses.filter(c => c.id === Number(params[0]));
    }
    if (lower.includes('where trackid = ?')) {
      return memStore.courses.filter(c => c.trackId === params[0]);
    }
    return memStore.courses;
  }
  if (lower.includes('from lessons')) {
    if (lower.includes('where id = ?')) {
      return memStore.lessons.filter(l => l.id === Number(params[0]));
    }
    if (lower.includes('where courseid = ?')) {
      return memStore.lessons.filter(l => l.courseId === Number(params[0])).sort((a, b) => a.orderNum - b.orderNum);
    }
    return memStore.lessons;
  }
  if (lower.includes('from user_course_progress')) {
    if (lower.includes('where userid = ? and courseid = ?')) {
      return memStore.user_course_progress.filter(ucp => ucp.userId === Number(params[0]) && ucp.courseId === Number(params[1]));
    }
    if (lower.includes('where userid = ?')) {
      return memStore.user_course_progress.filter(ucp => ucp.userId === Number(params[0]));
    }
    return memStore.user_course_progress;
  }
  return [];
}

function fallbackRun(sql: string, params: any[]): { lastID: number; changes: number } {
  const lower = sql.toLowerCase().trim();
  const newId = autoIncId++;

  if (lower.startsWith('insert into users')) {
    memStore.users.push({
      id: newId,
      username: params[0],
      password: params[1],
      name: params[2],
      email: params[3],
      role: params[4] || 'student',
      streakDays: params[5] || 1,
      lastActiveDate: params[6] || new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    return { lastID: newId, changes: 1 };
  }
  if (lower.startsWith('insert into user_progress')) {
    memStore.user_progress.push({
      userId: params[0],
      completedChallengeIds: params[1] || '[]',
      completedQuizScores: params[2] || '{}',
      earnedBadgeIds: params[3] || '["b_welcome"]',
      points: params[4] || 0,
      weeklyActivity: params[5] || '[1, 0, 0, 0, 0, 0, 0]'
    });
    return { lastID: params[0], changes: 1 };
  }
  if (lower.startsWith('insert into challenges')) {
    memStore.challenges.push({
      id: newId,
      trackId: params[0],
      title: params[1],
      difficulty: params[2],
      description: params[3],
      starterCodeHtml: params[4],
      starterCodeCss: params[5],
      starterCodeJs: params[6],
      instructions: params[7],
      expectedOutputRegex: params[8],
      points: params[9] || 50
    });
    return { lastID: newId, changes: 1 };
  }
  if (lower.startsWith('insert into quizzes')) {
    memStore.quizzes.push({
      id: newId,
      trackId: params[0],
      title: params[1],
      description: params[2],
      timeLimitMinutes: params[3],
      questions: params[4]
    });
    return { lastID: newId, changes: 1 };
  }
  if (lower.startsWith('insert into overdue_tasks')) {
    memStore.overdue_tasks.push({
      id: params[0],
      userId: params[1],
      title: params[2],
      type: params[3],
      targetId: params[4],
      dueDate: params[5],
      trackTitle: params[6],
      isCompleted: params[7] || 0
    });
    return { lastID: 1, changes: 1 };
  }
  if (lower.startsWith('insert into courses')) {
    memStore.courses.push({
      id: newId,
      trackId: params[0],
      title: params[1],
      level: params[2],
      description: params[3],
      iconName: params[4],
      estimatedHours: params[5],
      prerequisiteCourseId: params[6] || null
    });
    return { lastID: newId, changes: 1 };
  }
  if (lower.startsWith('insert into lessons')) {
    memStore.lessons.push({
      id: newId,
      courseId: params[0],
      orderNum: params[1],
      title: params[2],
      summary: params[3],
      contentMarkdown: params[4],
      codeExampleHtml: params[5],
      codeExampleCss: params[6],
      codeExampleJs: params[7],
      codeExamplePhp: params[8],
      codeExampleSql: params[9],
      keyTakeaways: params[10],
      sandboxBridgeChallengeId: params[11]
    });
    return { lastID: newId, changes: 1 };
  }
  if (lower.startsWith('insert into user_course_progress')) {
    const existingIdx = memStore.user_course_progress.findIndex(ucp => ucp.userId === Number(params[0]) && ucp.courseId === Number(params[1]));
    if (existingIdx !== -1) {
      memStore.user_course_progress[existingIdx].completedLessonIds = params[2];
      memStore.user_course_progress[existingIdx].isCourseCompleted = params[3];
    } else {
      memStore.user_course_progress.push({
        userId: Number(params[0]),
        courseId: Number(params[1]),
        completedLessonIds: params[2],
        isCourseCompleted: params[3]
      });
    }
    return { lastID: Number(params[1]), changes: 1 };
  }
  if (lower.startsWith('update user_course_progress')) {
    const existingIdx = memStore.user_course_progress.findIndex(ucp => ucp.userId === Number(params[2]) && ucp.courseId === Number(params[3]));
    if (existingIdx !== -1) {
      memStore.user_course_progress[existingIdx].completedLessonIds = params[0];
      memStore.user_course_progress[existingIdx].isCourseCompleted = params[1];
    } else {
      memStore.user_course_progress.push({
        userId: Number(params[2]),
        courseId: Number(params[3]),
        completedLessonIds: params[0],
        isCourseCompleted: params[1]
      });
    }
    return { lastID: Number(params[3]), changes: 1 };
  }
  if (lower.startsWith('update users')) {
    const idx = memStore.users.findIndex(u => u.id === Number(params[2]));
    if (idx !== -1) {
      memStore.users[idx].streakDays = params[0];
      memStore.users[idx].lastActiveDate = params[1];
    }
    return { lastID: params[2], changes: 1 };
  }
  if (lower.startsWith('update user_progress')) {
    const userId = params[3] || params[2];
    const idx = memStore.user_progress.findIndex(p => p.userId === Number(userId));
    if (idx !== -1) {
      if (params.length >= 4) {
        memStore.user_progress[idx].completedChallengeIds = params[0];
        memStore.user_progress[idx].earnedBadgeIds = params[1];
        memStore.user_progress[idx].points = params[2];
      } else if (params.length === 3) {
        memStore.user_progress[idx].completedQuizScores = params[0];
        memStore.user_progress[idx].earnedBadgeIds = params[1];
      }
    }
    return { lastID: Number(userId), changes: 1 };
  }
  if (lower.startsWith('update overdue_tasks')) {
    const idx = memStore.overdue_tasks.findIndex(t => t.id === params[0] && t.userId === Number(params[1]));
    if (idx !== -1) {
      memStore.overdue_tasks[idx].isCompleted = 1;
    }
    return { lastID: 1, changes: 1 };
  }
  if (lower.startsWith('delete from users')) {
    memStore.users = memStore.users.filter(u => u.id !== Number(params[0]));
    return { lastID: Number(params[0]), changes: 1 };
  }
  if (lower.startsWith('delete from user_progress')) {
    memStore.user_progress = memStore.user_progress.filter(p => p.userId !== Number(params[0]));
    return { lastID: Number(params[0]), changes: 1 };
  }
  if (lower.startsWith('delete from challenges')) {
    memStore.challenges = memStore.challenges.filter(c => c.id !== Number(params[0]));
    return { lastID: Number(params[0]), changes: 1 };
  }
  if (lower.startsWith('delete from courses')) {
    memStore.courses = memStore.courses.filter(c => c.id !== Number(params[0]));
    memStore.lessons = memStore.lessons.filter(l => l.courseId !== Number(params[0]));
    return { lastID: Number(params[0]), changes: 1 };
  }
  if (lower.startsWith('delete from lessons')) {
    memStore.lessons = memStore.lessons.filter(l => l.id !== Number(params[0]));
    return { lastID: Number(params[0]), changes: 1 };
  }
  return { lastID: newId, changes: 1 };
}

// Helper for DB queries wrapped in Promises
export const dbQuery = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve) => {
    if (sqliteDb) {
      sqliteDb.all(sql, params, (err: any, rows: any[]) => {
        if (err) {
          resolve(fallbackQuery(sql, params));
        } else {
          resolve(rows || []);
        }
      });
    } else {
      resolve(fallbackQuery(sql, params));
    }
  });
};

export const dbRun = (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve) => {
    if (sqliteDb) {
      sqliteDb.run(sql, params, function (this: any, err: any) {
        if (err) {
          resolve(fallbackRun(sql, params));
        } else {
          resolve({ lastID: this ? this.lastID : autoIncId++, changes: this ? this.changes : 1 });
        }
      });
    } else {
      resolve(fallbackRun(sql, params));
    }
  });
};

export const dbGet = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve) => {
    if (sqliteDb) {
      sqliteDb.get(sql, params, (err: any, row: any) => {
        if (err) {
          const rows = fallbackQuery(sql, params);
          resolve(rows[0] || null);
        } else {
          resolve(row || null);
        }
      });
    } else {
      const rows = fallbackQuery(sql, params);
      resolve(rows[0] || null);
    }
  });
};

// Audit logs array for Admin Inspection
export const auditLogs: { timestamp: string; action: string; user: string; status: string }[] = [];

export function addAuditLog(action: string, user: string, status: string = 'SUCCESS') {
  auditLogs.unshift({
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    action,
    user,
    status
  });
  if (auditLogs.length > 50) auditLogs.pop();
}

// Database Setup & Seeding
export async function setupDatabase() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      streakDays INTEGER DEFAULT 1,
      lastActiveDate TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trackId TEXT NOT NULL,
      title TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      description TEXT NOT NULL,
      starterCodeHtml TEXT NOT NULL,
      starterCodeCss TEXT NOT NULL,
      starterCodeJs TEXT NOT NULL,
      instructions TEXT NOT NULL, -- JSON string
      expectedOutputRegex TEXT,
      points INTEGER DEFAULT 50
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trackId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      timeLimitMinutes INTEGER DEFAULT 10,
      questions TEXT NOT NULL -- JSON string
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS user_progress (
      userId INTEGER PRIMARY KEY,
      completedChallengeIds TEXT DEFAULT '[]', -- JSON
      completedQuizScores TEXT DEFAULT '{}', -- JSON
      earnedBadgeIds TEXT DEFAULT '["b_welcome"]', -- JSON
      points INTEGER DEFAULT 0,
      weeklyActivity TEXT DEFAULT '[1, 2, 0, 3, 4, 1, 5]', -- JSON
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS overdue_tasks (
      id TEXT PRIMARY KEY,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      targetId INTEGER NOT NULL,
      dueDate TEXT NOT NULL,
      trackTitle TEXT NOT NULL,
      isCompleted INTEGER DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trackId TEXT NOT NULL,
      title TEXT NOT NULL,
      level TEXT NOT NULL,
      description TEXT NOT NULL,
      iconName TEXT NOT NULL,
      estimatedHours INTEGER DEFAULT 3,
      prerequisiteCourseId INTEGER DEFAULT NULL
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      orderNum INTEGER NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      contentMarkdown TEXT NOT NULL,
      codeExampleHtml TEXT,
      codeExampleCss TEXT,
      codeExampleJs TEXT,
      codeExamplePhp TEXT,
      codeExampleSql TEXT,
      keyTakeaways TEXT,
      sandboxBridgeChallengeId INTEGER,
      FOREIGN KEY (courseId) REFERENCES courses (id) ON DELETE CASCADE
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS user_course_progress (
      userId INTEGER NOT NULL,
      courseId INTEGER NOT NULL,
      completedLessonIds TEXT DEFAULT '[]',
      isCourseCompleted INTEGER DEFAULT 0,
      PRIMARY KEY (userId, courseId)
    )
  `);

  // Seed Courses & Lessons if empty
  const courseCount = await dbGet('SELECT COUNT(*) as count FROM courses');
  if (!courseCount || !courseCount.count || courseCount.count === 0) {
    console.log('[SQLite Seeding] Initializing multi-language Web Development Courses & Study Guides...');

    for (const c of coursesToSeed) {
      const courseRes = await dbRun(
        'INSERT INTO courses (trackId, title, level, description, iconName, estimatedHours, prerequisiteCourseId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [c.trackId, c.title, c.level, c.description, c.iconName, c.estimatedHours, c.prerequisiteCourseId]
      );

      for (const l of c.lessons) {
        const lessonObj = l as any;
        await dbRun(
          'INSERT INTO lessons (courseId, orderNum, title, summary, contentMarkdown, codeExampleHtml, codeExampleCss, codeExampleJs, codeExamplePhp, codeExampleSql, keyTakeaways, sandboxBridgeChallengeId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            courseRes.lastID,
            lessonObj.orderNum,
            lessonObj.title,
            lessonObj.summary,
            lessonObj.contentMarkdown,
            lessonObj.codeExampleHtml || null,
            lessonObj.codeExampleCss || null,
            lessonObj.codeExampleJs || null,
            lessonObj.codeExamplePhp || null,
            lessonObj.codeExampleSql || null,
            JSON.stringify(lessonObj.keyTakeaways || []),
            lessonObj.sandboxBridgeChallengeId || null
          ]
        );
      }
    }
  }

  // Seed default admin and students if empty
  const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
  if (!userCount || !userCount.count || userCount.count === 0) {
    console.log('[SQLite Seeding] Initializing default users and curriculum content...');
    
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const student1PasswordHash = await bcrypt.hash('student123', 10);
    const student2PasswordHash = await bcrypt.hash('code2026', 10);

    const adminRes = await dbRun(
      'INSERT INTO users (username, password, name, email, role, streakDays, lastActiveDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['admin', adminPasswordHash, 'System Administrator', 'admin@webdev.academy', 'admin', 5, new Date().toISOString()]
    );

    const student1Res = await dbRun(
      'INSERT INTO users (username, password, name, email, role, streakDays, lastActiveDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['student1', student1PasswordHash, 'Alex Rivera', 'alex@student.edu', 'student', 4, new Date().toISOString()]
    );

    const student2Res = await dbRun(
      'INSERT INTO users (username, password, name, email, role, streakDays, lastActiveDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['dev_learner', student2PasswordHash, 'Sarah Chen', 'sarah@student.edu', 'student', 2, new Date().toISOString()]
    );

    // Initial User Progress
    await dbRun(
      'INSERT INTO user_progress (userId, completedChallengeIds, completedQuizScores, earnedBadgeIds, points, weeklyActivity) VALUES (?, ?, ?, ?, ?, ?)',
      [
        adminRes.lastID,
        JSON.stringify([1, 2, 3]),
        JSON.stringify({ 1: 100, 2: 90 }),
        JSON.stringify(['b_welcome', 'b_streak3', 'b_css_arch', 'b_js_maestro']),
        450,
        JSON.stringify([3, 5, 4, 6, 2, 7, 5])
      ]
    );

    await dbRun(
      'INSERT INTO user_progress (userId, completedChallengeIds, completedQuizScores, earnedBadgeIds, points, weeklyActivity) VALUES (?, ?, ?, ?, ?, ?)',
      [
        student1Res.lastID,
        JSON.stringify([1]),
        JSON.stringify({ 1: 85 }),
        JSON.stringify(['b_welcome', 'b_streak3']),
        135,
        JSON.stringify([1, 2, 0, 3, 4, 1, 5])
      ]
    );

    await dbRun(
      'INSERT INTO user_progress (userId, completedChallengeIds, completedQuizScores, earnedBadgeIds, points, weeklyActivity) VALUES (?, ?, ?, ?, ?, ?)',
      [
        student2Res.lastID,
        JSON.stringify([]),
        JSON.stringify({}),
        JSON.stringify(['b_welcome']),
        20,
        JSON.stringify([0, 1, 1, 0, 2, 0, 1])
      ]
    );

    // Seed Challenges
    const challengesData = [
      {
        trackId: 'html_basics',
        title: 'HTML Semantic Header & Navigation',
        difficulty: 'Beginner',
        description: 'Build a semantic web header containing an `<h1>` page title and a `<nav>` bar with at least 3 menu links (`<a href="#">`).',
        starterCodeHtml: `<header>\n  <h1>WebDev Academy</h1>\n  <nav>\n    <!-- Add navigation links here -->\n  </nav>\n</header>`,
        starterCodeCss: `header {\n  background-color: #1e293b;\n  color: #ffffff;\n  padding: 1.5rem;\n  font-family: sans-serif;\n  border-radius: 8px;\n}\nh1 {\n  margin: 0 0 10px 0;\n  font-size: 1.5rem;\n}\nnav a {\n  color: #38bdf8;\n  margin-right: 15px;\n  text-decoration: none;\n  font-weight: bold;\n}`,
        starterCodeJs: `console.log("Semantic HTML Header Challenge Initialized.");`,
        instructions: JSON.stringify([
          'Include a valid `<header>` container element.',
          'Add an `<h1>` tag inside header with title text.',
          'Add a `<nav>` tag containing at least three `<a>` hyperlink elements.'
        ]),
        expectedOutputRegex: '<header>.*<h1>.*</h1>.*<nav>.*<a.*>.*</a>.*<a.*>.*</a>.*<a.*>.*</a>.*</nav>.*</header>',
        points: 50
      },
      {
        trackId: 'css_layouts',
        title: 'Responsive Flexbox Card Container',
        difficulty: 'Intermediate',
        description: 'Create a responsive card container styled with CSS Flexbox (`display: flex; gap: 1rem; flex-wrap: wrap;`) containing 2 styled feature cards.',
        starterCodeHtml: `<div class="card-container">\n  <div class="card">\n    <h3>HTML5 Mastery</h3>\n    <p>Semantic markup structure.</p>\n  </div>\n  <div class="card">\n    <h3>CSS3 Layouts</h3>\n    <p>Flexbox & Grid responsive magic.</p>\n  </div>\n</div>`,
        starterCodeCss: `.card-container {\n  /* Apply flexbox layout rules here */\n  display: flex;\n  gap: 1rem;\n  flex-wrap: wrap;\n}\n.card {\n  background: #0f172a;\n  color: #f8fafc;\n  padding: 1.25rem;\n  border: 1px solid #334155;\n  border-radius: 10px;\n  flex: 1 1 200px;\n}\n.card h3 {\n  color: #38bdf8;\n  margin-top: 0;\n}`,
        starterCodeJs: `console.log("Flexbox layout loaded.");`,
        instructions: JSON.stringify([
          'Ensure `.card-container` uses `display: flex;`.',
          'Include `gap: 1rem;` or similar spacing.',
          'Verify cards fill available space responsively.'
        ]),
        expectedOutputRegex: 'display:\\s*flex',
        points: 75
      },
      {
        trackId: 'javascript_dom',
        title: 'Interactive Dynamic Counter Button',
        difficulty: 'Intermediate',
        description: 'Write JavaScript logic to increment a dynamic counter on button click and update the text content of `#counter-val`.',
        starterCodeHtml: `<div class="counter-box">\n  <h2>Counter: <span id="counter-val">0</span></h2>\n  <button id="increment-btn">Increment Count +1</button>\n</div>`,
        starterCodeCss: `.counter-box {\n  text-align: center;\n  padding: 2rem;\n  background: #1e1b4b;\n  color: #e0e7ff;\n  border-radius: 12px;\n}\nbutton {\n  background: #6366f1;\n  color: white;\n  border: none;\n  padding: 10px 20px;\n  font-size: 1rem;\n  border-radius: 6px;\n  cursor: pointer;\n}\nbutton:hover {\n  background: #4f46e5;\n}`,
        starterCodeJs: `let count = 0;\nconst countSpan = document.getElementById('counter-val');\nconst btn = document.getElementById('increment-btn');\n\nbtn.addEventListener('click', () => {\n  count++;\n  countSpan.textContent = count;\n});`,
        instructions: JSON.stringify([
          'Attach a click listener to `#increment-btn`.',
          'Increment variable `count` on every click.',
          'Update `textContent` of element `#counter-val`.'
        ]),
        expectedOutputRegex: 'addEventListener',
        points: 100
      }
    ];

    for (const c of challengesData) {
      await dbRun(
        'INSERT INTO challenges (trackId, title, difficulty, description, starterCodeHtml, starterCodeCss, starterCodeJs, instructions, expectedOutputRegex, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [c.trackId, c.title, c.difficulty, c.description, c.starterCodeHtml, c.starterCodeCss, c.starterCodeJs, c.instructions, c.expectedOutputRegex, c.points]
      );
    }

    // Seed Quizzes
    const quizzesData = [
      {
        trackId: 'html_basics',
        title: 'HTML5 & Semantic Markup Assessment',
        description: 'Test your understanding of core HTML syntax, accessibility tags, and semantic structure.',
        timeLimitMinutes: 10,
        questions: JSON.stringify([
          {
            id: 1,
            question: 'Which element represents an independent, self-contained article or content unit?',
            options: ['<section>', '<article>', '<div>', '<aside>'],
            correctAnswerIndex: 1,
            explanation: '<article> is used for self-contained content that makes sense on its own (e.g. blog post, news story).'
          },
          {
            id: 2,
            question: 'What is the correct attribute for specifying alternative image text for screen readers?',
            options: ['title', 'src', 'alt', 'description'],
            correctAnswerIndex: 2,
            explanation: 'The `alt` attribute provides accessible text alternative for images when loading fails or for screen readers.'
          },
          {
            id: 3,
            question: 'Which tag is used for the highest level heading on a webpage?',
            options: ['<h6>', '<head>', '<heading>', '<h1>'],
            correctAnswerIndex: 3,
            explanation: '`<h1>` represents the top-level main heading of a document.'
          }
        ])
      },
      {
        trackId: 'css_layouts',
        title: 'CSS Flexbox & Box Model Mastery',
        description: 'Evaluate your knowledge of CSS box model properties, specificity, flex container properties, and alignment.',
        timeLimitMinutes: 12,
        questions: JSON.stringify([
          {
            id: 1,
            question: 'Which CSS property defines the primary axis distribution in a Flexbox container?',
            options: ['align-items', 'justify-content', 'flex-direction', 'place-content'],
            correctAnswerIndex: 1,
            explanation: '`justify-content` aligns items along the main axis of a flex container.'
          },
          {
            id: 2,
            question: 'What constitutes the total width of an element in standard CSS box-sizing?',
            options: [
              'content width only',
              'content + padding + border + margin',
              'content + padding + border',
              'border + margin'
            ],
            correctAnswerIndex: 2,
            explanation: 'In default `content-box`, total width is content width + left/right padding + left/right border.'
          }
        ])
      },
      {
        trackId: 'javascript_dom',
        title: 'JavaScript DOM & Modern ES6 Syntax',
        description: 'Assess modern JS language concepts including closures, event listeners, promises, and DOM updates.',
        timeLimitMinutes: 15,
        questions: JSON.stringify([
          {
            id: 1,
            question: 'Which method adds a listener callback function without overwriting existing handlers?',
            options: ['element.onclick = fn', 'element.attach()', 'element.addEventListener()', 'element.on()'],
            correctAnswerIndex: 2,
            explanation: '`addEventListener()` allows multiple event handlers on the same target element.'
          },
          {
            id: 2,
            question: 'What keyword creates a block-scoped variable that cannot be re-declared in the same scope?',
            options: ['var', 'let', 'global', 'define'],
            correctAnswerIndex: 1,
            explanation: '`let` (and `const`) provide block scoping introduced in ES6.'
          }
        ])
      }
    ];

    for (const q of quizzesData) {
      await dbRun(
        'INSERT INTO quizzes (trackId, title, description, timeLimitMinutes, questions) VALUES (?, ?, ?, ?, ?)',
        [q.trackId, q.title, q.description, q.timeLimitMinutes, q.questions]
      );
    }

    // Seed Overdue Study Tasks
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    const dueDateStr = yesterday.toISOString().split('T')[0];

    await dbRun(
      'INSERT INTO overdue_tasks (id, userId, title, type, targetId, dueDate, trackTitle, isCompleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['task_1', student1Res.lastID, 'Overdue Challenge: HTML Semantic Header', 'challenge', 1, dueDateStr, 'HTML5 Foundations', 0]
    );

    await dbRun(
      'INSERT INTO overdue_tasks (id, userId, title, type, targetId, dueDate, trackTitle, isCompleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['task_2', student1Res.lastID, 'Overdue Quiz: CSS Box Model & Flexbox', 'quiz', 2, dueDateStr, 'CSS3 Layouts', 0]
    );

    addAuditLog('INITIALIZE_DATABASE', 'SYSTEM', 'SUCCESS');
    persistEncryptedDatabase();
  }
}

// Auto-persist encrypted DB file on process shutdown
process.on('SIGINT', () => {
  persistEncryptedDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  persistEncryptedDatabase();
  process.exit(0);
});
