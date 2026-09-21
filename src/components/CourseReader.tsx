import React, { useState, useEffect } from 'react';
import { Course, Lesson } from '../types';
import Swal from 'sweetalert2';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Code, 
  Play, 
  BookOpen, 
  Award, 
  Sparkles, 
  Check, 
  Copy,
  Terminal,
  FileCode,
  List,
  Lock,
  LockKeyhole
} from 'lucide-react';

interface CourseReaderProps {
  courseId: number;
  token: string;
  onBack: () => void;
  onLaunchSandbox: (code: { html?: string; css?: string; js?: string }) => void;
}

export const CourseReader: React.FC<CourseReaderProps> = ({
  courseId,
  token,
  onBack,
  onLaunchSandbox
}) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css' | 'js' | 'php' | 'sql'>('html');
  const [copied, setCopied] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load course details');
      const data = await res.json();
      setCourse(data.course);
      const fetchedLessons = data.course.lessons || [];
      setLessons(fetchedLessons);

      // Default to first incomplete lesson if available
      const incompleteIdx = fetchedLessons.findIndex((l: Lesson) => !l.isCompleted);
      if (incompleteIdx !== -1) {
        setActiveLessonIndex(incompleteIdx);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading course details');
    } finally {
      setLoading(false);
    }
  };

  const currentLesson: Lesson | undefined = lessons[activeLessonIndex];

  // Set default active tab based on code snippets present in the lesson
  useEffect(() => {
    if (currentLesson) {
      if (currentLesson.codeExampleHtml) setActiveCodeTab('html');
      else if (currentLesson.codeExampleCss) setActiveCodeTab('css');
      else if (currentLesson.codeExampleJs) setActiveCodeTab('js');
      else if (currentLesson.codeExamplePhp) setActiveCodeTab('php');
      else if (currentLesson.codeExampleSql) setActiveCodeTab('sql');
    }
  }, [activeLessonIndex, currentLesson]);

  const handleMarkComplete = async () => {
    if (!currentLesson || markingComplete) return;
    try {
      setMarkingComplete(true);
      const res = await fetch(`/api/courses/${courseId}/lessons/${currentLesson.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to mark lesson completed');
      const data = await res.json();

      // Update local state
      setLessons((prev) =>
        prev.map((l, idx) => (idx === activeLessonIndex ? { ...l, isCompleted: true } : l))
      );

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: data.isCourseCompleted ? '🏆 Course Mastered!' : 'Lesson Completed!',
        text: data.message,
        showConfirmButton: false,
        timer: 3000,
        background: '#0f172a',
        color: '#f8fafc'
      });

      // Auto-advance to next lesson if available
      if (activeLessonIndex < lessons.length - 1) {
        setActiveLessonIndex((prev) => prev + 1);
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        background: '#0f172a',
        color: '#f8fafc'
      });
    } fontComplete: {
      setMarkingComplete(false);
    }
  };

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeSnippetForActiveTab = (): string => {
    if (!currentLesson) return '';
    switch (activeCodeTab) {
      case 'html': return currentLesson.codeExampleHtml || '';
      case 'css': return currentLesson.codeExampleCss || '';
      case 'js': return currentLesson.codeExampleJs || '';
      case 'php': return currentLesson.codeExamplePhp || '';
      case 'sql': return currentLesson.codeExampleSql || '';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-fadeIn">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading course guide from encrypted database...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-4 p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
        <p className="text-red-400 text-sm">{error || 'Course not found'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
        >
          Return to Course Catalog
        </button>
      </div>
    );
  }

  const activeSnippet = getCodeSnippetForActiveTab();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {course.level}
              </span>
              <span className="text-xs text-slate-400">
                {lessons.filter((l) => l.isCompleted).length} / {lessons.length} Lessons Completed
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">{course.title}</h1>
          </div>
        </div>

        {/* Global Progress */}
        <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
          <Award className="w-5 h-5 text-indigo-400" />
          <div className="text-right">
            <div className="text-xs text-slate-400">Course Mastery</div>
            <div className="text-sm font-bold text-indigo-300">{course.progressPercent}%</div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout: Sidebar Navigation + Content Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Lesson Index */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <List className="w-4 h-4 text-indigo-400" />
              Lesson Index
            </span>
            <span>{lessons.length} Modules</span>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {lessons.map((lesson, idx) => {
              const isActive = idx === activeLessonIndex;
              const isCompleted = lesson.isCompleted;
              const isLocked = lesson.isLocked;

              const handleLessonClick = () => {
                if (isLocked) {
                  Swal.fire({
                    title: 'Chapter Locked!',
                    text: `You must complete Chapter ${idx} before unlocking "${lesson.title}". Complete lessons sequentially!`,
                    icon: 'warning',
                    confirmButtonText: 'Got it',
                    confirmButtonColor: '#4f46e5',
                    background: '#0f172a',
                    color: '#f8fafc'
                  });
                  return;
                }
                setActiveLessonIndex(idx);
              };

              return (
                <button
                  key={lesson.id}
                  onClick={handleLessonClick}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border ${
                    isLocked
                      ? 'bg-slate-950/20 border-slate-900 text-slate-500 cursor-not-allowed'
                      : isActive
                      ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-200 shadow-md'
                      : 'bg-slate-950/40 hover:bg-slate-950 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isLocked
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : isActive
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate flex items-center justify-between">
                      <span className={isLocked ? 'text-slate-500' : ''}>{lesson.title}</span>
                      {isLocked && <span className="text-[10px] font-semibold text-amber-400/90 ml-1">Locked</span>}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{lesson.summary}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Reader & Code Inspector */}
        <div className="lg:col-span-8 space-y-6">
          {currentLesson ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              {/* Lesson Title Header */}
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    Lesson {currentLesson.orderNum} of {lessons.length}
                  </span>
                  {currentLesson.isCompleted && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-100">{currentLesson.title}</h2>
                <p className="text-sm text-slate-300 leading-relaxed italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  "{currentLesson.summary}"
                </p>
              </div>

              {/* Main Content Markdown Render */}
              <div className="text-slate-200 text-sm leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
                {currentLesson.contentMarkdown}
              </div>

              {/* Multi-Language Code Snippet Inspector */}
              {(currentLesson.codeExampleHtml || currentLesson.codeExampleCss || currentLesson.codeExampleJs || currentLesson.codeExamplePhp || currentLesson.codeExampleSql) && (
                <div className="space-y-3 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                  {/* Code Snippet Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                    <div className="flex items-center gap-1">
                      {currentLesson.codeExampleHtml && (
                        <button
                          onClick={() => setActiveCodeTab('html')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            activeCodeTab === 'html' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          HTML5
                        </button>
                      )}
                      {currentLesson.codeExampleCss && (
                        <button
                          onClick={() => setActiveCodeTab('css')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            activeCodeTab === 'css' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          CSS3
                        </button>
                      )}
                      {currentLesson.codeExampleJs && (
                        <button
                          onClick={() => setActiveCodeTab('js')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            activeCodeTab === 'js' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          JavaScript
                        </button>
                      )}
                      {currentLesson.codeExamplePhp && (
                        <button
                          onClick={() => setActiveCodeTab('php')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            activeCodeTab === 'php' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          PHP 8
                        </button>
                      )}
                      {currentLesson.codeExampleSql && (
                        <button
                          onClick={() => setActiveCodeTab('sql')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            activeCodeTab === 'sql' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          SQL Database
                        </button>
                      )}
                    </div>

                    {/* Actions: Copy & Sandbox Bridge */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCode(activeSnippet)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>

                      {/* Launch in Sandbox Bridge */}
                      {(currentLesson.codeExampleHtml || currentLesson.codeExampleCss || currentLesson.codeExampleJs) && (
                        <button
                          onClick={() => onLaunchSandbox({
                            html: currentLesson.codeExampleHtml,
                            css: currentLesson.codeExampleCss,
                            js: currentLesson.codeExampleJs
                          })}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Launch in Sandbox
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Snippet Code View */}
                  <pre className="p-4 text-xs font-mono text-emerald-300 bg-slate-950 overflow-x-auto leading-relaxed max-h-96">
                    <code>{activeSnippet || '// No code snippet provided for this tab.'}</code>
                  </pre>
                </div>
              )}

              {/* Key Takeaways */}
              {currentLesson.keyTakeaways && currentLesson.keyTakeaways.length > 0 && (
                <div className="p-4 bg-indigo-950/40 border border-indigo-900/50 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Key Takeaways & Best Practices
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                    {currentLesson.keyTakeaways.map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom Footer Navigation & Mark Complete */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => setActiveLessonIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeLessonIndex === 0}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Lesson
                </button>

                <button
                  onClick={handleMarkComplete}
                  disabled={currentLesson.isCompleted || markingComplete}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    currentLesson.isCompleted
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/50 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {currentLesson.isCompleted ? 'Lesson Completed' : 'Mark Lesson Completed (+100 XP)'}
                </button>

                <button
                  onClick={() => setActiveLessonIndex((prev) => Math.min(lessons.length - 1, prev + 1))}
                  disabled={activeLessonIndex === lessons.length - 1}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  Next Lesson
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Select a lesson from the index to begin reading.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
