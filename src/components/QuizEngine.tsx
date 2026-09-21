import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { HelpCircle, CheckCircle2, Award, Clock, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';
import { Quiz } from '../types';

interface QuizEngineProps {
  quizzes: Quiz[];
  selectedQuizId?: number;
  onQuizCompleted: () => void;
  isDarkMode: boolean;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  quizzes,
  selectedQuizId,
  onQuizCompleted,
  isDarkMode
}) => {
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    if (quizzes.length > 0) {
      let idx = 0;
      if (selectedQuizId) {
        const found = quizzes.findIndex((q) => q.id === selectedQuizId);
        if (found !== -1) idx = found;
      }
      setActiveQuizIndex(idx);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setSubmitted(false);
    }
  }, [quizzes, selectedQuizId]);

  const currentQuiz = quizzes[activeQuizIndex];

  if (!currentQuiz) {
    return <div className="p-8 text-center text-slate-500">No quizzes available.</div>;
  }

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (submitted) return;
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: optionIndex
    });
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
    setCurrentQuestionIndex(0);
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(userAnswers).length < currentQuiz.questions.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Unanswered Questions',
        text: 'Please select an answer for all questions before submitting.',
        confirmButtonColor: '#6366f1'
      });
      return;
    }

    setEvaluating(true);
    try {
      const response = await fetch(`/api/quizzes/${currentQuiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answers: userAnswers })
      });

      const data = await response.json();
      setSubmitted(true);

      Swal.fire({
        icon: data.scorePercent >= 70 ? 'success' : 'info',
        title: `Quiz Result: ${data.scorePercent}%`,
        html: `
          <p>You answered <strong>${data.correctCount}</strong> out of <strong>${data.totalQuestions}</strong> questions correctly!</p>
          ${
            data.newlyUnlockedBadges && data.newlyUnlockedBadges.length > 0
              ? `<div style="background: #1e1b4b; padding: 10px; border-radius: 8px; margin-top: 10px; color: #a5b4fc;">
                  🏆 <strong>Badge Unlocked:</strong> ${data.newlyUnlockedBadges.join(', ')}
                </div>`
              : ''
          }
        `,
        confirmButtonColor: '#6366f1',
        background: isDarkMode ? '#0f172a' : '#ffffff',
        color: isDarkMode ? '#f8fafc' : '#0f172a'
      });

      onQuizCompleted();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Error',
        text: 'Failed to evaluate quiz score.'
      });
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quiz Selector Row */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center space-x-2">
          {quizzes.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => {
                setActiveQuizIndex(idx);
                setCurrentQuestionIndex(0);
                setUserAnswers({});
                setSubmitted(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                idx === activeQuizIndex
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Quiz #{q.id}: {q.title}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Time Limit: {currentQuiz.timeLimitMinutes}m
          </span>
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {currentQuiz.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
            </p>
          </div>

          <div className="flex items-center space-x-1">
            {currentQuiz.questions.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentQuestionIndex
                    ? 'bg-indigo-600 scale-125'
                    : userAnswers[currentQuiz.questions[idx].id] !== undefined
                    ? 'bg-emerald-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
            {currentQuestion.question}
          </h3>

          {/* Options List */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIdx) => {
              const isSelected = userAnswers[currentQuestion.id] === optionIdx;
              const isCorrect = currentQuestion.correctAnswerIndex === optionIdx;

              let optionStyle =
                'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:border-indigo-500 text-slate-800 dark:text-slate-200';

              if (isSelected) {
                optionStyle = 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold';
              }

              if (submitted) {
                if (isCorrect) {
                  optionStyle = 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'border-rose-600 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300';
                }
              }

              return (
                <button
                  key={optionIdx}
                  onClick={() => handleSelectOption(optionIdx)}
                  className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                >
                  <span className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {String.fromCharCode(65 + optionIdx)}
                    </span>
                    <span>{option}</span>
                  </span>
                  {submitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner when Submitted */}
          {submitted && (
            <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 text-indigo-200 text-xs space-y-1 mt-4">
              <span className="font-bold uppercase tracking-wider text-indigo-400 block">Explanation & Concept:</span>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold disabled:opacity-40"
          >
            Previous
          </button>

          {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              {submitted && (
                <button
                  onClick={handleResetQuiz}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake
                </button>
              )}
              <button
                onClick={handleSubmitQuiz}
                disabled={evaluating || submitted}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 disabled:opacity-50 cursor-pointer"
              >
                {evaluating ? 'Evaluating...' : 'Submit Quiz Answers'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
