import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  HelpCircle, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  Award, 
  BookMarked,
  Layers,
  Star,
  Headphones,
  Eye,
  Shuffle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { N4VocabItem, N4QuizMode } from '../../data/n4/types';
import { N4_ALL_VOCABULARY, N4_TOTAL_COUNT, N4_VOCAB_BY_LESSON } from '../../data/n4';
import { speakJapanese, stopAllSpeech, playAudioFX } from '../../utils/sound';

interface N4QuizViewProps {
  favoriteIds: Set<number>;
  onToggleFavorite: (id: number) => void;
  onRecordResult: (correctCount: number, totalQuestions: number) => void;
  initialLesson?: number | 'all';
}

interface Question {
  vocab: N4VocabItem;
  prompt: string;
  subPrompt?: string;
  audioPrompt?: string;
  options: {
    id: string;
    text: string;
    subText?: string;
  }[];
  correctAnswerText: string;
}

export const N4QuizView: React.FC<N4QuizViewProps> = ({
  favoriteIds,
  onToggleFavorite,
  onRecordResult,
  initialLesson = 'all'
}) => {
  const [quizMode, setQuizMode] = useState<N4QuizMode>('jp_to_bn');
  const [selectedLesson, setSelectedLesson] = useState<number | 'all'>(initialLesson);
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [missedItems, setMissedItems] = useState<N4VocabItem[]>([]);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Eligible vocabulary based on lesson filter
  const eligibleVocab = useMemo(() => {
    if (selectedLesson === 'all') {
      return N4_ALL_VOCABULARY;
    }
    return N4_VOCAB_BY_LESSON[selectedLesson] || N4_ALL_VOCABULARY;
  }, [selectedLesson]);

  // Start Quiz generator
  const startQuiz = useCallback(() => {
    if (eligibleVocab.length < 4) return;

    // Shuffle and pick subset
    const shuffled = [...eligibleVocab].sort(() => Math.random() - 0.5);
    const selectedVocab = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    // Generate questions based on quizMode
    const generatedQuestions: Question[] = selectedVocab.map((target) => {
      // Pick 3 random distractor items
      const distractors = eligibleVocab
        .filter(v => v.id !== target.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const allFour = [target, ...distractors].sort(() => Math.random() - 0.5);

      if (quizMode === 'bn_to_jp') {
        // Prompt is Bengali, options are Japanese Kanji/Furigana
        return {
          vocab: target,
          prompt: target.meaningBn,
          subPrompt: `L${target.lesson} • ${target.categoryKey}`,
          options: allFour.map(item => ({
            id: item.id.toString(),
            text: item.kanji || item.furigana,
            subText: item.furigana !== item.kanji ? item.furigana : item.romaji
          })),
          correctAnswerText: target.kanji || target.furigana
        };
      } else if (quizMode === 'listening') {
        // Prompt is Audio, options are Bengali meanings
        return {
          vocab: target,
          prompt: '🔊 উচ্চারণ শুনে অর্থ বাছাই করুন',
          subPrompt: 'Audio Listening Practice',
          audioPrompt: target.furigana || target.kanji,
          options: allFour.map(item => ({
            id: item.id.toString(),
            text: item.meaningBn,
            subText: item.romaji
          })),
          correctAnswerText: target.meaningBn
        };
      } else if (quizMode === 'reading_recognition') {
        // Prompt is Kanji, options are Furigana/Hiragana
        return {
          vocab: target,
          prompt: target.kanji,
          subPrompt: target.meaningBn,
          options: allFour.map(item => ({
            id: item.id.toString(),
            text: item.furigana,
            subText: item.romaji
          })),
          correctAnswerText: target.furigana
        };
      } else {
        // Default: jp_to_bn & multiple_choice
        return {
          vocab: target,
          prompt: target.kanji || target.furigana,
          subPrompt: target.kanji ? `${target.furigana} [${target.romaji}]` : target.romaji,
          audioPrompt: target.furigana || target.kanji,
          options: allFour.map(item => ({
            id: item.id.toString(),
            text: item.meaningBn,
            subText: item.exampleBn ? item.exampleBn.slice(0, 24) + '...' : undefined
          })),
          correctAnswerText: target.meaningBn
        };
      }
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setMissedItems([]);
    setQuizFinished(false);
    setQuizStarted(true);

    // Auto-play audio on listening mode
    if (quizMode === 'listening' && generatedQuestions[0]?.audioPrompt) {
      setTimeout(() => {
        speakJapanese(generatedQuestions[0].audioPrompt!);
      }, 300);
    }
  }, [eligibleVocab, questionCount, quizMode]);

  const currentQ = questions[currentIndex];

  // Auto-speak listening mode on question advance
  useEffect(() => {
    if (quizStarted && !quizFinished && quizMode === 'listening' && currentQ?.audioPrompt) {
      const timer = setTimeout(() => {
        speakJapanese(currentQ.audioPrompt!);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, quizStarted, quizFinished, quizMode, currentQ]);

  // Handle Option Select
  const handleSelectOption = (optionText: string) => {
    if (isAnswerSubmitted || !currentQ) return;

    setSelectedOption(optionText);
    setIsAnswerSubmitted(true);

    const isCorrect = optionText === currentQ.correctAnswerText;

    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
      playAudioFX('correct');
    } else {
      setMissedItems(prev => [...prev, currentQ.vocab]);
      playAudioFX('incorrect');
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz Finished!
      setQuizFinished(true);
      const finalScore = correctAnswersCount + (selectedOption === currentQ?.correctAnswerText ? 1 : 0);
      onRecordResult(finalScore, questions.length);

      // Confetti celebration if score >= 70%
      if (finalScore / questions.length >= 0.7) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  // ================= START SCREEN =================
  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_4px_20px_-4px_rgba(25,28,33,0.06)] dark:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.5)] text-center">
          
          <div className="w-14 h-14 rounded-2xl bg-[#fdf5f3] dark:bg-[#2c1514] text-[#c23b22] mx-auto flex items-center justify-center mb-4 border border-[#f5c6cb] dark:border-[#4d2121]">
            <HelpCircle className="w-7 h-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali mb-2">
            JLPT N4 অনুশীলন ও কুইজ
          </h1>

          <p className="text-xs sm:text-sm text-[#737885] dark:text-[#8d97ab] font-bengali max-w-md mx-auto mb-6">
            বিভিন্ন পদ্ধতিতে আপনার শব্দার্থের প্রস্তুতি যাচাই করুন ও দুর্বল বিষয়গুলো চিহ্নিত করুন
          </p>

          {/* Mode Selection */}
          <div className="text-left mb-6">
            <label className="block text-xs font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali mb-2">
              অনুশীলন পদ্ধতি নির্বাচন করুন:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'jp_to_bn', label: 'জাপানি → বাংলা অর্থ', desc: 'কাঞ্জি দেখে বাংলা অর্থ নির্বাচন', icon: <Eye className="w-4 h-4 text-[#c23b22]" /> },
                { id: 'bn_to_jp', label: 'বাংলা → জাপানি শব্দ', desc: 'বাংলা দেখে জাপানি কাঞ্জি নির্বাচন', icon: <BookMarked className="w-4 h-4 text-[#b8860b]" /> },
                { id: 'multiple_choice', label: 'মিক্সড মাল্টিপল চয়েস', desc: 'মিশ্র ধারার ৪-বিকল্পের কুইজ', icon: <Shuffle className="w-4 h-4 text-[#c23b22]" /> },
                { id: 'listening', label: 'লিসেনিং কুইজ (Listening)', desc: 'উচ্চারণ শুনে সঠিক অর্থ নির্ণয়', icon: <Headphones className="w-4 h-4 text-[#b8860b]" /> },
                { id: 'reading_recognition', label: 'রিডিং রিকগনিশন (Furigana)', desc: 'কাঞ্জির সঠিক হিরাগানা পাঠ যাচাই', icon: <Sparkles className="w-4 h-4 text-[#d4af37]" /> },
                { id: 'flashcard_review', label: 'র‍্যাপিড প্র্যাকটিস', desc: 'দ্রুত প্রশ্নোত্তর সেশন', icon: <Layers className="w-4 h-4 text-emerald-500" /> },
              ].map(m => (
                <div
                  key={m.id}
                  onClick={() => setQuizMode(m.id as N4QuizMode)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                    quizMode === m.id
                      ? 'bg-[#fdf5f3] dark:bg-[#2c1514] border-[#c23b22] ring-2 ring-[#c23b22]/20 font-bold'
                      : 'bg-[#fbf9f5] dark:bg-[#1a1e2a]/50 border-[#e8e3d8] dark:border-[#222735] hover:border-[#c23b22]/40'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-[#141720] shadow-2xs shrink-0 border border-[#e8e3d8]/80 dark:border-[#222735]">
                    {m.icon}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali">
                      {m.label}
                    </div>
                    <div className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali mt-0.5">
                      {m.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lesson & Count Selection */}
          <div className="grid grid-cols-2 gap-3 text-left mb-6">
            <div>
              <label className="block text-xs font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali mb-1.5">
                লেসন সিলেক্ট করুন:
              </label>
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full text-xs font-semibold rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] p-2.5 text-[#191c21] dark:text-[#f6f8fb] font-bengali focus:outline-hidden"
              >
                <option value="all">সকল N4 লেসন (26–50)</option>
                {Array.from({ length: 25 }, (_, i) => i + 26).map(l => (
                  <option key={l} value={l}>লেসন {l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali mb-1.5">
                প্রশ্নের সংখ্যা:
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full text-xs font-semibold rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] p-2.5 text-[#191c21] dark:text-[#f6f8fb] font-bengali focus:outline-hidden"
              >
                <option value={10}>১০টি প্রশ্ন</option>
                <option value={15}>১৫টি প্রশ্ন</option>
                <option value={20}>২০টি প্রশ্ন</option>
                <option value={30}>৩০টি প্রশ্ন</option>
              </select>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startQuiz}
            className="w-full py-3.5 rounded-2xl bg-[#c23b22] hover:bg-[#a8321d] active:scale-[0.98] text-white font-bold text-sm font-bengali shadow-md shadow-[#c23b22]/20 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>কুইজ শুরু করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>
    );
  }

  // ================= END SUMMARY SCREEN =================
  if (quizFinished) {
    const accuracy = Math.round((correctAnswersCount / (questions.length || 1)) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_4px_20px_-4px_rgba(25,28,33,0.06)] dark:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.5)] text-center">
          
          <div className="inline-flex p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-3">
            <Award className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali mb-1">
            কুইজ সম্পন্ন হয়েছে!
          </h2>

          <p className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali mb-6">
            আপনার ফলাফল নিচে প্রদর্শিত হলো
          </p>

          {/* Score Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-[#f5f2eb]/70 dark:bg-[#1a1e2a]/60 border border-[#e8e3d8] dark:border-[#222735]">
              <div className="text-xs font-semibold text-[#737885] dark:text-[#8d97ab] font-bengali mb-1">সঠিক উত্তর</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
                {correctAnswersCount}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f2eb]/70 dark:bg-[#1a1e2a]/60 border border-[#e8e3d8] dark:border-[#222735]">
              <div className="text-xs font-semibold text-[#737885] dark:text-[#8d97ab] font-bengali mb-1">ভুল উত্তর</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-rose-500">
                {questions.length - correctAnswersCount}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f2eb]/70 dark:bg-[#1a1e2a]/60 border border-[#e8e3d8] dark:border-[#222735]">
              <div className="text-xs font-semibold text-[#737885] dark:text-[#8d97ab] font-bengali mb-1">সঠিকতার হার</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#c23b22]">
                {accuracy}%
              </div>
            </div>
          </div>

          {/* Retake & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={startQuiz}
              className="w-full py-3 rounded-2xl bg-[#c23b22] hover:bg-[#a8321d] text-white font-bold text-xs sm:text-sm font-bengali transition cursor-pointer shadow-xs"
            >
              পুনরায় কুইজ দিন
            </button>
            <button
              onClick={() => setQuizStarted(false)}
              className="w-full py-3 rounded-2xl bg-[#f5f2eb] hover:bg-[#ece7dc] dark:bg-[#1a1e2a] dark:hover:bg-[#222735] text-[#191c21] dark:text-[#f6f8fb] font-bold text-xs sm:text-sm font-bengali transition cursor-pointer border border-[#e8e3d8] dark:border-[#222735]"
            >
              মোড পরিবর্তন করুন
            </button>
          </div>

        </div>

        {/* Missed Words to Review */}
        {missedItems.length > 0 && (
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#141720] border border-rose-200/60 dark:border-rose-900/40 shadow-xs">
            <h3 className="text-base font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali mb-1 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              <span>পুনঃঅনুশীলনের শব্দসমূহ ({missedItems.length}টি)</span>
            </h3>
            <p className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali mb-4">
              যে শব্দগুলোতে ভুল হয়েছে, সেগুলো মনোযোগ দিয়ে দেখে নিন
            </p>

            <div className="space-y-2.5">
              {missedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold font-japanese text-[#191c21] dark:text-[#f6f8fb]">
                        {item.kanji || item.furigana}
                      </span>
                      <span className="text-xs text-[#c23b22] font-japanese">
                        ({item.furigana})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#f5f2eb] dark:bg-[#1a1e2a] font-mono">
                        L{item.lesson}
                      </span>
                    </div>
                    <div className="text-xs font-bengali text-[#737885] dark:text-[#8d97ab] mt-0.5">
                      {item.meaningBn}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => speakJapanese(item.kanji || item.furigana)}
                      className="p-2 rounded-xl bg-white dark:bg-[#141720] text-[#737885] hover:text-[#c23b22] shadow-2xs cursor-pointer border border-[#e8e3d8] dark:border-[#222735]"
                      title="উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className={`p-2 rounded-xl bg-white dark:bg-[#141720] transition cursor-pointer border border-[#e8e3d8] dark:border-[#222735] ${
                        favoriteIds.has(item.id) ? 'text-amber-500' : 'text-[#737885] hover:text-amber-500'
                      }`}
                      title="সংরক্ষণ করুন"
                    >
                      <Star className={`w-4 h-4 ${favoriteIds.has(item.id) ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  }

  // ================= ACTIVE QUESTION SCREEN =================
  if (!currentQ) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-200">
      
      {/* Progress & Header Row */}
      <div className="flex items-center justify-between text-xs px-2">
        <span className="font-mono font-bold text-[#737885] dark:text-[#8d97ab]">
          প্রশ্ন {currentIndex + 1} / {questions.length}
        </span>
        <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-[#fdf5f3] dark:bg-[#2c1514] text-[#c23b22] border border-[#f5c6cb] dark:border-[#4d2121]">
          Lesson {currentQ.vocab.lesson}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#f5f2eb] dark:bg-[#1a1e2a] rounded-full h-2 overflow-hidden border border-[#e8e3d8]/80 dark:border-[#222735]/80">
        <div
          className="h-full bg-gradient-to-r from-[#c23b22] to-[#b8860b] transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* QUESTION CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_4px_20px_-4px_rgba(25,28,33,0.06)] dark:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.5)] text-center">
        
        {/* Furigana or Sub-prompt */}
        {currentQ.subPrompt && (
          <div className="text-xs sm:text-sm font-medium font-japanese text-[#737885] dark:text-[#8d97ab] mb-1">
            {currentQ.subPrompt}
          </div>
        )}

        {/* Main Prompt */}
        <h2 className="text-3xl sm:text-5xl font-black font-japanese text-[#191c21] dark:text-[#f6f8fb] tracking-tight leading-tight my-2">
          {currentQ.prompt}
        </h2>

        {/* Audio Listen Button for Listening mode or help */}
        {(currentQ.audioPrompt || quizMode === 'listening') && (
          <button
            onClick={() => speakJapanese(currentQ.audioPrompt || currentQ.vocab.kanji)}
            className="mt-3 px-4 py-2 rounded-2xl bg-[#fdf5f3] hover:bg-[#fae7e4] dark:bg-[#2c1514] dark:hover:bg-[#3d1c1c] text-[#c23b22] text-xs font-bold font-bengali inline-flex items-center gap-2 cursor-pointer shadow-xs transition border border-[#f5c6cb] dark:border-[#4d2121]"
          >
            <Volume2 className="w-4 h-4" />
            <span>উচ্চারণ শুনুন</span>
          </button>
        )}

      </div>

      {/* 4 CHOICES */}
      <div className="grid grid-cols-1 gap-2.5">
        {currentQ.options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          const isSelected = selectedOption === opt.text;
          const isCorrectAnswer = opt.text === currentQ.correctAnswerText;

          let optionStyle = 'bg-white dark:bg-[#141720] border-[#e8e3d8] dark:border-[#222735] text-[#191c21] dark:text-[#f6f8fb] hover:border-[#c23b22]/50';

          if (isAnswerSubmitted) {
            if (isCorrectAnswer) {
              optionStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20';
            } else if (isSelected && !isCorrectAnswer) {
              optionStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/20';
            } else {
              optionStyle = 'opacity-40 bg-[#f5f2eb] dark:bg-[#141720] border-[#e8e3d8] dark:border-[#222735] text-[#737885] dark:text-[#8d97ab]';
            }
          }

          return (
            <button
              key={opt.id}
              disabled={isAnswerSubmitted}
              onClick={() => handleSelectOption(opt.text)}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${optionStyle} ${
                !isAnswerSubmitted ? 'hover:scale-[1.01] active:scale-[0.99]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-xl font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                  isAnswerSubmitted && isCorrectAnswer
                    ? 'bg-emerald-600 text-white'
                    : isAnswerSubmitted && isSelected && !isCorrectAnswer
                    ? 'bg-rose-600 text-white'
                    : 'bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#8d97ab]'
                }`}>
                  {letter}
                </span>

                <div>
                  <div className="font-bold text-sm sm:text-base font-bengali text-[#191c21] dark:text-[#f6f8fb]">
                    {opt.text}
                  </div>
                  {opt.subText && (
                    <div className="text-xs text-[#737885] dark:text-[#8d97ab] font-japanese mt-0.5">
                      {opt.subText}
                    </div>
                  )}
                </div>
              </div>

              {isAnswerSubmitted && isCorrectAnswer && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {isAnswerSubmitted && isSelected && !isCorrectAnswer && (
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* FOOTER ACTION ONCE ANSWERED */}
      {isAnswerSubmitted && (
        <div className="pt-2 animate-in fade-in duration-200">
          <button
            onClick={handleNextQuestion}
            className="w-full py-3.5 rounded-2xl bg-[#c23b22] hover:bg-[#a8321d] text-white font-bold text-sm font-bengali transition cursor-pointer shadow-md shadow-[#c23b22]/20 flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{currentIndex + 1 === questions.length ? "ফলাফল দেখুন" : "পরবর্তী প্রশ্ন →"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
