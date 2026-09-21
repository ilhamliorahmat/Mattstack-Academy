import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Database,
  Cpu,
  Lock,
  Plus,
  Trash2,
  Activity,
  FileCode,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal
} from 'lucide-react';
import { SystemStats } from '../types';

interface AdminDashboardProps {
  isDarkMode: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'content' | 'performance' | 'db_inspect'>('users');
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [dbInspector, setDbInspector] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New User Form State (Account Registration for Admin)
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'student' | 'admin'>('student');
  const [registering, setRegistering] = useState(false);

  // New Challenge CMS Form State
  const [chTrackId, setChTrackId] = useState('html_basics');
  const [chTitle, setChTitle] = useState('');
  const [chDifficulty, setChDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [chDesc, setChDesc] = useState('');
  const [chHtml, setChHtml] = useState('<div>\n  <!-- Code -->\n</div>');
  const [chCss, setChCss] = useState('div { color: red; }');
  const [chJs, setChJs] = useState('console.log("Ready");');
  const [chInstructions, setChInstructions] = useState('Include valid HTML markup.\nApply CSS styling.');
  const [creatingChallenge, setCreatingChallenge] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [statsRes, usersRes, inspectRes] = await Promise.all([
        fetch('/api/admin/system-stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/db-inspect', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setSystemStats(statsData);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData.users || []);
      }
      if (inspectRes.ok) {
        const inspectData = await inspectRes.json();
        setDbInspector(inspectData);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handle Account Registration (Admin Only Requirement!)
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);

    try {
      const response = await fetch('/api/admin/register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          name: newName,
          email: newEmail,
          role: newRole
        })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Account Registered!',
          text: data.message,
          confirmButtonColor: '#6366f1',
          background: isDarkMode ? '#0f172a' : '#ffffff',
          color: isDarkMode ? '#f8fafc' : '#0f172a'
        });
        setNewUsername('');
        setNewPassword('');
        setNewName('');
        setNewEmail('');
        fetchAdminData();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: data.error || 'Failed to create user account.',
          confirmButtonColor: '#e11d48'
        });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Server error during user registration.' });
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    const result = await Swal.fire({
      title: `Delete user '${username}'?`,
      text: 'This action will remove the account from the encrypted SQLite database.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete Record'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          Swal.fire('Deleted!', 'User record removed.', 'success');
          fetchAdminData();
        }
      } catch (err) {
        Swal.fire('Error', 'Failed to delete user.', 'error');
      }
    }
  };

  // CMS: Create Challenge
  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingChallenge(true);

    try {
      const instructionsArr = chInstructions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const response = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          trackId: chTrackId,
          title: chTitle,
          difficulty: chDifficulty,
          description: chDesc,
          starterCodeHtml: chHtml,
          starterCodeCss: chCss,
          starterCodeJs: chJs,
          instructions: instructionsArr,
          points: 50
        })
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Challenge Created!',
          text: 'New coding challenge saved to SQLite database CMS.',
          confirmButtonColor: '#6366f1'
        });
        setChTitle('');
        setChDesc('');
        fetchAdminData();
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save challenge.' });
    } finally {
      setCreatingChallenge(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border border-amber-800/80 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Administrator Control Dashboard
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Granular System & Content Control</h1>
          <p className="text-xs text-amber-200/80">
            Provision user accounts, edit challenges/quizzes, and monitor SQLite AES-256 database metrics.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-amber-950/80 px-3.5 py-2 rounded-2xl border border-amber-800 shrink-0">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-emerald-300">
            Encrypted DB: {systemStats?.dbFileSizeKb || 0} KB
          </span>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>User Provisioning & Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'content'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Curriculum Content CMS</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'performance'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>System Performance & Encryption</span>
        </button>

        <button
          onClick={() => setActiveTab('db_inspect')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'db_inspect'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Database Inspector Log</span>
        </button>
      </div>

      {/* TAB 1: USER PROVISIONING & REGISTRATION */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Admin-Only Account Registration Form */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <UserPlus className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Admin User Registration
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Account registration is available exclusively to Administrators. New credentials are saved to the encrypted SQLite database.
            </p>

            <form onSubmit={handleRegisterUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. jordan_dev"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="jordan@student.edu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="student">Student Learner</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md shadow-amber-600/30 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {registering ? 'Creating Account in Encrypted DB...' : 'Register New Account'}
              </button>
            </form>
          </div>

          {/* Users Directory List */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Registered User Accounts ({usersList.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {usersList.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded font-semibold ${
                          u.role === 'admin'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      @{u.username} • {u.email}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] text-slate-400">
                      Streak: {u.streakDays || 1}d
                    </span>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors"
                      title="Delete User Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT MANAGEMENT CMS */}
      {activeTab === 'content' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Create Web Development Challenge (CMS)
            </h3>
          </div>

          <form onSubmit={handleCreateChallenge} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Challenge Title
              </label>
              <input
                type="text"
                required
                value={chTitle}
                onChange={(e) => setChTitle(e.target.value)}
                placeholder="e.g. CSS Grid Photo Gallery"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Track Module
              </label>
              <select
                value={chTrackId}
                onChange={(e) => setChTrackId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="html_basics">HTML5 Foundations</option>
                <option value="css_layouts">CSS3 Modern Layouts</option>
                <option value="javascript_dom">JavaScript DOM & Async</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Challenge Description
              </label>
              <textarea
                required
                rows={2}
                value={chDesc}
                onChange={(e) => setChDesc(e.target.value)}
                placeholder="Describe what student should accomplish..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Starter HTML Code
              </label>
              <textarea
                rows={4}
                value={chHtml}
                onChange={(e) => setChHtml(e.target.value)}
                className="w-full px-3 py-2 rounded-xl font-mono border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Starter CSS Code
              </label>
              <textarea
                rows={4}
                value={chCss}
                onChange={(e) => setChCss(e.target.value)}
                className="w-full px-3 py-2 rounded-xl font-mono border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={creatingChallenge}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                {creatingChallenge ? 'Publishing...' : 'Publish Challenge to SQLite DB'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SYSTEM PERFORMANCE & ENCRYPTION TELEMETRY */}
      {activeTab === 'performance' && systemStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <p className="text-xs text-slate-500 font-semibold uppercase">Database Encryption</p>
              <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> AES-256-CBC
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">File Vault Active</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <p className="text-xs text-slate-500 font-semibold uppercase">Database Container Size</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {systemStats.dbFileSizeKb} KB
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">data/academy_encrypted.db</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <p className="text-xs text-slate-500 font-semibold uppercase">Memory Heap Usage</p>
              <h3 className="text-lg font-bold text-sky-500 font-mono">
                {systemStats.memoryUsageMb} MB
              </h3>
              <p className="text-[11px] text-slate-400">Node Engine Memory</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <p className="text-xs text-slate-500 font-semibold uppercase">Server Uptime</p>
              <h3 className="text-lg font-bold text-amber-500 font-mono">
                {systemStats.uptimeSeconds}s
              </h3>
              <p className="text-[11px] text-slate-400">Continuous Runtime</p>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Security & Action Audit Logs
            </h3>
            <div className="space-y-1.5 font-mono text-xs max-h-60 overflow-y-auto">
              {systemStats.auditLogs?.map((log, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-500">{log.timestamp}</span>
                    <span className="font-bold text-indigo-400">[{log.action}]</span>
                    <span>User: {log.user}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">{log.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE INSPECTOR LOG */}
      {activeTab === 'db_inspect' && dbInspector && (
        <div className="p-6 rounded-3xl bg-slate-950 text-slate-100 border border-slate-800 shadow-xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-amber-400 font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4" /> SQLite Runtime Diagnostic Inspector
            </span>
            <span className="text-slate-400">Tables Count: {dbInspector.tableCount}</span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-slate-400">// Encrypted Data Container Vault Path:</p>
              <p className="text-emerald-400 font-bold">{dbInspector.encryptedContainer}</p>
            </div>

            <div>
              <p className="text-slate-400">// SQLite Users Table Snapshot:</p>
              <pre className="p-3 bg-slate-900 rounded-xl overflow-x-auto text-[11px] text-cyan-300">
                {JSON.stringify(dbInspector.tables.users, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
