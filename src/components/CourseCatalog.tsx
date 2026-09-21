import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Course } from '../types';
import { 
  BookOpen, 
  Search, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Code, 
  Layout, 
  Code2, 
  Server, 
  Database, 
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  Lock,
  LockKeyhole,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

interface CourseCatalogProps {
  onSelectCourse: (courseId: number) => void;
  token: string;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ onSelectCourse, token }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err: any) {
      setError(err.message || 'Error loading course curriculum');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    if (course.isLocked) {
      Swal.fire({
        title: 'Prerequisite Course Locked!',
        html: `
          <div class="text-left space-y-3">
            <p class="text-slate-300 text-sm">
              You must complete <strong>100%</strong> of the prerequisite course before accessing <strong>${course.title}</strong>.
            </p>
            <div class="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <span class="font-bold">Required Prerequisite:</span>
              <span>${course.prerequisiteCourseTitle || 'Preceding Track'}</span>
            </div>
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'Understood, I will complete prerequisites first',
        confirmButtonColor: '#4f46e5',
        background: '#0f172a',
        color: '#f8fafc'
      });
      return;
    }
    onSelectCourse(course.id);
  };

  const trackIcons: Record<string, React.ReactNode> = {
    html: <Code className="w-5 h-5 text-amber-500" />,
    css: <Layout className="w-5 h-5 text-sky-500" />,
    javascript: <Code2 className="w-5 h-5 text-yellow-500" />,
    php: <Server className="w-5 h-5 text-indigo-500" />,
    sql: <Database className="w-5 h-5 text-emerald-500" />,
    fullstack: <ShieldCheck className="w-5 h-5 text-purple-500" />
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrack = selectedTrack === 'all' || course.trackId === selectedTrack;
    const matchesLevel = selectedLevel === 'all' || course.level.toLowerCase() === selectedLevel.toLowerCase();
    return matchesSearch && matchesTrack && matchesLevel;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            Curriculum & Study Guides
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Sequential Full-Stack Web Development Path
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Progress through our advanced multi-chapter tracks in strict order: master HTML5 document architecture first, unlock CSS3 layout engines, advance to JavaScript ES6+, proceed to PHP 8 backend scripting, query SQL relational databases, and culminate in full-stack security.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Sequential Pathway Map Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Sequential Learning Sequence (W3Schools Style)
          </span>
          <span className="text-[11px] text-slate-400">Complete prerequisites to unlock downstream courses</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Code className="w-3.5 h-3.5" />
            <span>1. HTML5</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600 hidden sm:block" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/30">
            <Layout className="w-3.5 h-3.5" />
            <span>2. CSS3</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600 hidden sm:block" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
            <Code2 className="w-3.5 h-3.5" />
            <span>3. JavaScript</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600 hidden sm:block" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            <Server className="w-3.5 h-3.5" />
            <span>4. PHP 8</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600 hidden sm:block" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <Database className="w-3.5 h-3.5" />
            <span>5. SQL</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600 hidden sm:block" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>6. Security</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-md">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search web dev topics, languages, frameworks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Tech Tracks</option>
            <option value="html">HTML5 Markup</option>
            <option value="css">CSS3 Layouts</option>
            <option value="javascript">JavaScript ES6+</option>
            <option value="php">PHP 8 Backend</option>
            <option value="sql">SQL Databases</option>
            <option value="fullstack">Fullstack Security</option>
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Difficulty Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Course List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading course curriculum from encrypted vault...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-sm text-center">
          {error}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-8">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-200">No courses match your filter</h3>
          <p className="text-sm text-slate-400 mt-1">Try clearing your search query or choosing another technology track.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isCompleted = course.isCourseCompleted;
            const isLocked = course.isLocked;
            const progressPct = course.progressPercent || 0;

            return (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course)}
                className={`group relative rounded-2xl p-6 transition-all duration-200 shadow-md flex flex-col justify-between cursor-pointer ${
                  isLocked
                    ? 'bg-slate-900/40 border border-slate-800/80 opacity-80 hover:opacity-100 hover:border-amber-500/40'
                    : 'bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:shadow-indigo-500/10'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Meta */}
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-indigo-500/30 transition-colors">
                      {trackIcons[course.trackId] || <BookOpen className="w-5 h-5 text-indigo-400" />}
                    </div>

                    <div className="flex items-center gap-2">
                      {isLocked ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      ) : (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                          course.level === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          course.level === 'Intermediate' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {course.level}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                      <span>{course.title}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Prerequisite Banner for Locked Courses */}
                  {isLocked && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-2">
                      <LockKeyhole className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Prerequisite Locked</span>
                        <span className="text-[11px] text-amber-400/90">
                          Complete 100% of <strong>{course.prerequisiteCourseTitle || 'Preceding Track'}</strong> to unlock.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Meta & Progress */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      {course.lessonCount || 0} Chapters
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      ~{course.estimatedHours || 3} Hours
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Course Progress</span>
                      <span className="font-semibold text-indigo-400">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isLocked ? 'bg-slate-700' : 'bg-gradient-to-r from-indigo-500 to-sky-400'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(course);
                    }}
                    className={`w-full mt-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                      isLocked
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                        : isCompleted
                        ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                        : progressPct > 0
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-4 h-4 text-amber-400" />
                        Prerequisite Locked
                      </>
                    ) : isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Completed (Review Chapters)
                      </>
                    ) : progressPct > 0 ? (
                      <>
                        Continue Course
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Start Learning Track
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
