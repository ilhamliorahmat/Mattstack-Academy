import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  FileText,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Award,
  Zap,
  Check,
  Calendar,
  XCircle
} from 'lucide-react';
import { generatePDFReport } from '../lib/pdf';
import { OverdueTask, User } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface LearnerDashboardProps {
  user: User;
  dashboardData: any;
  onNavigateToTab: (tab: string, filterId?: number) => void;
  onRefreshDashboard: () => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  user,
  dashboardData,
  onNavigateToTab,
  onRefreshDashboard
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [clearingTaskId, setClearingTaskId] = useState<string | null>(null);

  if (!dashboardData) {
    return (
      <div className="p-12 text-center text-slate-500 animate-pulse">
        Loading learner progress analytics...
      </div>
    );
  }

  const { progress, recentActivity, recommendedTracks, overdueTasks } = dashboardData;

  const handleClearOverdueTask = async (taskId: string) => {
    setClearingTaskId(taskId);
    try {
      const response = await fetch('/api/notifications/complete-overdue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ taskId })
      });
      if (response.ok) {
        onRefreshDashboard();
      }
    } catch (err) {
      console.error('Failed to clear overdue task:', err);
    } finally {
      setClearingTaskId(null);
    }
  };

  const handleExportPDF = async () => {
    setDownloadingPdf(true);
    await generatePDFReport('pdf-export-container', user.name || user.username);
    setDownloadingPdf(false);
  };

  // Chart Data Setup
  const barChartData = {
    labels: ['HTML Foundations', 'CSS Layouts', 'JS DOM & Async', 'Fullstack API'],
    datasets: [
      {
        label: 'Completion Score (%)',
        data: [
          progress.completedChallengeIds?.includes(1) ? 100 : 35,
          progress.completedChallengeIds?.includes(2) ? 100 : 20,
          progress.completedChallengeIds?.includes(3) ? 100 : 10,
          0
        ],
        backgroundColor: ['rgba(99, 102, 241, 0.85)', 'rgba(56, 189, 248, 0.85)', 'rgba(168, 85, 247, 0.85)', 'rgba(148, 163, 184, 0.5)'],
        borderRadius: 8
      }
    ]
  };

  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Submissions & Code Edits',
        data: progress.weeklyActivity || [1, 2, 0, 3, 4, 1, 5],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#38bdf8',
        pointRadius: 5
      }
    ]
  };

  const doughnutChartData = {
    labels: ['Completed', 'Remaining Quizzes'],
    datasets: [
      {
        data: [progress.completedQuizzesCount || 1, Math.max(0, (progress.totalQuizzesCount || 3) - (progress.completedQuizzesCount || 1))],
        backgroundColor: ['#10b981', '#334155'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="space-y-8" id="pdf-export-container">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Welcome Back, {user.name} 👋
            </span>
            <span className="text-xs text-slate-400 capitalize">Role: {user.role}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Web Development Learning Hub
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Track interactive coding milestones, tackle quizzes, and complete overdue study tasks.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-3 shrink-0">
          <button
            onClick={handleExportPDF}
            disabled={downloadingPdf}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>{downloadingPdf ? 'Generating PDF...' : 'Export PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Overdue Task Interactive Notifications Banner */}
      {overdueTasks && overdueTasks.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-amber-200 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
              <h3 className="font-bold text-sm text-amber-300">
                Action Required: {overdueTasks.length} Overdue Study Task(s) Detected
              </h3>
            </div>
            <span className="text-xs bg-amber-900/80 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-700">
              Interactive Reminders
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overdueTasks.map((task: OverdueTask) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-900/60 flex items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-white">{task.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">
                      Due: {task.dueDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Track: {task.trackTitle}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() =>
                      onNavigateToTab(
                        task.type === 'challenge' ? 'challenges' : 'quizzes',
                        task.targetId
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-all"
                  >
                    Solve Now
                  </button>
                  <button
                    onClick={() => handleClearOverdueTask(task.id)}
                    disabled={clearingTaskId === task.id}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                    title="Mark Task Completed"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Points
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {progress.points || 0} XP
            </h3>
            <p className="text-xs text-indigo-500 font-medium mt-1">Level 2 Apprentice</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Challenges Solved
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {progress.completedChallengesCount || 0} / {progress.totalChallengesCount || 3}
            </h3>
            <p className="text-xs text-emerald-500 font-medium mt-1">
              {Math.round(((progress.completedChallengesCount || 0) / (progress.totalChallengesCount || 3)) * 100)}% Completed
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quizzes Passed
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {progress.completedQuizzesCount || 0} / {progress.totalQuizzesCount || 3}
            </h3>
            <p className="text-xs text-sky-500 font-medium mt-1">Interactive Assessment</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Earned Badges
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {progress.earnedBadgeIds?.length || 1} Unlocked
            </h3>
            <p className="text-xs text-amber-500 font-medium mt-1">Streak & Milestones</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Progress Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Module Mastery Scores
            </h3>
            <span className="text-xs text-slate-400">Chart.js Analysis</span>
          </div>
          <div className="h-56 flex items-center justify-center">
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { min: 0, max: 100, ticks: { color: '#94a3b8' } },
                  x: { ticks: { color: '#94a3b8' } }
                }
              }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              Weekly Activity Rhythm
            </h3>
            <span className="text-xs text-slate-400">7-Day Submissions</span>
          </div>
          <div className="h-56 flex items-center justify-center">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { ticks: { color: '#94a3b8' } },
                  x: { ticks: { color: '#94a3b8' } }
                }
              }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Quiz Completion Ratio
            </h3>
            <span className="text-xs text-slate-400">Assessment Breakdown</span>
          </div>
          <div className="h-56 flex items-center justify-center relative">
            <Doughnut
              data={doughnutChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recommended Study Paths & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Study Paths */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Recommended Study Paths
              </h3>
            </div>
            <span className="text-xs text-slate-500">Tailored for {user.name}</span>
          </div>

          <div className="space-y-3">
            {recommendedTracks.map((track: any) => (
              <div
                key={track.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {track.category}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Level: {track.level}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {track.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{track.description}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {track.progressPercent}%
                    </div>
                    <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${track.progressPercent}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('challenges')}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow hover:shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Recent Activity
              </h3>
            </div>
            <span className="text-xs text-slate-400">History Log</span>
          </div>

          <div className="space-y-3">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((act: any) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{act.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{act.type}</p>
                  </div>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    +{act.points} XP
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">
                No recent submission history found. Start a challenge!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
