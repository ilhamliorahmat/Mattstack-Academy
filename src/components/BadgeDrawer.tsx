import React from 'react';
import { Award, ShieldCheck, Flame, Star, Zap, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { Badge } from '../types';

interface BadgeDrawerProps {
  earnedBadgeIds: string[];
}

export const BadgeDrawer: React.FC<BadgeDrawerProps> = ({ earnedBadgeIds }) => {
  const allBadges: Badge[] = [
    {
      id: 'b_welcome',
      title: 'Academy Initiate',
      description: 'Logged into SYS-WEBDEV-ACADEMY encrypted platform.',
      iconName: 'ShieldCheck',
      category: 'milestone',
      isUnlocked: true
    },
    {
      id: 'b_first_step',
      title: 'First Step Challenger',
      description: 'Successfully completed your first interactive Web Dev challenge.',
      iconName: 'Zap',
      category: 'milestone',
      isUnlocked: earnedBadgeIds.includes('b_first_step')
    },
    {
      id: 'b_streak3',
      title: '3-Day Active Streak',
      description: 'Logged in and solved coding tasks 3 consecutive days.',
      iconName: 'Flame',
      category: 'streak',
      isUnlocked: earnedBadgeIds.includes('b_streak3')
    },
    {
      id: 'b_css_arch',
      title: 'CSS Layout Architect',
      description: 'Mastered Flexbox and Grid responsive CSS layouts.',
      iconName: 'Star',
      category: 'mastery',
      isUnlocked: earnedBadgeIds.includes('b_css_arch')
    },
    {
      id: 'b_js_maestro',
      title: 'JS Perfect Score Maestro',
      description: 'Scored 100% on JavaScript DOM assessment quiz.',
      iconName: 'Award',
      category: 'quiz',
      isUnlocked: earnedBadgeIds.includes('b_js_maestro')
    },
    {
      id: 'b_quiz_whiz',
      title: 'Quiz Whiz Explorer',
      description: 'Completed 2 or more web development assessment quizzes.',
      iconName: 'Sparkles',
      category: 'quiz',
      isUnlocked: earnedBadgeIds.includes('b_quiz_whiz')
    },
    {
      id: 'b_overdue_hero',
      title: 'Overdue Task Hero',
      description: 'Cleared an overdue study task from your dashboard reminders.',
      iconName: 'CheckCircle2',
      category: 'milestone',
      isUnlocked: earnedBadgeIds.includes('b_overdue_hero')
    },
    {
      id: 'b_master_webdev',
      title: 'Master Web Developer',
      description: 'Completed all core Web Development challenges and curriculum tracks.',
      iconName: 'Award',
      category: 'mastery',
      isUnlocked: earnedBadgeIds.includes('b_master_webdev')
    }
  ];

  const unlockedCount = allBadges.filter((b) => b.isUnlocked).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Gamification System
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Achievements & Badges</h1>
          <p className="text-xs text-slate-300">
            Earn badges for streaks, milestone achievements, perfect quiz scores, and consistent engagement.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/80 px-4 py-3 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-right">
            <span className="text-2xl font-black text-amber-400">
              {unlockedCount} / {allBadges.length}
            </span>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Badges Unlocked</p>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {allBadges.map((badge) => (
          <div
            key={badge.id}
            className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
              badge.isUnlocked
                ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/80 shadow-md'
                : 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/50 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className={`p-3 rounded-2xl ${
                    badge.isUnlocked
                      ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {badge.isUnlocked ? <Award className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    badge.isUnlocked
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {badge.isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {badge.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span className="capitalize">Category: {badge.category}</span>
              {badge.isUnlocked && (
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Earned
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
