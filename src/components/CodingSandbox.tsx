import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import Swal from 'sweetalert2';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-one_dark';
import 'ace-builds/src-noconflict/theme-github';
import { Play, CheckCircle2, RefreshCw, Code, Sparkles, BookOpen, Layers } from 'lucide-react';
import { Challenge } from '../types';

interface CodingSandboxProps {
  challenges: Challenge[];
  selectedChallengeId?: number;
  onChallengeCompleted: () => void;
  isDarkMode: boolean;
}

export const CodingSandbox: React.FC<CodingSandboxProps> = ({
  challenges,
  selectedChallengeId,
  onChallengeCompleted,
  isDarkMode
}) => {
  const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [previewSrcDoc, setPreviewSrcDoc] = useState('');

  // Load selected challenge
  useEffect(() => {
    if (challenges.length > 0) {
      let idx = 0;
      if (selectedChallengeId) {
        const found = challenges.findIndex((c) => c.id === selectedChallengeId);
        if (found !== -1) idx = found;
      }
      setActiveChallengeIndex(idx);
      const current = challenges[idx];
      setHtmlCode(current.starterCodeHtml || '');
      setCssCode(current.starterCodeCss || '');
      setJsCode(current.starterCodeJs || '');
    }
  }, [challenges, selectedChallengeId]);

  // Update Prism highlighting when challenge changes
  useEffect(() => {
    Prism.highlightAll();
  }, [activeChallengeIndex, activeTab]);

  const currentChallenge = challenges[activeChallengeIndex];

  // Update Live Preview Iframe
  const handleRunPreview = () => {
    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>
            try {
              ${jsCode}
            } catch (err) {
              console.error("Execution error:", err);
            }
          </script>
        </body>
      </html>
    `;
    setPreviewSrcDoc(combined);
  };

  useEffect(() => {
    handleRunPreview();
  }, [htmlCode, cssCode, jsCode]);

  const handleResetStarter = () => {
    if (currentChallenge) {
      setHtmlCode(currentChallenge.starterCodeHtml);
      setCssCode(currentChallenge.starterCodeCss);
      setJsCode(currentChallenge.starterCodeJs);
    }
  };

  const handleSubmitSolution = async () => {
    if (!currentChallenge) return;
    setEvaluating(true);

    try {
      const response = await fetch(`/api/challenges/${currentChallenge.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ htmlCode, cssCode, jsCode })
      });

      const data = await response.json();

      if (data.passed) {
        Swal.fire({
          icon: 'success',
          title: 'Challenge Passed!',
          html: `
            <div style="text-align: left; font-size: 14px;">
              <p><strong>Feedback:</strong> ${data.feedback}</p>
              <p style="color: #10b981; font-weight: bold; margin-top: 8px;">+${data.pointsEarned} XP Earned!</p>
              ${
                data.newlyUnlockedBadges && data.newlyUnlockedBadges.length > 0
                  ? `<div style="background: #1e1b4b; padding: 10px; border-radius: 8px; margin-top: 10px; color: #a5b4fc;">
                      🏆 <strong>Badge Unlocked:</strong> ${data.newlyUnlockedBadges.join(', ')}
                    </div>`
                  : ''
              }
            </div>
          `,
          confirmButtonColor: '#6366f1',
          background: isDarkMode ? '#0f172a' : '#ffffff',
          color: isDarkMode ? '#f8fafc' : '#0f172a'
        });
        onChallengeCompleted();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Test Cases Failed',
          text: data.feedback,
          confirmButtonColor: '#e11d48',
          background: isDarkMode ? '#0f172a' : '#ffffff',
          color: isDarkMode ? '#f8fafc' : '#0f172a'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Evaluation Error',
        text: 'Failed to submit solution to server.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setEvaluating(false);
    }
  };

  if (!currentChallenge) {
    return <div className="p-8 text-center text-slate-500">No challenges available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Selector Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3 overflow-x-auto py-1">
          {challenges.map((c, index) => (
            <button
              key={c.id}
              onClick={() => setActiveChallengeIndex(index)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                index === activeChallengeIndex
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              #{c.id}: {c.title}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleResetStarter}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
            title="Reset Starter Code"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Code</span>
          </button>
          <button
            onClick={handleSubmitSolution}
            disabled={evaluating}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{evaluating ? 'Evaluating...' : 'Submit & Validate'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Instructions + Ace Editor + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Challenge Description & Instructions */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {currentChallenge.difficulty}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              +{currentChallenge.points} XP
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentChallenge.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {currentChallenge.description}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              Requirements & Rules:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {currentChallenge.instructions?.map((inst: string, idx: number) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prism.js Code Reference Snippet */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Prism.js Syntax Highlight Guide:
            </h4>
            <pre className="text-[11px] p-3 rounded-xl bg-slate-950 text-slate-200 overflow-x-auto font-mono">
              <code className="language-javascript">
                {`// Challenge evaluation rule regex:\n${currentChallenge.expectedOutputRegex || 'Standard DOM Validation'}`}
              </code>
            </pre>
          </div>
        </div>

        {/* Right Col: Code Editor Tabs & Live Preview */}
        <div className="lg:col-span-8 space-y-4">
          {/* Editor Header Bar */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('html')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'html'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                HTML5
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'css'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                CSS3
              </button>
              <button
                onClick={() => setActiveTab('js')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'js'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                JS (ES6)
              </button>
            </div>

            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-indigo-500" /> Ace Code Canvas Engine
            </span>
          </div>

          {/* Ace Editor Panel */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
            {activeTab === 'html' && (
              <AceEditor
                mode="html"
                theme={isDarkMode ? 'one_dark' : 'github'}
                name="html_editor"
                value={htmlCode}
                onChange={(val) => setHtmlCode(val)}
                fontSize={13}
                width="100%"
                height="260px"
                showPrintMargin={false}
                editorProps={{ $blockScrolling: true }}
                setOptions={{ enableBasicAutocompletion: true, showLineNumbers: true }}
              />
            )}
            {activeTab === 'css' && (
              <AceEditor
                mode="css"
                theme={isDarkMode ? 'one_dark' : 'github'}
                name="css_editor"
                value={cssCode}
                onChange={(val) => setCssCode(val)}
                fontSize={13}
                width="100%"
                height="260px"
                showPrintMargin={false}
                editorProps={{ $blockScrolling: true }}
                setOptions={{ enableBasicAutocompletion: true, showLineNumbers: true }}
              />
            )}
            {activeTab === 'js' && (
              <AceEditor
                mode="javascript"
                theme={isDarkMode ? 'one_dark' : 'github'}
                name="js_editor"
                value={jsCode}
                onChange={(val) => setJsCode(val)}
                fontSize={13}
                width="100%"
                height="260px"
                showPrintMargin={false}
                editorProps={{ $blockScrolling: true }}
                setOptions={{ enableBasicAutocompletion: true, showLineNumbers: true }}
              />
            )}
          </div>

          {/* Real-time Iframe Sandbox Preview */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-emerald-500" /> Real-time Browser Execution Stage
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Isolated Sandboxed Iframe</span>
            </div>
            <div className="w-full h-48 rounded-xl bg-white border border-slate-300 dark:border-slate-700 overflow-hidden shadow-inner">
              <iframe
                title="Code Sandbox Live Output"
                srcDoc={previewSrcDoc}
                className="w-full h-full border-none"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
