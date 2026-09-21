export type Role = 'admin' | 'student';

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: Role;
  streakDays: number;
  lastActiveDate: string;
  createdAt: string;
}

export interface Challenge {
  id: number;
  trackId: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  starterCodeHtml: string;
  starterCodeCss: string;
  starterCodeJs: string;
  instructions: string[];
  expectedOutputRegex?: string;
  points: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: number;
  trackId: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  category: 'streak' | 'milestone' | 'quiz' | 'mastery';
}

export interface UserProgress {
  userId: number;
  completedChallengeIds: number[];
  completedQuizScores: Record<number, number>; // quizId -> score percentage
  earnedBadgeIds: string[];
  points: number;
  weeklyActivity: number[]; // 7 days activity counts
}

export interface OverdueTask {
  id: string;
  title: string;
  type: 'challenge' | 'quiz';
  targetId: number;
  dueDate: string;
  trackTitle: string;
}

export interface SystemStats {
  dbEncrypted: boolean;
  dbAlgorithm: string;
  dbFileSizeKb: number;
  keyFingerprint: string;
  activeUsersCount: number;
  totalSubmissions: number;
  uptimeSeconds: number;
  memoryUsageMb: number;
  auditLogs: {
    timestamp: string;
    action: string;
    user: string;
    status: string;
  }[];
}

export interface Lesson {
  id: number;
  courseId: number;
  orderNum: number;
  title: string;
  summary: string;
  contentMarkdown: string;
  codeExampleHtml?: string;
  codeExampleCss?: string;
  codeExampleJs?: string;
  codeExamplePhp?: string;
  codeExampleSql?: string;
  keyTakeaways?: string[];
  sandboxBridgeChallengeId?: number;
  isCompleted?: boolean;
  isLocked?: boolean;
}

export interface Course {
  id: number;
  trackId: 'html' | 'css' | 'javascript' | 'php' | 'sql' | 'backend' | 'fullstack' | string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  description: string;
  iconName: string;
  estimatedHours: number;
  prerequisiteCourseId?: number | null;
  prerequisiteCourseTitle?: string | null;
  isLocked?: boolean;
  lessons?: Lesson[];
  lessonCount?: number;
  isCourseCompleted?: boolean;
  progressPercent?: number;
  completedLessonIds?: number[];
}

export interface UserCourseProgress {
  userId: number;
  courseId: number;
  completedLessonIds: number[];
  isCourseCompleted: boolean;
}
