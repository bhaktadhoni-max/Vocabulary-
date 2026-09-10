import React from 'react';
import { 
  BookOpen, 
  Layers, 
  HelpCircle, 
  FileText,
  Star, 
  BarChart2,
  Volume2
} from 'lucide-react';
import { StudyMode } from '../types';

interface NavbarProps {
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
  totalCount: number;
  masteredCount: number;
  bookmarkedCount: number;
  onOpenStats: () => void;
  onOpenVoiceSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  totalCount,
  masteredCount,
  bookmarkedCount,
  onOpenStats,
  onOpenVoiceSettings,
}) => {
  const percentMastered = Math.round((masteredCount / (totalCount || 1)) * 100);

  return (
    <header className="sticky top-0 z-40 bg-[#fbf8f2]/95 backdrop-blur-md border-b border-[#e8e2d4] shadow-xs">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 pb-3">
        {/* TOP BRAND ROW */}
        <div className="flex items-center justify-between gap-2 mb-3">
          
          {/* Brand: Green 五 Kanji badge & Titles */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none" 
            onClick={() => onSelectMode('flashcards')}
          >
            {/* Green rounded square with Kanji '五' (N5) */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#558b2f] flex items-center justify-center text-white shadow-xs font-japanese font-bold text-xl sm:text-2xl shrink-0">
              五
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight font-bengali">
                JLPT N5 শব্দভাণ্ডার
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-bengali leading-none mt-0.5">
                বাংলা অর্থ • উদাহরণ • ফুরিগানা সহ
              </p>
            </div>
          </div>

          {/* Right Action Hub: Voice, Bookmarks, Stats & Gold Pill Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Voice Settings Pill */}
            <button
              id="btn-voice-settings-navbar"
              onClick={onOpenVoiceSettings}
              className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-[#e5dec9] transition shadow-2xs"
              title="উচ্চারণ ও ভয়েস সেটিংস"
            >
              <Volume2 className="w-4 h-4 text-[#558b2f]" />
            </button>

            {/* Quick Star Bookmarks shortcut */}
            {bookmarkedCount > 0 && (
              <button
                id="btn-nav-bookmark-shortcut"
                onClick={() => onSelectMode('bookmarked')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition text-xs font-semibold ${
                  currentMode === 'bookmarked'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border border-[#e5dec9]'
                }`}
                title="সংরক্ষিত শব্দগুলো অনুশীলন করুন"
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="font-mono text-xs">{bookmarkedCount}</span>
              </button>
            )}

            {/* Stats shortcut */}
            <button
              id="btn-stats-modal"
              onClick={onOpenStats}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#e5dec9] transition text-xs font-medium shadow-2xs"
              title="অগ্রগতি ও পরিসংখ্যান"
            >
              <BarChart2 className="w-3.5 h-3.5 text-[#558b2f]" />
              <span className="font-mono font-bold text-xs">{percentMastered}%</span>
            </button>

            {/* Yellow / Amber Pill Badge: Total Words */}
            <div 
              className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#f6c445] text-[#78350f] font-bold text-xs font-bengali shadow-2xs whitespace-nowrap cursor-default"
              title={`${totalCount}টি শব্দ`}
            >
              {totalCount} শব্দ
            </div>
          </div>
        </div>

        {/* TOP MODE NAVIGATION CARDS (Screenshot match: 📖 শব্দতালিকা, 🎴 ফ্ল্যাশকার্ড, ✏️ কুইজ, 📑 বই) */}
        <nav className="grid grid-cols-4 gap-2 sm:gap-3">
          {/* Card 1: শব্দতালিকা (ことば) */}
          <button
            id="tab-list"
            onClick={() => onSelectMode('list')}
            className={`flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 sm:px-2 rounded-2xl transition-all ${
              currentMode === 'list'
                ? 'bg-[#f4f9ea] border-2 border-[#558b2f] text-slate-900 shadow-xs'
                : 'bg-white hover:bg-slate-50/80 border border-[#e8e2d4] text-slate-700'
            }`}
          >
            <span className="text-xs sm:text-sm font-bold font-bengali flex items-center gap-1">
              <span>📖</span>
              <span>শব্দতালিকা</span>
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-japanese mt-0.5 font-normal">
              ことば
            </span>
          </button>

          {/* Card 2: ফ্ল্যাশকার্ড (カード) */}
          <button
            id="tab-flashcards"
            onClick={() => onSelectMode('flashcards')}
            className={`flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 sm:px-2 rounded-2xl transition-all ${
              currentMode === 'flashcards'
                ? 'bg-[#f4f9ea] border-2 border-[#558b2f] text-slate-900 shadow-xs'
                : 'bg-white hover:bg-slate-50/80 border border-[#e8e2d4] text-slate-700'
            }`}
          >
            <span className="text-xs sm:text-sm font-bold font-bengali flex items-center gap-1">
              <span>🎴</span>
              <span>ফ্ল্যাশকার্ড</span>
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-japanese mt-0.5 font-normal">
              カード
            </span>
          </button>

          {/* Card 3: কুইজ (クイズ) */}
          <button
            id="tab-quiz"
            onClick={() => onSelectMode('quiz')}
            className={`flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 sm:px-2 rounded-2xl transition-all ${
              currentMode === 'quiz'
                ? 'bg-[#f4f9ea] border-2 border-[#558b2f] text-slate-900 shadow-xs'
                : 'bg-white hover:bg-slate-50/80 border border-[#e8e2d4] text-slate-700'
            }`}
          >
            <span className="text-xs sm:text-sm font-bold font-bengali flex items-center gap-1">
              <span>✏️</span>
              <span>কুইজ</span>
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-japanese mt-0.5 font-normal">
              クイズ
            </span>
          </button>

          {/* Card 4: পিডিএফ বই (PDF / 本) */}
          <button
            id="tab-book"
            onClick={() => onSelectMode('book')}
            className={`flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 sm:px-2 rounded-2xl transition-all ${
              currentMode === 'book'
                ? 'bg-[#f4f9ea] border-2 border-[#558b2f] text-slate-900 shadow-xs'
                : 'bg-white hover:bg-slate-50/80 border border-[#e8e2d4] text-slate-700'
            }`}
          >
            <span className="text-xs sm:text-sm font-bold font-bengali flex items-center gap-1">
              <span>📕</span>
              <span>বই / PDF</span>
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-japanese mt-0.5 font-normal">
              本 / ダウンロード
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};



