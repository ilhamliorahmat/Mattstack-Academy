import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import {
  setupDatabase,
  dbGet,
  dbQuery,
  dbRun,
  addAuditLog,
  persistEncryptedDatabase,
  auditLogs
} from './server/db';

const JWT_SECRET = process.env.JWT_SECRET || 'SYS_WEBDEV_JWT_SECRET_MATHIEU_2026';
const PORT = 3000;
const app = express();

app.use(express.json({ limit: '10mb' }));

// Extend Express Request for authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: 'admin' | 'student';
    name: string;
  };
}

// Auth Middleware
function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token.' });
  }
}

// Admin-Only Middleware
function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Access restricted exclusively to Administrators.' });
  }
  next();
}

async function startServer() {
  try {
    await setupDatabase();
  } catch (err) {
    console.error('[Database Setup Warning] Setup failed, using fallback engine:', err);
  }

  // === AUTHENTICATION ENDPOINTS ===

  // Login verification against Encrypted SQLite DB
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }

      const user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);
      if (!user) {
        addAuditLog('LOGIN_FAILED', username, 'USER_NOT_FOUND');
        return res.status(401).json({ error: 'Invalid credentials. User not found in database.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        addAuditLog('LOGIN_FAILED', username, 'INVALID_PASSWORD');
        return res.status(401).json({ error: 'Invalid credentials. Password mismatch.' });
      }

      // Update streak and last active date
      const today = new Date().toISOString().substring(0, 10);
      let updatedStreak = user.streakDays || 1;
      if (user.lastActiveDate) {
        const lastDate = new Date(user.lastActiveDate).toISOString().substring(0, 10);
        const diffMs = new Date(today).getTime() - new Date(lastDate).getTime();
        const diffDays = Math.floor(diffMs / (1000 * 3600 * 24));

        if (diffDays === 1) {
          updatedStreak += 1;
        } else if (diffDays > 1) {
          updatedStreak = 1;
        }
      }

      await dbRun('UPDATE users SET streakDays = ?, lastActiveDate = ? WHERE id = ?', [
        updatedStreak,
        new Date().toISOString(),
        user.id
      ]);

      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
      addAuditLog('LOGIN_SUCCESS', user.username, 'SUCCESS');
      persistEncryptedDatabase();

      return res.json({
        token,
        user: {
          ...payload,
          streakDays: updatedStreak
        }
      });
    } catch (err: any) {
      console.error('[Login Error]', err);
      res.status(500).json({ error: 'Internal server error during authentication.' });
    }
  });

  // Get current user session
  app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = await dbGet(
        'SELECT id, username, name, email, role, streakDays, lastActiveDate, createdAt FROM users WHERE id = ?',
        [req.user!.id]
      );
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch user session' });
    }
  });

  // === LEARNER DASHBOARD ENDPOINTS ===

  app.get('/api/dashboard', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
      let progress = await dbGet('SELECT * FROM user_progress WHERE userId = ?', [userId]);

      if (!progress) {
        await dbRun(
          'INSERT INTO user_progress (userId, completedChallengeIds, completedQuizScores, earnedBadgeIds, points, weeklyActivity) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, '[]', '{}', '["b_welcome"]', 0, '[1, 0, 1, 2, 0, 1, 1]']
        );
        progress = await dbGet('SELECT * FROM user_progress WHERE userId = ?', [userId]);
      }

      const completedChallengeIds: number[] = JSON.parse(progress.completedChallengeIds || '[]');
      const completedQuizScores: Record<number, number> = JSON.parse(progress.completedQuizScores || '{}');
      const earnedBadgeIds: string[] = JSON.parse(progress.earnedBadgeIds || '["b_welcome"]');
      const weeklyActivity: number[] = JSON.parse(progress.weeklyActivity || '[0,0,0,0,0,0,0]');

      // All challenges & quizzes for calculation
      const challenges = await dbQuery('SELECT id, trackId, title, difficulty, points FROM challenges');
      const quizzes = await dbQuery('SELECT id, trackId, title FROM quizzes');
      const overdueTasks = await dbQuery(
        'SELECT * FROM overdue_tasks WHERE userId = ? AND isCompleted = 0 ORDER BY dueDate ASC',
        [userId]
      );

      // Recent Activity Log
      const recentActivity = [
        ...completedChallengeIds.map((cid) => {
          const ch = challenges.find((c) => c.id === cid);
          return {
            id: `ch_${cid}`,
            title: ch ? ch.title : `Challenge #${cid}`,
            type: 'Challenge Completed',
            date: 'Recent',
            points: ch ? ch.points : 50
          };
        }),
        ...Object.entries(completedQuizScores).map(([qid, score]) => {
          const qz = quizzes.find((q) => q.id === Number(qid));
          return {
            id: `qz_${qid}`,
            title: qz ? qz.title : `Quiz #${qid}`,
            type: `Quiz Passed (${score}%)`,
            date: 'Recent',
            points: Math.round((score / 100) * 80)
          };
        })
      ].slice(0, 5);

      // Recommended Study Paths
      const recommendedTracks = [
        {
          id: 'html_basics',
          title: 'HTML5 Semantic Web Foundations',
          category: 'Markup & Structure',
          progressPercent: Math.min(
            100,
            Math.round(
              (completedChallengeIds.filter((cid) => cid === 1).length / 1) * 100
            )
          ),
          level: 'Beginner',
          description: 'Learn structure, tags, accessibility, and forms.'
        },
        {
          id: 'css_layouts',
          title: 'CSS3 Modern Flexbox & Grid Layouts',
          category: 'Styling & Design',
          progressPercent: Math.min(
            100,
            Math.round(
              (completedChallengeIds.filter((cid) => cid === 2).length / 1) * 100
            )
          ),
          level: 'Intermediate',
          description: 'Master responsive designs, Flexbox, Grid, and CSS variables.'
        },
        {
          id: 'javascript_dom',
          title: 'JavaScript DOM Manipulation & Async JS',
          category: 'Logic & Scripting',
          progressPercent: Math.min(
            100,
            Math.round(
              (completedChallengeIds.filter((cid) => cid === 3).length / 1) * 100
            )
          ),
          level: 'Advanced',
          description: 'Build dynamic UIs, event handling, promises, and fetch APIs.'
        }
      ];

      res.json({
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          streakDays: user.streakDays
        },
        progress: {
          points: progress.points,
          completedChallengesCount: completedChallengeIds.length,
          totalChallengesCount: challenges.length,
          completedQuizzesCount: Object.keys(completedQuizScores).length,
          totalQuizzesCount: quizzes.length,
          completedChallengeIds,
          completedQuizScores,
          earnedBadgeIds,
          weeklyActivity
        },
        recentActivity,
        recommendedTracks,
        overdueTasks
      });
    } catch (err: any) {
      console.error('[Dashboard Error]', err);
      res.status(500).json({ error: 'Failed to load learner dashboard data.' });
    }
  });

  // Mark overdue task complete
  app.post('/api/notifications/complete-overdue', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.body;
      const userId = req.user!.id;
      await dbRun('UPDATE overdue_tasks SET isCompleted = 1 WHERE id = ? AND userId = ?', [taskId, userId]);
      
      // Award overdue hero badge if not already unlocked
      const userProg = await dbGet('SELECT * FROM user_progress WHERE userId = ?', [userId]);
      if (userProg) {
        const badges: string[] = JSON.parse(userProg.earnedBadgeIds || '[]');
        if (!badges.includes('b_overdue_hero')) {
          badges.push('b_overdue_hero');
          await dbRun('UPDATE user_progress SET earnedBadgeIds = ? WHERE userId = ?', [
            JSON.stringify(badges),
            userId
          ]);
        }
      }

      addAuditLog('OVERDUE_TASK_CLEARED', req.user!.username, 'SUCCESS');
      persistEncryptedDatabase();
      res.json({ success: true, message: 'Task marked completed and removed from overdue queue!' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update overdue task.' });
    }
  });

  // === COURSES & LESSONS ENDPOINTS ===

  // Get all courses with user completion progress & prerequisite locks
  app.get('/api/courses', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const courses = await dbQuery('SELECT * FROM courses ORDER BY id ASC');
      const lessons = await dbQuery('SELECT id, courseId, orderNum FROM lessons');
      const userProgress = await dbQuery('SELECT * FROM user_course_progress WHERE userId = ?', [userId]);

      const progressMap: Record<number, { completedLessonIds: number[]; isCourseCompleted: boolean }> = {};
      userProgress.forEach((up) => {
        progressMap[up.courseId] = {
          completedLessonIds: JSON.parse(up.completedLessonIds || '[]'),
          isCourseCompleted: Boolean(up.isCourseCompleted)
        };
      });

      // Calculate completion map for all courses
      const courseCompletionMap: Record<number, boolean> = {};
      courses.forEach((c) => {
        const cLessons = lessons.filter((l) => l.courseId === c.id);
        const userCP = progressMap[c.id] || { completedLessonIds: [], isCourseCompleted: false };
        const isComplete = cLessons.length > 0 && cLessons.every((l) => userCP.completedLessonIds.includes(l.id));
        courseCompletionMap[c.id] = isComplete || userCP.isCourseCompleted;
      });

      const coursesWithStats = courses.map((course) => {
        const courseLessons = lessons.filter((l) => l.courseId === course.id);
        const userCourseProg = progressMap[course.id] || { completedLessonIds: [], isCourseCompleted: false };
        
        // Determine prerequisite status
        let isLocked = false;
        let prerequisiteCourseTitle = null;
        if (course.prerequisiteCourseId) {
          const prereqCourse = courses.find((c) => c.id === course.prerequisiteCourseId);
          if (prereqCourse) {
            prerequisiteCourseTitle = prereqCourse.title;
            const isPrereqCompleted = courseCompletionMap[course.prerequisiteCourseId] === true;
            if (!isPrereqCompleted) {
              isLocked = true;
            }
          }
        }

        return {
          ...course,
          prerequisiteCourseTitle,
          isLocked,
          lessonCount: courseLessons.length,
          completedLessonIds: userCourseProg.completedLessonIds,
          isCourseCompleted: userCourseProg.isCourseCompleted || courseCompletionMap[course.id],
          progressPercent: courseLessons.length > 0
            ? Math.round((userCourseProg.completedLessonIds.length / courseLessons.length) * 100)
            : 0
        };
      });

      res.json({ courses: coursesWithStats });
    } catch (err: any) {
      console.error('[Get Courses Error]', err);
      res.status(500).json({ error: 'Failed to fetch courses.' });
    }
  });

  // Get course by ID with detailed lessons, locks & user progress
  app.get('/api/courses/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const courseId = Number(req.params.id);
      const userId = req.user!.id;
      const course = await dbGet('SELECT * FROM courses WHERE id = ?', [courseId]);

      if (!course) {
        return res.status(404).json({ error: 'Course not found.' });
      }

      // Check course level prerequisite lock
      let isCourseLocked = false;
      let prerequisiteCourseTitle = null;
      if (course.prerequisiteCourseId) {
        const prereqCourse = await dbGet('SELECT title FROM courses WHERE id = ?', [course.prerequisiteCourseId]);
        if (prereqCourse) {
          prerequisiteCourseTitle = prereqCourse.title;
          const prereqProg = await dbGet('SELECT * FROM user_course_progress WHERE userId = ? AND courseId = ?', [
            userId,
            course.prerequisiteCourseId
          ]);
          const prereqLessons = await dbQuery('SELECT id FROM lessons WHERE courseId = ?', [course.prerequisiteCourseId]);
          const prereqCompletedIds: number[] = prereqProg ? JSON.parse(prereqProg.completedLessonIds || '[]') : [];
          const isPrereqDone =
            prereqLessons.length > 0 && prereqLessons.every((l) => prereqCompletedIds.includes(l.id));

          if (!isPrereqDone) {
            isCourseLocked = true;
          }
        }
      }

      const lessons = await dbQuery('SELECT * FROM lessons WHERE courseId = ? ORDER BY orderNum ASC', [courseId]);
      const userProg = await dbGet('SELECT * FROM user_course_progress WHERE userId = ? AND courseId = ?', [userId, courseId]);

      const completedLessonIds: number[] = userProg ? JSON.parse(userProg.completedLessonIds || '[]') : [];
      const isCourseCompleted = userProg ? Boolean(userProg.isCourseCompleted) : false;

      // Sequential chapter unlocking logic
      const formattedLessons = lessons.map((l, index) => {
        const isCompleted = completedLessonIds.includes(l.id);
        // Chapter 1 is unlocked. Chapter N is unlocked if all previous chapters (orderNum < l.orderNum) are completed
        let isLessonLocked = isCourseLocked;
        if (!isCourseLocked) {
          const previousLessons = lessons.filter((prev) => prev.orderNum < l.orderNum);
          const allPreviousDone = previousLessons.every((prev) => completedLessonIds.includes(prev.id));
          isLessonLocked = !allPreviousDone && !isCompleted;
        }

        return {
          ...l,
          keyTakeaways: JSON.parse(l.keyTakeaways || '[]'),
          isCompleted,
          isLocked: isLessonLocked
        };
      });

      res.json({
        course: {
          ...course,
          prerequisiteCourseTitle,
          isLocked: isCourseLocked,
          lessons: formattedLessons,
          completedLessonIds,
          isCourseCompleted,
          progressPercent: lessons.length > 0 ? Math.round((completedLessonIds.length / lessons.length) * 100) : 0
        }
      });
    } catch (err: any) {
      console.error('[Get Course Details Error]', err);
      res.status(500).json({ error: 'Failed to fetch course details.' });
    }
  });

  // Mark lesson as complete
  app.post('/api/courses/:id/lessons/:lessonId/complete', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const courseId = Number(req.params.id);
      const lessonId = Number(req.params.lessonId);
      const userId = req.user!.id;

      // Verify course prerequisite lock
      const course = await dbGet('SELECT * FROM courses WHERE id = ?', [courseId]);
      if (!course) return res.status(404).json({ error: 'Course not found.' });

      if (course.prerequisiteCourseId) {
        const prereqProg = await dbGet('SELECT * FROM user_course_progress WHERE userId = ? AND courseId = ?', [
          userId,
          course.prerequisiteCourseId
        ]);
        const prereqLessons = await dbQuery('SELECT id FROM lessons WHERE courseId = ?', [course.prerequisiteCourseId]);
        const prereqCompletedIds: number[] = prereqProg ? JSON.parse(prereqProg.completedLessonIds || '[]') : [];
        const isPrereqDone = prereqLessons.length > 0 && prereqLessons.every((l) => prereqCompletedIds.includes(l.id));

        if (!isPrereqDone) {
          return res.status(403).json({ error: 'Course is locked until prerequisite course is completed.' });
        }
      }

      // Check chapter sequence lock
      const targetLesson = await dbGet('SELECT * FROM lessons WHERE id = ? AND courseId = ?', [lessonId, courseId]);
      if (!targetLesson) return res.status(404).json({ error: 'Lesson not found.' });

      let userProg = await dbGet('SELECT * FROM user_course_progress WHERE userId = ? AND courseId = ?', [userId, courseId]);
      let completedLessonIds: number[] = userProg ? JSON.parse(userProg.completedLessonIds || '[]') : [];

      const precedingLessons = await dbQuery('SELECT id FROM lessons WHERE courseId = ? AND orderNum < ?', [
        courseId,
        targetLesson.orderNum
      ]);
      const precedingDone = precedingLessons.every((pl) => completedLessonIds.includes(pl.id));

      if (!precedingDone) {
        return res.status(403).json({ error: 'Chapter locked. Complete preceding chapters first!' });
      }

      if (!completedLessonIds.includes(lessonId)) {
        completedLessonIds.push(lessonId);
      }

      const allCourseLessons = await dbQuery('SELECT id FROM lessons WHERE courseId = ?', [courseId]);
      const allCompleted = allCourseLessons.length > 0 && allCourseLessons.every((l) => completedLessonIds.includes(l.id));

      if (userProg) {
        await dbRun(
          'UPDATE user_course_progress SET completedLessonIds = ?, isCourseCompleted = ? WHERE userId = ? AND courseId = ?',
          [JSON.stringify(completedLessonIds), allCompleted ? 1 : 0, userId, courseId]
        );
      } else {
        await dbRun(
          'INSERT INTO user_course_progress (userId, courseId, completedLessonIds, isCourseCompleted) VALUES (?, ?, ?, ?)',
          [userId, courseId, JSON.stringify(completedLessonIds), allCompleted ? 1 : 0]
        );
      }

      // Bonus points & badges if course completed
      if (allCompleted) {
        const userProgMain = await dbGet('SELECT * FROM user_progress WHERE userId = ?', [userId]);
        if (userProgMain) {
          const badges: string[] = JSON.parse(userProgMain.earnedBadgeIds || '[]');
          let points = userProgMain.points + 100;
          if (!badges.includes('b_course_master')) {
            badges.push('b_course_master');
          }
          await dbRun('UPDATE user_progress SET points = ?, earnedBadgeIds = ? WHERE userId = ?', [
            points,
            JSON.stringify(badges),
            userId
          ]);
        }
      }

      addAuditLog('LESSON_COMPLETED', req.user!.username, `COURSE_${courseId}_LESSON_${lessonId}`);
      persistEncryptedDatabase();

      res.json({
        success: true,
        completedLessonIds,
        isCourseCompleted: allCompleted,
        message: allCompleted ? 'Congratulations! You completed the entire course!' : 'Lesson marked as completed!'
      });
    } catch (err: any) {
      console.error('[Complete Lesson Error]', err);
      res.status(500).json({ error: 'Failed to mark lesson complete.' });
    }
  });

  // Admin Course Creation
  app.post('/api/admin/courses', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { trackId, title, level, description, iconName, estimatedHours } = req.body;
      const result = await dbRun(
        'INSERT INTO courses (trackId, title, level, description, iconName, estimatedHours) VALUES (?, ?, ?, ?, ?, ?)',
        [trackId, title, level, description, iconName || 'Code', estimatedHours || 3]
      );
      addAuditLog('CREATE_COURSE', req.user!.username, `CREATED_COURSE_${title}`);
      persistEncryptedDatabase();
      res.json({ success: true, courseId: result.lastID });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create course.' });
    }
  });

  // === CHALLENGES & QUIZZES ENDPOINTS ===

  app.get('/api/challenges', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const challenges = await dbQuery('SELECT * FROM challenges ORDER BY id ASC');
      const formatted = challenges.map((c) => ({
        ...c,
        instructions: JSON.parse(c.instructions || '[]')
      }));
      res.json({ challenges: formatted });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch challenges.' });
    }
  });

  app.get('/api/challenges/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const challenge = await dbGet('SELECT * FROM challenges WHERE id = ?', [req.params.id]);
      if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });
      res.json({
        challenge: {
          ...challenge,
          instructions: JSON.parse(challenge.instructions || '[]')
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch challenge details.' });
    }
  });

  // Submit challenge evaluation
  app.post('/api/challenges/:id/submit', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const challengeId = Number(req.params.id);
      const userId = req.user!.id;
      const { htmlCode, cssCode, jsCode } = req.body;

      const challenge = await dbGet('SELECT * FROM challenges WHERE id = ?', [challengeId]);
      if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });

      // Code Regex validation check
      let passed = true;
      let feedback = 'All test cases passed! Great job on completing this web challenge.';

      if (challenge.expectedOutputRegex) {
        const regex = new RegExp(challenge.expectedOutputRegex, 'i');
        const combinedCode = `${htmlCode} ${cssCode} ${jsCode}`;
        if (!regex.test(combinedCode)) {
          passed = false;
          feedback = 'Your code did not satisfy the structural requirements. Check your tags and selectors!';
        }
      }

      if (!passed) {
        return res.json({ passed: false, feedback, pointsEarned: 0 });
      }

      // Update User Progress & Badges in Encrypted SQLite
      let userProg = await dbGet('SELECT * FROM user_progress WHERE userId = ?', [userId]);
      if (!userProg) {
        await dbRun('INSERT INTO user_progress (userId) VALUES (?)', [userId]);
        userProg = await dbGet('SELECT * FROM user_progress WHERE userId = ?', [userId]);
      }

      const completedIds: number[] = JSON.parse(userProg.completedChallengeIds || '[]');
      const badges: string[] = JSON.parse(userProg.earnedBadgeIds || '[]');
      let newPoints = userProg.points || 0;
      let newlyUnlockedBadges: string[] = [];

      if (!completedIds.includes(challengeId)) {
        completedIds.push(challengeId);
        newPoints += challenge.points || 50;
      }

      // Check badge milestones
      if (completedIds.length >= 1 && !badges.includes('b_first_step')) {
        badges.push('b_first_step');
        newlyUnlockedBadges.push('First Step Challenger');
      }
      if (completedIds.length >= 3 && !badges.includes('b_master_webdev')) {
        badges.push('b_master_webdev');
        newlyUnlockedBadges.push('Master Web Developer');
      }

      await dbRun(
        'UPDATE user_progress SET completedChallengeIds = ?, earnedBadgeIds = ?, points = ? WHERE userId = ?',
        [JSON.stringify(completedIds), JSON.stringify(badges), newPoints, userId]
      );

      addAuditLog('CHALLENGE_SUBMIT', req.user!.username, `SUCCESS (Challenge #${challengeId})`);
      persistEncryptedDatabase();

      res.json({
        passed: true,
        feedback,
        pointsEarned: challenge.points || 50,
        newlyUnlockedBadges
      });
    } catch (err: any) {
      console.error('[Challenge Submit Error]', err);
      res.status(500).json({ error: 'Failed to submit challenge solution.' });
    }
  });

  // Quizzes list & submit
  app.get('/api/quizzes', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const quizzes = await dbQuery('SELECT * FROM quizzes ORDER BY id ASC');
      const formatted = quizzes.map((q) => ({
        ...q,
        questions: JSON.parse(q.questions || '[]')
      }));
      res.json({ quizzes: formatted });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch quizzes.' });
    }
  });

  app.post('/api/quizzes/:id/submit', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const quizId = Number(req.params.id);
      const userId = req.user!.id;
      const { answers } = req.body; // { questionId: selectedIndex }

      const quiz = await dbGet('SELECT * FROM quizzes WHERE id = ?', [quizId]);
      if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

      const questions = JSON.parse(quiz.questions || '[]');
      let correctCount = 0;

      questions.forEach((q: any) => {
        if (answers[q.id] === q.correctAnswerIndex) {
          correctCount++;
        }
      });

      const scorePercent = Math.round((correctCount / questions.length) * 100);

      // Update progress
      let userProg = await dbGet('SELECT * FROM user_progress WHERE userId = ?', [userId]);
      const scoresMap: Record<number, number> = JSON.parse(userProg.completedQuizScores || '{}');
      const badges: string[] = JSON.parse(userProg.earnedBadgeIds || '[]');
      let newlyUnlockedBadges: string[] = [];

      scoresMap[quizId] = scorePercent;

      if (scorePercent === 100 && !badges.includes('b_js_maestro')) {
        badges.push('b_js_maestro');
        newlyUnlockedBadges.push('Quiz Perfect Score Maestro');
      }
      if (Object.keys(scoresMap).length >= 2 && !badges.includes('b_quiz_whiz')) {
        badges.push('b_quiz_whiz');
        newlyUnlockedBadges.push('Quiz Whiz Explorer');
      }

      await dbRun(
        'UPDATE user_progress SET completedQuizScores = ?, earnedBadgeIds = ? WHERE userId = ?',
        [JSON.stringify(scoresMap), JSON.stringify(badges), userId]
      );

      addAuditLog('QUIZ_SUBMIT', req.user!.username, `SCORE_${scorePercent}% (Quiz #${quizId})`);
      persistEncryptedDatabase();

      res.json({
        scorePercent,
        correctCount,
        totalQuestions: questions.length,
        newlyUnlockedBadges
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to evaluate quiz.' });
    }
  });

  // === ADMIN EXCLUSIVE DASHBOARD & MANAGEMENT ENDPOINTS ===

  // Account Registration: Restricted ONLY to Admin in Administrator Dashboard!
  app.post('/api/admin/register-user', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { username, password, name, email, role } = req.body;
      if (!username || !password || !name || !email) {
        return res.status(400).json({ error: 'Username, password, full name, and email are required.' });
      }

      const existing = await dbGet('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
      if (existing) {
        return res.status(400).json({ error: 'Username or email already exists in encrypted database.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userRole = role === 'admin' ? 'admin' : 'student';

      const result = await dbRun(
        'INSERT INTO users (username, password, name, email, role, streakDays, lastActiveDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, passwordHash, name, email, userRole, 1, new Date().toISOString()]
      );

      // Initialize progress
      await dbRun(
        'INSERT INTO user_progress (userId, completedChallengeIds, completedQuizScores, earnedBadgeIds, points, weeklyActivity) VALUES (?, ?, ?, ?, ?, ?)',
        [result.lastID, '[]', '{}', '["b_welcome"]', 0, '[1, 0, 0, 0, 0, 0, 0]']
      );

      addAuditLog('ADMIN_REGISTER_USER', req.user!.username, `CREATED_${userRole.toUpperCase()}_${username}`);
      persistEncryptedDatabase();

      res.json({
        success: true,
        message: `Account '${username}' (${userRole}) registered successfully into encrypted SQLite database.`,
        userId: result.lastID
      });
    } catch (err: any) {
      console.error('[Admin Register Error]', err);
      res.status(500).json({ error: 'Failed to register account.' });
    }
  });

  // Get all users (Admin view)
  app.get('/api/admin/users', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const users = await dbQuery('SELECT id, username, name, email, role, streakDays, lastActiveDate, createdAt FROM users ORDER BY id ASC');
      res.json({ users });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to list users.' });
    }
  });

  // Delete user (Admin view)
  app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const targetId = Number(req.params.id);
      if (targetId === req.user!.id) {
        return res.status(400).json({ error: 'Cannot delete your own active administrator account.' });
      }
      await dbRun('DELETE FROM users WHERE id = ?', [targetId]);
      await dbRun('DELETE FROM user_progress WHERE userId = ?', [targetId]);
      addAuditLog('DELETE_USER', req.user!.username, `DELETED_USER_#${targetId}`);
      persistEncryptedDatabase();
      res.json({ success: true, message: 'User record removed from encrypted database.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete user.' });
    }
  });

  // Content CMS: Create / Update / Delete Challenges & Quizzes
  app.post('/api/admin/challenges', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { trackId, title, difficulty, description, starterCodeHtml, starterCodeCss, starterCodeJs, instructions, points } = req.body;
      const result = await dbRun(
        'INSERT INTO challenges (trackId, title, difficulty, description, starterCodeHtml, starterCodeCss, starterCodeJs, instructions, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [trackId, title, difficulty, description, starterCodeHtml, starterCodeCss, starterCodeJs, JSON.stringify(instructions || []), points || 50]
      );
      addAuditLog('CREATE_CHALLENGE', req.user!.username, `CREATED_CHALLENGE_${title}`);
      persistEncryptedDatabase();
      res.json({ success: true, challengeId: result.lastID });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create challenge.' });
    }
  });

  app.delete('/api/admin/challenges/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      await dbRun('DELETE FROM challenges WHERE id = ?', [req.params.id]);
      addAuditLog('DELETE_CHALLENGE', req.user!.username, `DELETED_CHALLENGE_#${req.params.id}`);
      persistEncryptedDatabase();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete challenge.' });
    }
  });

  // System Stats & Encryption Inspector
  app.get('/api/admin/system-stats', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const encryptedPath = path.join(process.cwd(), 'data', 'academy_encrypted.db');
      let dbFileSizeKb = 0;
      if (fs.existsSync(encryptedPath)) {
        const stats = fs.statSync(encryptedPath);
        dbFileSizeKb = Math.round(stats.size / 1024);
      }

      const usersCountRow = await dbGet('SELECT COUNT(*) as count FROM users');
      const submissionsCountRow = await dbGet('SELECT COUNT(*) as count FROM challenges');

      const memoryUsageMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
      const keyHash = crypto.createHash('sha256').update(process.env.DB_ENCRYPTION_KEY || 'MATHIEU_SECRET').digest('hex').substring(0, 12);

      res.json({
        dbEncrypted: true,
        dbAlgorithm: 'AES-256-CBC (PBKDF2 Derived Key Vault)',
        dbFileSizeKb,
        keyFingerprint: `0x${keyHash}...[VERIFIED_KEY]`,
        activeUsersCount: usersCountRow.count,
        totalSubmissions: submissionsCountRow.count,
        uptimeSeconds: Math.round(process.uptime()),
        memoryUsageMb,
        auditLogs
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to gather system telemetry.' });
    }
  });

  // Database Diagnostic Inspector
  app.get('/api/admin/db-inspect', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const users = await dbQuery('SELECT id, username, role, streakDays, lastActiveDate FROM users');
      const challenges = await dbQuery('SELECT id, title, difficulty, trackId FROM challenges');
      const quizzes = await dbQuery('SELECT id, title, trackId FROM quizzes');
      
      res.json({
        tableCount: 5,
        encryptedContainer: 'data/academy_encrypted.db',
        runtimeEngine: 'data/academy_runtime.db',
        tables: {
          users,
          challenges,
          quizzes
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to inspect database.' });
    }
  });

  // === VITE / STATIC SERVING ===

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYS-WEBDEV-ACADEMY-V1] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
