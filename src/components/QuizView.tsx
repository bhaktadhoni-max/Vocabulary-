import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Flame, 
  ArrowRight,
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
    setBestStreak(0);
    setIsQuizCompleted(false);
  }, [allVocab]);

  useEffect(() => {
    generateQuiz(totalQuizQuestions);
  }, [generateQuiz, totalQuizQuestions]);

  const currentQ = questions[currentIdx];

  const handleSelectOption = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswerSubmitted || !currentQ) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQ.correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      if (newStreak >= 3 && newStreak % 3 === 0) {
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
        <div className="bg-white rounded-[32px] p-8 border border-[#e8e2d4] shadow-xs space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#f6c445] flex items-center justify-center text-[#78350f] shadow-xs">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-bold font-bengali text-slate-900 mb-1">
              কুইজ সম্পন্ন হয়েছে!
            </h2>
            <p className="text-slate-500 font-bengali text-sm">
              আপনার ফলাফল ও পারফরম্যান্স
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e2d4]">
              <span className="text-xs text-slate-500 font-bengali">সঠিক উত্তর</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
                {score} / {questions.length}
              </p>
              <span className="text-xs font-semibold text-[#558b2f] font-mono">{percentage}%</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e2d4]">
              <span className="text-xs text-slate-500 font-bengali">সেরা স্ট্রিক</span>
              <p className="text-2xl font-bold text-amber-600 font-mono flex items-center justify-center gap-1 mt-1">
                <Flame className="w-5 h-5 fill-amber-500" />
                {bestStreak}
              </p>
              <span className="text-xs text-slate-500 font-bengali">টানা সঠিক</span>
            </div>
          </div>

          <button
            id="btn-quiz-retry"
            onClick={() => generateQuiz(totalQuizQuestions)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#558b2f] hover:bg-[#467326] text-white font-bold font-bengali shadow-xs transition active:scale-95 uppercase tracking-wider"
          >
            <RotateCcw className="w-4 h-4" />
            <span>আবার কুইজ দিন (Play Again)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="quiz-container" className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      
      {/* Quiz Progress Header */}
      <div className="flex items-center justify-between mb-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#e8e2d4] shadow-xs">
        <div className="flex items-center gap-2 font-bengali">
          <span className="px-3 py-1 rounded-xl bg-[#faf8f5] border border-[#e2dcd0] text-xs font-bold text-[#558b2f] font-mono">
            প্রশ্ন {currentIdx + 1} / {questions.length}
          </span>
          <span className="text-xs text-slate-600">
            স্কোর: <strong className="text-slate-900 font-mono">{score}</strong>
          </span>
        </div>

        {streak > 1 && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#78350f] bg-amber-100 px-3 py-1 rounded-xl border border-amber-300 font-mono">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{streak} STREAK!</span>
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-[32px] border border-[#e8e2d4] shadow-xs p-6 sm:p-8 mb-6 text-center space-y-5">
        
        <div className="flex items-center justify-between text-xs text-slate-500 font-bengali">
          <span className="px-2.5 py-1 rounded-md bg-[#faf8f5] text-slate-600 border border-[#e8e2d4] text-xs font-bengali">
            {currentQ.vocab.category}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => speakJapanese(currentQ.vocab.hiragana || currentQ.vocab.kanji, { slow: false })}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#f4f9ea] hover:bg-[#e9f4d7] text-[#558b2f] border border-[#d6eab9] font-medium transition text-xs"
              title="স্বাভাবিক স্পষ্ট উচ্চারণ শুনুন"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>উচ্চারণ</span>
            </button>
            <button
              onClick={() => speakJapanese(currentQ.vocab.hiragana || currentQ.vocab.kanji, { slow: true })}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#fef9ee] hover:bg-[#fef3d6] text-[#b45309] border border-[#fde68a] font-medium transition text-xs"
              title="ধীর উচ্চারণ (0.65x)"
            >
              <Turtle className="w-3.5 h-3.5" />
              <span>ধীরে</span>
            </button>
            {onOpenVoiceSettings && (
              <button
                onClick={onOpenVoiceSettings}
                className="p-1.5 rounded-xl bg-[#faf8f5] hover:bg-slate-100 text-slate-500 border border-[#e8e2d4] transition"
                title="ভয়েস সেটিংস"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="py-2">
          <h2 className="text-5xl sm:text-6xl font-bold font-japanese text-slate-900 mb-2">
            {currentQ.vocab.kanji}
          </h2>
          <p className="text-xl sm:text-2xl font-semibold font-japanese text-[#558b2f]">
            {currentQ.vocab.hiragana}
            <span className="text-xs text-slate-400 font-mono ml-2 font-normal">
              [{currentQ.vocab.romaji}]
            </span>
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 font-bengali">
          নিচের কোন বাংলা অর্থটি সঠিক? নির্বাচন করুন:
        </p>

        {/* 4 Multiple Choice Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correctAnswer;

            let buttonStyle = 'bg-white hover:bg-[#faf8f5] border-[#e2dcd0] text-slate-800';

            if (isAnswerSubmitted) {
              if (isCorrect) {
                buttonStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-400/20';
              } else {
                buttonStyle = 'bg-[#faf8f5] border-[#e8e2d4] text-slate-400 opacity-50';
              }
            } else if (isSelected) {
              buttonStyle = 'bg-[#f4f9ea] border-[#558b2f] text-slate-900 ring-2 ring-[#558b2f]/20 font-bold';
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
                        className="p-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                        title="বাংলা শুনুন"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </>
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button: Check Answer or Next Question */}
        <div className="pt-3">
          {!isAnswerSubmitted ? (
            <button
              id="btn-submit-answer"
              disabled={!selectedOption}
              onClick={handleSubmitAnswer}
              className={`w-full py-3.5 rounded-2xl font-bold font-bengali transition uppercase tracking-wider ${
                selectedOption
                  ? 'bg-[#558b2f] hover:bg-[#467326] text-white shadow-xs active:scale-95 cursor-pointer'
                  : 'bg-[#faf8f5] text-slate-400 border border-[#e2dcd0] cursor-not-allowed'
              }`}
            >
              উত্তর নিশ্চিত করুন (Submit)
            </button>
          ) : (
            <button
              id="btn-next-question"
              onClick={handleNextQuestion}
              className="w-full py-3.5 rounded-2xl bg-[#558b2f] hover:bg-[#467326] text-white font-bold font-bengali transition shadow-xs flex items-center justify-center gap-2 active:scale-95 uppercase tracking-wider"
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
