import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookMarked, 
  Layers, 
  ListFilter, 
  HelpCircle, 
  Flame, 
  Star, 
  BarChart3, 
  Volume2, 
  Sun, 
  Moon, 
  ChevronDown,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { N4ActiveTab } from '../../data/n4/types';

interface N4NavbarProps {
  currentTab: N4ActiveTab;
  onSelectTab: (tab: N4ActiveTab) => void;
  activeLevel: 'N4' | 'N5';
  onSwitchLevel: (level: 'N4' | 'N5') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenVoiceSettings: () => void;
  dueReviewCount?: number;
  favoriteCount?: number;
  streakDays?: number;
  todayStudiedCount?: number;
  dailyGoal?: number;
}

export const N4Navbar: React.FC<N4NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeLevel,
  onSwitchLevel,
  isDarkMode,
  onToggleDarkMode,
  onOpenVoiceSettings,
  dueReviewCount = 0,
  favoriteCount = 0,
  streakDays = 0,
  todayStudiedCount = 0,
  dailyGoal = 20,
}) => {
  const [showLevelMenu, setShowLevelMenu] = useState(false);

  const navItems: {
    id: N4ActiveTab;
    label: string;
    subLabel: string;
    icon: React.ReactNode;
    badge?: number;
    badgeVariant?: 'crimson' | 'gold' | 'emerald';
  }[] = [
    {
      id: 'dashboard',
      label: 'ড্যাশবোর্ড',
      subLabel: 'ホーム',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'lessons',
      label: 'লেসন সূচি',
      subLabel: '第26課〜50課',
      icon: <BookMarked className="w-4 h-4" />,
    },
    {
      id: 'flashcards',
      label: 'ফ্ল্যাশকার্ড',
      subLabel: 'フラッシュカード',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'grid',
      label: 'শব্দতালিকা',
      subLabel: '単語一覧',
      icon: <ListFilter className="w-4 h-4" />,
    },
    {
      id: 'quiz',
      label: 'কুইজ টেস্ট',
      subLabel: 'テスト',
      icon: <HelpCircle className="w-4 h-4" />,
    },
    {
      id: 'review',
      label: 'SRS রিভিউ',
      subLabel: '復習',
      icon: <Flame className="w-4 h-4" />,
      badge: dueReviewCount > 0 ? dueReviewCount : undefined,
      badgeVariant: 'crimson',
    },
    {
      id: 'favorites',
      label: 'সংরক্ষিত',
      subLabel: 'お気に入り',
      icon: <Star className="w-4 h-4" />,
      badge: favoriteCount > 0 ? favoriteCount : undefined,
      badgeVariant: 'gold',
    },
    {
      id: 'resources',
      label: 'রিসোর্স ও ব্যাকরণ',
      subLabel: '資料・文法',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'progress',
      label: 'পরিসংখ্যান',
      subLabel: '学習統計',
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#fbf9f5]/90 dark:bg-[#0d0f14]/90 backdrop-blur-xl border-b border-[#e8e3d8] dark:border-[#222735] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-2.5 pb-2">
        
        {/* TOP ROW: BRAND & QUICK CONTROLS */}
        <div className="flex items-center justify-between gap-3 mb-2">
          
          {/* Brand Logo & Level Selector */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div 
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              title="JLPT 日本語 GO"
            >
              {/* Refined Japanese Lacquer Hanko Seal (Vermilion with Gold Inset) */}
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#c23b22] dark:bg-[#e0452d] text-white flex items-center justify-center font-japanese font-black text-lg sm:text-xl shadow-xs ring-1 ring-[#c5a880]/30 group-hover:scale-105 active:scale-95 transition-transform duration-200 shrink-0">
                <span>四</span>
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-[#191c21] dark:bg-white text-[8px] sm:text-[9px] font-mono font-bold text-white dark:text-[#0d0f14] leading-none shadow-xs border border-white dark:border-[#0d0f14]">
                  {activeLevel}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-[#191c21] dark:text-[#f6f8fb] tracking-tight leading-tight">
                    <span className="font-japanese font-black">JLPT {activeLevel}</span>{' '}
                    <span className="font-bengali font-semibold text-sm sm:text-base text-[#191c21] dark:text-[#f6f8fb]">শব্দভাণ্ডার</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#8d97ab] border border-[#e8e3d8] dark:border-[#222735] font-mono">
                    Lesson 26–50 • 650+ শব্দ
                  </span>
                </div>
                <p className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali leading-none mt-0.5">
                  মিন্না নো নিহোঙ্গো ২য় খণ্ড • বিশুদ্ধ জাপানি উচ্চারণ
                </p>
              </div>
            </div>

            {/* Level Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLevelMenu(!showLevelMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#f5f2eb] hover:bg-[#ede8df] dark:bg-[#1a1e2a] dark:hover:bg-[#222738] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] transition cursor-pointer active:scale-95"
                title="লেভেল পরিবর্তন করুন (N5 / N4)"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#c23b22] dark:text-[#e0452d]" />
                <span className="font-bold">{activeLevel}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {showLevelMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowLevelMenu(false)} 
                  />
                  <div className="absolute left-0 mt-1.5 w-56 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-xl z-50 p-1.5 animate-fadeInScale">
                    <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#737885] dark:text-[#8d97ab] font-bengali">
                      লেভেল নির্বাচন করুন
                    </div>

                    <button
                      onClick={() => {
                        onSwitchLevel('N5');
                        setShowLevelMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition ${
                        activeLevel === 'N5' 
                          ? 'bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#191c21] dark:text-white font-bold' 
                          : 'text-[#474b54] dark:text-[#cbd3e1] hover:bg-[#f5f2eb]/60 dark:hover:bg-[#1a1e2a]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#c23b22] text-white font-bold text-xs flex items-center justify-center">N5</span>
                        <div>
                          <div className="font-semibold">JLPT N5 শব্দকোষ</div>
                          <div className="text-[10px] text-[#737885]">Lesson 1–25 • 670 শব্দ</div>
                        </div>
                      </div>
                      {activeLevel === 'N5' && <span className="text-[#c23b22] dark:text-[#e0452d] font-bold">✓</span>}
                    </button>

                    <button
                      onClick={() => {
                        onSwitchLevel('N4');
                        setShowLevelMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition ${
                        activeLevel === 'N4' 
                          ? 'bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#191c21] dark:text-white font-bold' 
                          : 'text-[#474b54] dark:text-[#cbd3e1] hover:bg-[#f5f2eb]/60 dark:hover:bg-[#1a1e2a]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#191c21] dark:bg-white text-white dark:text-[#0d0f14] font-bold text-xs flex items-center justify-center">N4</span>
                        <div>
                          <div className="font-semibold">JLPT N4 শব্দভাণ্ডার</div>
                          <div className="text-[10px] text-[#737885]">Lesson 26–50 • NEW</div>
                        </div>
                      </div>
                      {activeLevel === 'N4' && <span className="text-[#c23b22] dark:text-[#e0452d] font-bold">✓</span>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Action Controls: Daily Goal, Voice, Theme */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Daily Goal / Streak Minimal Indicator */}
            <button
              onClick={() => onSelectTab('progress')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#f5f2eb] hover:bg-[#ede8df] dark:bg-[#1a1e2a] dark:hover:bg-[#222738] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] text-xs font-semibold transition cursor-pointer active:scale-95"
              title="দৈনিক লক্ষ্য ও অগ্রগতি"
            >
              <Flame className="w-3.5 h-3.5 text-[#c23b22] dark:text-[#e0452d]" />
              <span className="font-mono font-bold tabular-nums">{todayStudiedCount}/{dailyGoal}</span>
              <span className="text-[#737885] dark:text-[#8d97ab] text-[10px] hidden sm:inline font-bengali">আজকে</span>
            </button>

            {/* Voice Audio Settings */}
            <button
              onClick={onOpenVoiceSettings}
              className="p-2 rounded-xl text-[#474b54] dark:text-[#cbd3e1] bg-[#f5f2eb] hover:bg-[#ede8df] dark:bg-[#1a1e2a] dark:hover:bg-[#222738] border border-[#e8e3d8] dark:border-[#222735] transition cursor-pointer active:scale-95"
              title="উচ্চারণ ও ভয়েস সেটিংস"
              aria-label="Voice Settings"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Dark/White Mode Switcher */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-[#474b54] dark:text-[#cbd3e1] bg-[#f5f2eb] hover:bg-[#ede8df] dark:bg-[#1a1e2a] dark:hover:bg-[#222738] border border-[#e8e3d8] dark:border-[#222735] transition cursor-pointer active:scale-95"
              title={isDarkMode ? 'লাইট মোড চালু করুন (Warm Ivory Mode)' : 'ডার্ক মোড চালু করুন (Deep Charcoal Mode)'}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-[#d4af37]" />
              ) : (
                <Moon className="w-4 h-4 text-[#474b54]" />
              )}
            </button>
          </div>
        </div>

        {/* BOTTOM ROW: CLEAN SEGMENTED NAVIGATION TABS */}
        <nav 
          aria-label="Study modes"
          className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none select-none -mx-1 px-1"
        >
          {navItems.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bengali transition-all duration-150 whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#191c21] dark:bg-white text-white dark:text-[#0d0f14] font-bold shadow-xs'
                    : 'text-[#474b54] dark:text-[#cbd3e1] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a]'
                }`}
              >
                <span className={isActive ? 'text-[#c5a880] dark:text-[#c23b22]' : 'text-[#737885] dark:text-[#8d97ab]'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                
                {tab.badge !== undefined && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                    isActive 
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black' 
                      : tab.badgeVariant === 'crimson'
                      ? 'bg-[#c23b22]/15 text-[#c23b22] dark:bg-[#e0452d]/25 dark:text-[#f0523a]'
                      : tab.badgeVariant === 'gold'
                      ? 'bg-[#c5a880]/20 text-[#966b1e] dark:bg-[#d4af37]/25 dark:text-[#e0be4d]'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
