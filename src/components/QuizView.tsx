import React, { useState, useEffect, useCallback } from 'react';
import { 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Flame, 
  ArrowRight,
  Sliders,
  Turtle,
  Sparkles,
  HelpCircle,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VocabItem } from '../types';
import { 
  speakJapanese, 
  speakBangla,
  playSuccessChime, 
  playErrorSound, 
  playStreakChime 
} from '../utils/sound';
import { fisherYatesShuffle } from '../utils/shuffle';

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

  // Generate a fresh randomized quiz set with true uniform Fisher-Yates shuffle
  const generateQuiz = useCallback((count = 10) => {
    if (allVocab.length < 4) return;

    // Unbiased shuffle of full vocabulary list
    const shuffled: VocabItem[] = fisherYatesShuffle<VocabItem>(allVocab);
    const selectedVocabs = shuffled.slice(0, count);

    const generatedQuestions: QuizQuestion[] = selectedVocabs.map((vocab: VocabItem) => {
      const otherVocabs = allVocab.filter((v) => v.id !== vocab.id);
      const wrongShuffled: VocabItem[] = fisherYatesShuffle<VocabItem>(otherVocabs).slice(0, 3);
      const wrongOptions = wrongShuffled.map((v) => v.bn);

      const options: string[] = fisherYatesShuffle<string>([...wrongOptions, vocab.bn]);

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

  const handleSubmitAnswer = useCallback(() => {
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
  }, [selectedOption, isAnswerSubmitted, currentQ, streak, bestStreak]);

  const handleNextQuestion = useCallback(() => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
      // Trigger confetti on quiz completion
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [currentIdx, questions.length]);

  // Keyboard shortcut support (1-4 or A-D to select, Enter/Space to submit/next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (!isAnswerSubmitted && currentQ) {
        if (['1', 'a', 'A'].includes(e.key) && currentQ.options[0]) handleSelectOption(currentQ.options[0]);
        if (['2', 'b', 'B'].includes(e.key) && currentQ.options[1]) handleSelectOption(currentQ.options[1]);
        if (['3', 'c', 'C'].includes(e.key) && currentQ.options[2]) handleSelectOption(currentQ.options[2]);
        if (['4', 'd', 'D'].includes(e.key) && currentQ.options[3]) handleSelectOption(currentQ.options[3]);
        if ((e.key === 'Enter' || e.key === ' ') && selectedOption) {
          e.preventDefault();
          handleSubmitAnswer();
        }
      } else if (isAnswerSubmitted) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerSubmitted, currentQ, selectedOption, handleSubmitAnswer, handleNextQuestion]);

  if (questions.length === 0 || !currentQ) {
    return (
      <div className="text-center p-12 text-slate-500 font-bengali">
        কুইজ প্রস্তুত হচ্ছে...
      </div>
    );
  }

  // Quiz Finished Screen
  if (isQuizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div id="quiz-complete-screen" className="max-w-md mx-auto px-4 py-8 text-center animate-fadeInScale">
        <div className="bg-white dark:bg-[#141720] rounded-3xl p-8 border border-[#e8e3d8] dark:border-[#222735] shadow-[0_4px_20px_-4px_rgba(25,28,33,0.06)] dark:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.5)] space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#fdf5f3] dark:bg-[#2c1514] text-[#c23b22] flex items-center justify-center border border-[#f5c6cb] dark:border-[#4d2121]">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold font-bengali text-[#191c21] dark:text-[#f6f8fb] mb-1">
              কুইজ সম্পন্ন হয়েছে!
            </h2>
            <p className="text-[#737885] dark:text-[#8d97ab] font-bengali text-xs sm:text-sm">
              আপনার ১০টি প্রশ্নের অর্জিত ফলাফল
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="p-4 rounded-2xl bg-[#f5f2eb]/70 dark:bg-[#1a1e2a]/60 border border-[#e8e3d8] dark:border-[#222735]">
              <span className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali">সঠিক উত্তর</span>
              <p className="text-2xl font-black text-[#191c21] dark:text-[#f6f8fb] font-mono mt-0.5">
                {score} / {questions.length}
              </p>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{percentage}%</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f2eb]/70 dark:bg-[#1a1e2a]/60 border border-[#e8e3d8] dark:border-[#222735]">
              <span className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali">সেরা স্ট্রিক</span>
              <p className="text-2xl font-black text-[#b8860b] dark:text-[#d4af37] font-mono flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-5 h-5 fill-current" />
                {bestStreak}
              </p>
              <span className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali">টানা সঠিক</span>
            </div>
          </div>

          <button
            id="btn-quiz-retry"
            onClick={() => generateQuiz(totalQuizQuestions)}
            className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#c23b22] hover:bg-[#a8321d] text-white font-bold font-bengali shadow-md shadow-[#c23b22]/20 transition active:scale-95 cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>আবার কুইজ দিন (Play Again)</span>
          </button>
        </div>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D'];
  const progressPercent = Math.round(((currentIdx + 1) / questions.length) * 100);

  return (
    <div id="quiz-container" className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      
      {/* Quiz Progress Header */}
      <div className="bg-white dark:bg-[#141720] p-3.5 sm:p-4 rounded-3xl border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 font-bengali text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#191c21] dark:text-[#f6f8fb] font-mono font-bold border border-[#e8e3d8] dark:border-[#222735]">
              প্রশ্ন {currentIdx + 1} / {questions.length}
            </span>
            <span className="text-[#737885] dark:text-[#8d97ab]">
              স্কোর: <strong className="text-[#191c21] dark:text-[#f6f8fb] font-mono">{score}</strong>
            </span>
          </div>

          {streak > 1 && (
            <div className="flex items-center gap-1 text-xs font-bold text-[#c23b22] bg-[#fdf5f3] dark:bg-[#2c1514] px-2.5 py-1 rounded-xl border border-[#f5c6cb] dark:border-[#4d2121] font-mono">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streak} STREAK</span>
            </div>
          )}
        </div>

        {/* Linear progress track */}
        <div className="w-full h-1.5 bg-[#e8e3d8] dark:bg-[#222735] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#c23b22] to-[#b8860b] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-[#141720] rounded-3xl border border-[#e8e3d8] dark:border-[#222735] shadow-[0_4px_20px_-4px_rgba(25,28,33,0.06)] dark:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.5)] p-6 sm:p-8 mb-6 text-center space-y-4">
        
        <div className="flex items-center justify-between text-xs text-[#737885] dark:text-[#8d97ab] font-bengali">
          <span className="px-2.5 py-1 rounded-lg bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#8d97ab] text-xs font-bengali border border-[#e8e3d8] dark:border-[#222735]">
            {currentQ.vocab.category}
          </span>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => speakJapanese(currentQ.vocab.hiragana || currentQ.vocab.kanji, { slow: false })}
              className="flex items-center gap-1 min-h-[36px] px-3 py-1 rounded-xl bg-[#fdf5f3] dark:bg-[#2c1514] hover:bg-[#fae7e4] text-[#c23b22] border border-[#f5c6cb] dark:border-[#4d2121] font-semibold transition text-xs cursor-pointer"
              title="উচ্চারণ শুনুন"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>উচ্চারণ</span>
            </button>
            <button
              onClick={() => speakJapanese(currentQ.vocab.hiragana || currentQ.vocab.kanji, { slow: true })}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] hover:bg-[#ece7dc] dark:hover:bg-[#222735] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] transition cursor-pointer"
              title="ধীর উচ্চারণ (0.65x)"
            >
              <Turtle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Kanji & Hiragana */}
        <div className="py-2">
          <h2 className="text-5xl sm:text-6xl font-extrabold font-japanese text-[#191c21] dark:text-[#f6f8fb] mb-2 tracking-tight">
            {currentQ.vocab.kanji}
          </h2>
          <p className="text-xl sm:text-2xl font-bold font-japanese text-[#c23b22]">
            {currentQ.vocab.hiragana}
            <span className="text-xs text-[#b8860b] dark:text-[#d4af37] font-mono ml-2 font-normal">
              [{currentQ.vocab.romaji}]
            </span>
          </p>
        </div>

        <p className="text-xs sm:text-sm text-[#737885] dark:text-[#8d97ab] font-bengali">
          সঠিক বাংলা অর্থ কোনটি?
        </p>

        {/* 4 Multiple Choice Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-left">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correctAnswer;

            let buttonClasses = 'bg-white dark:bg-[#141720] hover:bg-[#fbf9f5] dark:hover:bg-[#1a1e2a] border-[#e8e3d8] dark:border-[#222735] text-[#191c21] dark:text-[#f6f8fb]';

            if (isAnswerSubmitted) {
              if (isCorrect) {
                buttonClasses = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20';
              } else if (isSelected && !isCorrect) {
                buttonClasses = 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-100 ring-2 ring-rose-400/20';
              } else {
                buttonClasses = 'bg-[#f5f2eb]/40 dark:bg-[#1a1e2a]/40 border-[#e8e3d8]/60 dark:border-[#222735]/60 text-[#737885] dark:text-[#8d97ab] opacity-40';
              }
            } else if (isSelected) {
              buttonClasses = 'bg-[#fdf5f3] dark:bg-[#2c1514] border-[#c23b22] text-[#c23b22] dark:text-[#ff9382] ring-2 ring-[#c23b22]/20 font-bold';
            }

            return (
              <button
                key={idx}
                disabled={isAnswerSubmitted}
                onClick={() => handleSelectOption(option)}
                className={`min-h-[50px] p-3.5 sm:p-4 rounded-2xl border font-bengali font-semibold text-sm transition-all flex items-center justify-between gap-2.5 active:scale-[0.99] cursor-pointer ${buttonClasses}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] font-mono text-xs flex items-center justify-center text-[#737885] dark:text-[#8d97ab] font-bold shrink-0">
                    {optionLetters[idx]}
                  </span>
                  <span>{option}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isAnswerSubmitted && isCorrect && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakBangla(option);
                        }}
                        className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
                        title="উচ্চারণ শুনুন"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
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
        <div className="pt-2">
          {!isAnswerSubmitted ? (
            <button
              id="btn-submit-answer"
              disabled={!selectedOption}
              onClick={handleSubmitAnswer}
              className={`w-full min-h-[46px] py-3.5 rounded-2xl font-bold font-bengali transition text-sm ${
                selectedOption
                  ? 'bg-[#c23b22] hover:bg-[#a8321d] text-white shadow-md shadow-[#c23b22]/20 active:scale-98 cursor-pointer'
                  : 'bg-[#e8e3d8] dark:bg-[#222735] text-[#737885] dark:text-[#8d97ab] cursor-not-allowed'
              }`}
            >
              উত্তর নিশ্চিত করুন (Submit)
            </button>
          ) : (
            <button
              id="btn-next-question"
              onClick={handleNextQuestion}
              className="w-full min-h-[46px] py-3.5 rounded-2xl bg-[#191c21] hover:bg-[#2a2f3a] dark:bg-[#f6f8fb] dark:hover:bg-white text-white dark:text-[#191c21] font-bold font-bengali transition shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer text-sm"
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
