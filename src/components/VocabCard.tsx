import React from 'react';
import { 
  Volume2, 
  Check, 
  Bell, 
  RotateCcw, 
  RotateCw, 
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';
import { VocabWord } from '../vocabData';
import { speakJapanese } from '../utils/sound';

interface VocabCardProps {
  word: VocabWord;
  index: number;
  total: number;
  isFlipped: boolean;
  onFlip: () => void;
  isChecked: boolean;
  isReminder: boolean;
  isMemorized: boolean;
  onToggleChecked: () => void;
  onToggleReminder: () => void;
  onToggleMemorized: () => void;
  showReading: boolean;
}

export function getPosConfig(pos: string) {
  const p = pos.toLowerCase();
  if (p.includes('verb')) {
    return {
      topBorder: 'border-t-emerald-600 dark:border-t-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
      accentColor: '#16a34a',
    };
  }
  if (p.includes('adjective') || p.includes('adj') || p.includes('形容詞')) {
    return {
      topBorder: 'border-t-orange-500 dark:border-t-orange-400',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800',
      accentColor: '#ea580c',
    };
  }
  // Noun and others default to blue
  return {
    topBorder: 'border-t-blue-600 dark:border-t-blue-500',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800',
    accentColor: '#2563eb',
  };
}

export const VocabCard: React.FC<VocabCardProps> = ({
  word,
  index,
  total,
  isFlipped,
  onFlip,
  isChecked,
  isReminder,
  isMemorized,
  onToggleChecked,
  onToggleReminder,
  onToggleMemorized,
  showReading,
}) => {
  const posConfig = getPosConfig(word.partOfSpeech);

  const handleSpeech = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      speakJapanese(text, { rate: 0.85 });
    } catch (err) {
      console.warn('Speech error:', err);
    }
  };

  return (
    <div
      className="relative w-full h-[470px] cursor-pointer perspective-1200 outline-hidden select-none"
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-label={`${word.word} flashcard. Click to ${isFlipped ? 'show front' : 'flip to back'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onFlip();
        }
      }}
    >
      <div
        className="w-full h-full relative preserve-3d transition-transform duration-[550ms] ease-out will-change-transform"
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* =========================================================================
            CARD FRONT
            - White rounded card (border-radius 22px, 1px border, 6px top border colored by part of speech)
            - Top row: "Checked" toggle pill, "#3 / 120" counter, "Reminder" toggle pill
            - Center: colored part-of-speech tag, word in large Mincho, reading below in smaller grey text
            - Bottom: thin divider, left "Tap card to flip", right "Space / Flip"
           ========================================================================= */}
        <div
          className={`absolute inset-0 w-full h-full rounded-[22px] border border-[#e2e4e9] dark:border-[#2a2d36] bg-white dark:bg-[#1a1c23] shadow-md dark:shadow-xl flex flex-col justify-between p-5 backface-hidden border-t-[6px] ${posConfig.topBorder} transition-colors duration-200`}
          style={{
            pointerEvents: isFlipped ? 'none' : 'auto',
          }}
        >
          {/* Top Row: Checked Toggle Pill, Counter, Reminder Toggle Pill */}
          <div className="flex items-center justify-between gap-2">
            {/* Checked Toggle Pill */}
            <button
              type="button"
              aria-pressed={isChecked}
              onClick={(e) => {
                e.stopPropagation();
                onToggleChecked();
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-bengali transition-all duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white active:scale-95 ${
                isChecked
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'bg-[#f0f2f5] text-[#555a64] dark:bg-[#252830] dark:text-[#a0a6b5] hover:bg-[#e4e7ec] dark:hover:bg-[#303440] border border-[#e2e4e9] dark:border-[#323642]'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${isChecked ? 'stroke-[2.5]' : 'opacity-60'}`} />
              <span>Checked</span>
            </button>

            {/* Counter: "#3 / 120" */}
            <div className="text-xs font-mono font-bold tracking-tight text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 px-2.5 py-1 rounded-full border border-neutral-200/80 dark:border-neutral-700/80">
              #{index + 1} / {total}
            </div>

            {/* Reminder Toggle Pill */}
            <button
              type="button"
              aria-pressed={isReminder}
              onClick={(e) => {
                e.stopPropagation();
                onToggleReminder();
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-bengali transition-all duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white active:scale-95 ${
                isReminder
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'bg-[#f0f2f5] text-[#555a64] dark:bg-[#252830] dark:text-[#a0a6b5] hover:bg-[#e4e7ec] dark:hover:bg-[#303440] border border-[#e2e4e9] dark:border-[#323642]'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${isReminder ? 'fill-current' : 'opacity-60'}`} />
              <span>Reminder</span>
            </button>
          </div>

          {/* Center: Part-of-speech tag, word in Mincho, Reading below in grey */}
          <div className="my-auto text-center py-2 flex flex-col items-center justify-center">
            {/* Colored Part of Speech Tag */}
            <span
              className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold border mb-3 ${posConfig.badgeBg}`}
            >
              {word.partOfSpeech}
            </span>

            {/* Word in large Mincho serif font (Shippori Mincho) */}
            <h2 className="font-mincho text-5xl sm:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 select-text leading-tight my-1">
              {word.word}
            </h2>

            {/* Hiragana reading below in smaller grey text (controlled by global toggle) */}
            <div className="min-h-[28px] mt-1 flex items-center justify-center">
              {showReading ? (
                <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 font-mincho tracking-wide select-text">
                  {word.reading}
                </p>
              ) : (
                <span className="text-xs text-neutral-300 dark:text-neutral-600 font-mono tracking-widest">
                  [ reading hidden ]
                </span>
              )}
            </div>

            {/* Quick Audio Pronounce Button on Front */}
            <button
              type="button"
              onClick={(e) => handleSpeech(word.reading, e)}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-colors cursor-pointer active:scale-95"
              title="উচ্চারণ শুনুন"
            >
              <Volume2 className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              <span>Listen</span>
            </button>
          </div>

          {/* Bottom: Thin Divider, "Tap card to flip", "Space / Flip" */}
          <div className="pt-2">
            <div className="border-t border-[#e5e7eb] dark:border-[#2a2d36] w-full mb-3" />
            <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 font-medium">
              <span className="flex items-center gap-1.5 font-bengali">
                <RotateCw className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                <span>Tap card to flip</span>
              </span>
              <span className="font-mono text-[11px] flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                  Space
                </kbd>
                <span>/ Flip</span>
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CARD BACK
            - 3D flip (rotateY 180deg)
            - Scrollable content with a fixed bottom button "↻ Tap to return to front"
            - Header: small tile with first char, English meaning, category tag, colored POS tag
            - Action pills: Checked, Reminder, "Memorized?"
            - Reading box: reading in large text with romaji in brackets, "Listen" button
            - "MEANINGS (অর্থ ও অনুবাদ)" box: white inner box with label "বাংলা অর্থ", large bold Bangla meaning, English
            - "EXAMPLE (উদাহরণ)" box: JP sentence in Mincho + speaker button, Bangla bold, English grey
            - "WORD PROFILE (শব্দ পরিচিতি)" box: 2-column grid with Level and Type
           ========================================================================= */}
        <div
          className={`absolute inset-0 w-full h-full rounded-[22px] border border-[#e2e4e9] dark:border-[#2a2d36] bg-white dark:bg-[#1a1c23] shadow-md dark:shadow-xl flex flex-col justify-between overflow-hidden backface-hidden border-t-[6px] ${posConfig.topBorder} transition-colors duration-200`}
          style={{
            transform: 'rotateY(180deg)',
            pointerEvents: isFlipped ? 'auto' : 'none',
          }}
        >
          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-left scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
            
            {/* Header: First Char Tile, English Meaning, Category tag & Colored POS tag */}
            <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-[#e5e7eb] dark:border-[#2a2d36]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-mincho text-xl font-bold text-neutral-900 dark:text-neutral-100 shrink-0 shadow-2xs">
                  {word.word.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50 truncate leading-tight">
                    {word.englishMeaning}
                  </h3>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mincho truncate">
                    {word.word} • {word.reading}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                  {word.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${posConfig.badgeBg}`}>
                  {word.partOfSpeech}
                </span>
              </div>
            </div>

            {/* Action Pills Row: Checked, Reminder, "Memorized?" (toggle) */}
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              {/* Checked */}
              <button
                type="button"
                aria-pressed={isChecked}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleChecked();
                }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white active:scale-95 ${
                  isChecked
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'bg-[#f0f2f5] text-[#555a64] dark:bg-[#252830] dark:text-[#a0a6b5] hover:bg-[#e4e7ec] dark:hover:bg-[#303440] border border-[#e2e4e9] dark:border-[#323642]'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${isChecked ? 'stroke-[2.5]' : 'opacity-60'}`} />
                <span>Checked</span>
              </button>

              {/* Reminder */}
              <button
                type="button"
                aria-pressed={isReminder}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleReminder();
                }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white active:scale-95 ${
                  isReminder
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'bg-[#f0f2f5] text-[#555a64] dark:bg-[#252830] dark:text-[#a0a6b5] hover:bg-[#e4e7ec] dark:hover:bg-[#303440] border border-[#e2e4e9] dark:border-[#323642]'
                }`}
              >
                <Bell className={`w-3.5 h-3.5 ${isReminder ? 'fill-current' : 'opacity-60'}`} />
                <span>Reminder</span>
              </button>

              {/* Memorized? */}
              <button
                type="button"
                aria-pressed={isMemorized}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMemorized();
                }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white active:scale-95 ${
                  isMemorized
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white shadow-xs'
                    : 'bg-[#f0f2f5] text-[#555a64] dark:bg-[#252830] dark:text-[#a0a6b5] hover:bg-[#e4e7ec] dark:hover:bg-[#303440] border border-[#e2e4e9] dark:border-[#323642]'
                }`}
              >
                <Award className={`w-3.5 h-3.5 ${isMemorized ? 'fill-current' : 'opacity-60'}`} />
                <span>{isMemorized ? 'Memorized ✓' : 'Memorized?'}</span>
              </button>
            </div>

            {/* Reading Box: reading in large text with romaji in brackets and a "Listen" button */}
            <div className="bg-[#f8f9fb] dark:bg-[#14161c] rounded-xl p-3 border border-[#e5e7eb] dark:border-[#2a2d36] flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 block mb-0.5">
                  Reading (উচ্চারণ)
                </span>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-mincho text-2xl font-bold text-neutral-900 dark:text-neutral-100 select-text">
                    {word.reading}
                  </span>
                  <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400 select-text">
                    [{word.romaji}]
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleSpeech(word.reading, e)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-900 text-xs font-semibold transition active:scale-95 cursor-pointer shadow-xs shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen</span>
              </button>
            </div>

            {/* MEANINGS (অর্থ ও অনুবাদ) Box: white inner box with label "বাংলা অর্থ", large bold Bangla meaning, English */}
            <div className="bg-[#f8f9fb] dark:bg-[#14161c] rounded-xl p-3.5 border border-[#e5e7eb] dark:border-[#2a2d36] space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 block">
                MEANINGS (অর্থ ও অনুবাদ)
              </span>
              
              <div className="bg-white dark:bg-[#1c1e26] rounded-lg p-3 border border-[#e8eaee] dark:border-[#323642] shadow-2xs">
                <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 font-bengali block mb-1">
                  বাংলা অর্থ
                </span>
                <p className="font-bengali text-2xl font-bold text-neutral-900 dark:text-neutral-50 leading-snug select-text">
                  {word.banglaMeaning}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mt-1 select-text">
                  English: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{word.englishMeaning}</span>
                </p>
              </div>
            </div>

            {/* EXAMPLE (উদাহরণ) Box: JP sentence in Mincho with speaker, Bangla bold, English grey */}
            <div className="bg-[#f8f9fb] dark:bg-[#14161c] rounded-xl p-3.5 border border-[#e5e7eb] dark:border-[#2a2d36] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500">
                  EXAMPLE (উদাহরণ)
                </span>
                <button
                  type="button"
                  onClick={(e) => handleSpeech(word.example.jp, e)}
                  className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer"
                  title="উদাহরণ বাক্য শুনুন"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-white dark:bg-[#1c1e26] rounded-lg p-3 border border-[#e8eaee] dark:border-[#323642] space-y-1.5 shadow-2xs">
                {/* Japanese sentence in Mincho */}
                <p className="font-mincho text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 select-text leading-relaxed">
                  {word.example.jp}
                </p>
                {/* Bangla translation in bold */}
                <p className="font-bengali font-bold text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 select-text leading-normal">
                  {word.example.bangla}
                </p>
                {/* English translation in grey */}
                <p className="text-xs text-neutral-500 dark:text-neutral-400 select-text leading-normal">
                  {word.example.english}
                </p>
              </div>
            </div>

            {/* WORD PROFILE (শব্দ পরিচিতি) Box: 2-column grid with Level and Type */}
            <div className="bg-[#f8f9fb] dark:bg-[#14161c] rounded-xl p-3 border border-[#e5e7eb] dark:border-[#2a2d36]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 block mb-2">
                WORD PROFILE (শব্দ পরিচিতি)
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white dark:bg-[#1c1e26] p-2.5 rounded-lg border border-[#e8eaee] dark:border-[#323642]">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block font-mono">Level</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{word.level}</span>
                </div>
                <div className="bg-white dark:bg-[#1c1e26] p-2.5 rounded-lg border border-[#e8eaee] dark:border-[#323642]">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block font-mono">Type</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{word.partOfSpeech}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Fixed Bottom Button: "↻ Tap to return to front" */}
          <div className="p-3 border-t border-[#e5e7eb] dark:border-[#2a2d36] bg-white dark:bg-[#1a1c23]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFlip();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-900 font-semibold text-xs font-bengali flex items-center justify-center gap-1.5 transition active:scale-98 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>↻ Tap to return to front</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
