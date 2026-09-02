import React from 'react';
import { 
  Layers, 
  List, 
  HelpCircle, 
  Star, 
  BarChart2,
  Volume2,
  BookOpen,
  Download
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
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-2xl border-b border-slate-800/80 shadow-xl shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Brand Logo & Tag */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group" 
            onClick={() => onSelectMode('flashcards')}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-600/25 font-japanese font-bold text-xl ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-300">
              語
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  JLPT N5
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                  {totalCount} Words
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight font-bengali">
                জাপানি শব্দভাণ্ডার ও ফ্লিপকার্ড
              </h1>
            </div>
          </div>

          {/* Center Segmented Mode Switcher (Apple / macOS styled pill) */}
          <nav className="flex items-center p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
            <button
              id="tab-flashcards"
              onClick={() => onSelectMode('flashcards')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all font-bengali ${
                currentMode === 'flashcards'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40 border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>ফ্লিপকার্ড</span>
            </button>

            <button
              id="tab-list"
              onClick={() => onSelectMode('list')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all font-bengali ${
                currentMode === 'list'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40 border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <List className="w-4 h-4 text-indigo-400" />
              <span>শব্দকোষ</span>
            </button>

            <button
              id="tab-quiz"
              onClick={() => onSelectMode('quiz')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all font-bengali ${
                currentMode === 'quiz'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40 border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-pink-400" />
              <span>কুইজ</span>
            </button>

            <button
              id="tab-book"
              onClick={() => onSelectMode('book')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all font-bengali ${
                currentMode === 'book'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40 border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>পিডিএফ বই</span>
            </button>
          </nav>

          {/* Right Action Hub: Mastery Stats, Voice Settings & Bookmarks */}
          <div className="flex items-center gap-2">
            
            {/* Quick PDF Book Shortcut (visible on md screens) */}
            <button
              id="btn-nav-pdf-shortcut"
              onClick={() => onSelectMode('book')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl transition text-xs font-semibold font-bengali ${
                currentMode === 'book'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md'
                  : 'bg-slate-900/90 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-300 border border-slate-800/80'
              }`}
              title="সম্পূর্ণ শব্দকোষ PDF বই ডাউনলোড ও অধ্যয়ন"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>PDF ডাউনলোড</span>
            </button>
            
            {/* Audio Voice Settings Pill */}
            <button
              id="btn-voice-settings-navbar"
              onClick={onOpenVoiceSettings}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-800/80 hover:border-cyan-500/30 transition shadow-xs flex items-center gap-1.5"
              title="ভয়েস ও উচ্চারণ সেটিংস"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span className="hidden xl:inline font-bengali text-xs">ভয়েস</span>
            </button>

            {/* Quick Star Bookmarks shortcut */}
            {bookmarkedCount > 0 && (
              <button
                id="btn-nav-bookmark-shortcut"
                onClick={() => onSelectMode('bookmarked')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl transition text-xs font-semibold ${
                  currentMode === 'bookmarked'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md'
                    : 'bg-slate-900/90 hover:bg-amber-500/10 text-slate-300 hover:text-amber-300 border border-slate-800/80'
                }`}
                title="সংরক্ষিত শব্দগুলো অনুশীলন করুন"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-mono text-xs">{bookmarkedCount}</span>
              </button>
            )}

            {/* Mastery Progress Badge / Open Stats Modal */}
            <button
              id="btn-stats-modal"
              onClick={onOpenStats}
              className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700 transition text-xs font-medium shadow-xs"
              title="অগ্রগতি ও পরিসংখ্যান"
            >
              <div className="relative flex items-center justify-center w-5 h-5">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="font-bold text-emerald-400 text-xs">{percentMastered}%</span>
                <span className="text-slate-500 text-[11px] hidden sm:inline font-sans">শেখা শেষ</span>
              </div>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};


