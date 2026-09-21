import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { LearnerDashboard } from './components/LearnerDashboard';
import { CodingSandbox } from './components/CodingSandbox';
import { QuizEngine } from './components/QuizEngine';
import { BadgeDrawer } from './components/BadgeDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { CourseCatalog } from './components/CourseCatalog';
import { CourseReader } from './components/CourseReader';
import { User, Challenge, Quiz } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loadingAuth, setLoadingAuth] = useState(true);

  // App Tabs
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | undefined>(undefined);
  const [selectedQuizId, setSelectedQuizId] = useState<number | undefined>(undefined);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  // Dark Mode Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || true;
  });

  // App Data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Sandbox bridge custom starter code
  const [sandboxCustomCode, setSandboxCustomCode] = useState<{ html?: string; css?: string; js?: string } | null>(null);

  // Dark Mode Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Auth Session Verification
  const verifySession = async (authToken: string) => {
    setLoadingAuth(true);
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Session verify error:', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    if (token) {
      verifySession(token);
    } else {
      setLoadingAuth(false);
    }
  }, [token]);

  // Fetch Dashboard & Curriculum Data when User is Logged In
  const fetchAppData = async () => {
    if (!token) return;
    try {
      const fetchWithAuth = async (url: string) => {
        try {
          const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (res.status === 401) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            return null;
          }
          if (!res.ok) return null;
          return await res.json();
        } catch (err) {
          console.warn(`[API Warning] Fetch failed for ${url}:`, err);
          return null;
        }
      };

      const [dashJson, chalJson, quizJson] = await Promise.all([
        fetchWithAuth('/api/dashboard'),
        fetchWithAuth('/api/challenges'),
        fetchWithAuth('/api/quizzes')
      ]);

      if (dashJson) {
        setDashboardData(dashJson);
        if (dashJson.user) {
          setUser((prev) => (prev ? { ...prev, streakDays: dashJson.user.streakDays } : prev));
        }
      }
      if (chalJson) {
        setChallenges(chalJson.challenges || []);
      }
      if (quizJson) {
        setQuizzes(quizJson.quizzes || []);
      }
    } catch (err) {
      console.error('Failed to fetch app data gracefully:', err);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchAppData();
    }
  }, [user, token]);

  const handleLoginSuccess = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const handleNavigateToTab = (tab: string, filterId?: number) => {
    setActiveTab(tab);
    if (tab === 'challenges') {
      setSelectedChallengeId(filterId);
    } else if (tab === 'quizzes') {
      setSelectedQuizId(filterId);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Decrypting SQLite Database Vault...</p>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <LearnerDashboard
            user={user}
            dashboardData={dashboardData}
            onNavigateToTab={handleNavigateToTab}
            onRefreshDashboard={fetchAppData}
          />
        )}

        {activeTab === 'courses' && (
          selectedCourseId !== null ? (
            <CourseReader
              courseId={selectedCourseId}
              token={token}
              onBack={() => setSelectedCourseId(null)}
              onLaunchSandbox={(codeSnippet) => {
                setSandboxCustomCode(codeSnippet);
                setActiveTab('challenges');
              }}
            />
          ) : (
            <CourseCatalog
              token={token}
              onSelectCourse={(id) => setSelectedCourseId(id)}
            />
          )
        )}

        {activeTab === 'challenges' && (
          <CodingSandbox
            challenges={challenges}
            selectedChallengeId={selectedChallengeId}
            onChallengeCompleted={fetchAppData}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'quizzes' && (
          <QuizEngine
            quizzes={quizzes}
            selectedQuizId={selectedQuizId}
            onQuizCompleted={fetchAppData}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'badges' && (
          <BadgeDrawer
            earnedBadgeIds={dashboardData?.progress?.earnedBadgeIds || ['b_welcome']}
          />
        )}

        {activeTab === 'admin' && user.role === 'admin' && (
          <AdminDashboard isDarkMode={isDarkMode} />
        )}
      </main>
    </div>
  );
}
