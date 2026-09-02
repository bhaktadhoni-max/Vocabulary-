import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Flame, 
  HelpCircle,
  ArrowRight,
  Sparkles,
  Sliders,
  Turtle
} from 'lucide-react';
import { VocabItem } from '../types';
import { 
  speakJapanese, 
  speakBangla,
  playSuccessChime, 
  playErrorSound, 
  playStreakChime 
} from '../utils/sound';

interface QuizViewProps {
  allVocab: VocabItem[];
  onToggleBookmark: (id: number) => void;
  bookmarkedIds: Set<number>;
  onOpenVoiceSettings?: () => void;
}

interface QuizQuestion {
  vocab: VocabItem;
  options: string[];
  correctAnswer: string;
}

export const QuizView: React.FC<QuizViewProps> = ({
  allVocab,
  onToggleBookmark,
  bookmarkedIds,
  onOpenVoiceSettings
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [totalQuizQuestions, setTotalQuizQuestions] = useState(10);

  // Generate a fresh randomized quiz set
  const generateQuiz = useCallback((count = 10) => {
    if (allVocab.length < 4) return;

    // Shuffle vocabulary
    const shuffled = [...allVocab].sort(() => 0.5 - Math.random());
    const selectedVocabs = shuffled.slice(0, count);

    const generatedQuestions: QuizQuestion[] = selectedVocabs.map((vocab) => {
      // Pick 3 random incorrect Bengali options from other words
      const otherVocabs = allVocab.filter((v) => v.id !== vocab.id);
      const wrongShuffled = otherVocabs.sort(() => 0.5 - Math.random()).slice(0, 3);
      const wrongOptions = wrongShuffled.map((v) => v.bn);

      const options = [...wrongOptions, vocab.bn].sort(() => 0.5 - Math.random());

      return {
        vocab,
        options,
        correctAnswer: vocab.bn
      };
    });

    setQuestions(generatedQuestions);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setStreak(0);
    setIsQuizCompleted(false);
  }, [allVocab]);

  // Initial load
  useEffect(() => {
    generateQuiz(totalQuizQuestions);
  }, [generateQuiz, totalQuizQuestions]);

  const currentQ = questions[currentIdx];

  const handleSelectOption = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQ || isAnswerSubmitted) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQ.correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);

      if (nextStreak >= 3) {
        playStreakChime();
      } else {
        playSuccessChime();
      }
    } else {
      setStreak(0);
      playErrorSound();
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
    }
  };

  if (questions.length === 0 || !currentQ) {
    return (
      <div className="text-center p-12 text-slate-500 font-bengali">
        কুইজ লোড হচ্ছে...
      </div>
    );
  }

  // Quiz Finished Screen
  if (isQuizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div id="quiz-complete-screen" className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-[32px] p-8 border border-slate-700/70 shadow-2xl space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-bold font-bengali text-white mb-1">
              কুইজ সম্পন্ন হয়েছে!
            </h2>
            <p className="text-slate-400 font-bengali text-sm">
              আপনার ফলাফল ও পারফরম্যান্স
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400 font-bengali">সঠিক উত্তর</span>
              <p className="text-2xl font-bold text-white font-mono mt-1">
                {score} / {questions.length}
              </p>
              <span className="text-xs font-semibold text-cyan-400 font-mono">{percentage}%</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400 font-bengali">সেরা স্ট্রিক</span>
              <p className="text-2xl font-bold text-amber-400 font-mono flex items-center justify-center gap-1 mt-1">
                <Flame className="w-5 h-5 fill-amber-400" />
                {bestStreak}
              </p>
              <span className="text-xs text-slate-400 font-bengali">টানা সঠিক</span>
            </div>
          </div>

          <button
            id="btn-quiz-retry"
            onClick={() => generateQuiz(totalQuizQuestions)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold font-bengali shadow-xl shadow-blue-900/30 transition active:scale-95 uppercase tracking-wider"
          >
            <RotateCcw className="w-4 h-4" />
            <span>আবার কুইজ দিন (Play Again)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="quiz-container" className="max-w-2xl mx-auto px-4 py-6">
      
      {/* Quiz Progress Header */}
      <div className="flex items-center justify-between mb-4 bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-xl shadow-black/20">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-cyan-400 font-mono">
            Question {currentIdx + 1} / {questions.length}
          </span>
          <span className="text-xs text-slate-400 font-bengali">
            স্কোর: <strong className="text-white font-mono">{score}</strong>
          </span>
        </div>

        {streak > 1 && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-xl border border-amber-500/40 animate-pulse font-mono">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>{streak} STREAK!</span>
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-[32px] border border-slate-700/60 shadow-2xl p-6 sm:p-8 mb-6 text-center space-y-5">
        
        <div className="flex items-center justify-between text-xs text-slate-400 font-bengali">
          <span className="px-2.5 py-1 rounded-md bg-slate-950 text-cyan-400 border border-slate-800 text-xs font-mono">
            {currentQ.vocab.category}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => speakJapanese(currentQ.vocab.hiragana || currentQ.vocab.kanji, { slow: false })}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-800 font-medium transition text-xs"
              title="স্বাভাবিক স্পষ্ট উচ্চারণ শুনুন"
            >
              <Volume2 className="w-4 h-4" />
              <span>উচ্চারণ</span>
            </button>
            <button
              onClick={() => speakJapanese(currentQ.vocab.hiragana || currentQ.vocab.kanji, { slow: true })}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 font-medium transition text-xs"
              title="ধীর ও স্পষ্ট সিলেবল উচ্চারণ (0.65x)"
            >
              <Turtle className="w-4 h-4" />
              <span>ধীরে</span>
            </button>
            {onOpenVoiceSettings && (
              <button
                onClick={onOpenVoiceSettings}
                className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition"
                title="ভয়েস সেটিংস"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="py-2">
          <h2 className="text-4xl sm:text-6xl font-bold font-japanese text-white mb-2 drop-shadow-md">
            {currentQ.vocab.kanji}
          </h2>
          <p className="text-xl sm:text-2xl font-light font-japanese text-cyan-400">
            {currentQ.vocab.hiragana}
            <span className="text-xs text-slate-400 font-mono ml-2 font-normal">
              [{currentQ.vocab.romaji}]
            </span>
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 font-bengali">
          নিচের কোন বাংলা অর্থটি সঠিক? নির্বাচন করুন:
        </p>

        {/* 4 Multiple Choice Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correctAnswer;

            let buttonStyle = 'bg-slate-950/70 hover:bg-slate-850 border-slate-800 text-slate-200';

            if (isAnswerSubmitted) {
              if (isCorrect) {
                buttonStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-rose-950/70 border-rose-500 text-rose-200 ring-2 ring-rose-500/30';
              } else {
                buttonStyle = 'bg-slate-950/30 border-slate-900 text-slate-600 opacity-50';
              }
            } else if (isSelected) {
              buttonStyle = 'bg-blue-950/60 border-cyan-500 text-white ring-2 ring-cyan-500/30';
            }

            return (
              <button
                key={idx}
                disabled={isAnswerSubmitted}
                onClick={() => handleSelectOption(option)}
                className={`p-4 rounded-2xl border text-left font-bengali font-semibold text-sm sm:text-base transition-all flex items-center justify-between gap-2 active:scale-[0.99] ${buttonStyle}`}
              >
                <span>{option}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isAnswerSubmitted && isCorrect && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakBangla(option);
                        }}
                        className="p-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 transition"
                        title="বাংলা শুনুন"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </>
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button: Check Answer or Next Question */}
        <div className="pt-4">
          {!isAnswerSubmitted ? (
            <button
              id="btn-submit-answer"
              disabled={!selectedOption}
              onClick={handleSubmitAnswer}
              className={`w-full py-4 rounded-2xl font-bold font-bengali transition uppercase tracking-wider ${
                selectedOption
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-xl shadow-blue-900/30 active:scale-95 cursor-pointer'
                  : 'bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
            >
              উত্তর নিশ্চিত করুন (Submit)
            </button>
          ) : (
            <button
              id="btn-next-question"
              onClick={handleNextQuestion}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold font-bengali transition shadow-xl shadow-cyan-900/30 flex items-center justify-center gap-2 active:scale-95 uppercase tracking-wider"
            >
              <span>পরবর্তী প্রশ্ন (Next)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
