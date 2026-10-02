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
  ArrowRightLeft,
  BookOpen
} from 'lucide-react';

export type N5ActiveTab = 
  | 'dashboard' 
  | 'lessons' 
  | 'flashcards' 
  | 'grid' 
  | 'quiz' 
  | 'review' 
  | 'favorites' 
  | 'progress' 
  | 'book' 
  | 'resources';

interface N5NavbarProps {
  currentTab: N5ActiveTab;
  onSelectTab: (tab: N5ActiveTab) => void;
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

export const N5Navbar: React.FC<N5NavbarProps> = ({
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
    id: N5ActiveTab;
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
      subLabel: '第1課〜25課',
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
      label: 'বুকমার্ক',
      subLabel: 'お気に入り',
      icon: <Star className="w-4 h-4" />,
      badge: favoriteCount > 0 ? favoriteCount : undefined,
      badgeVariant: 'gold',
    },
    {
      id: 'progress',
      label: 'অগ্রগতি',
      subLabel: '進捗',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'book',
      label: 'পিডিএফ বই',
      subLabel: 'PDF教材',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'resources',
      label: 'ব্যাকরণ',
      subLabel: '文法リソース',
      icon: <Sparkles className="w-4 h-4" />,
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0d0f14]/90 backdrop-blur-md border-b border-[#e8e3d8] dark:border-[#222735] transition-colors duration-200">
      
      {/* Top Bar: Brand, Level Switcher, Controls */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          
          {/* Brand & JLPT Level Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {/* Minimal Red Seal Icon */}
              <div className="w-9 h-9 rounded-xl bg-[#c23b22] text-white flex items-center justify-center font-japanese font-black text-sm shadow-sm shadow-[#c23b22]/30 shrink-0">
                語
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base sm:text-lg tracking-tight font-japanese text-[#191c21] dark:text-[#f6f8fb]">
                    JLPT <span className="text-[#c23b22]">VOCAB</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#fdf5f3] dark:bg-[#2c1514] text-[#c23b22] border border-[#f5c6cb] dark:border-[#4d2121]">
                    N5 & N4
                  </span>
                </div>
                <span className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali leading-none hidden sm:block">
                  জাপানি-বাংলা মিনিমালিস্ট শব্দভাণ্ডার
                </span>
              </div>
            </div>

            {/* Seamless Level Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setShowLevelMenu(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] hover:bg-[#ece7dc] dark:hover:bg-[#222735] text-xs font-bold font-mono text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] transition active:scale-95 cursor-pointer shadow-2xs"
                title="লেভেল পরিবর্তন করুন (JLPT Level Switcher)"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-[#c23b22] animate-pulse" />
                <span>JLPT {activeLevel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#737885] dark:text-[#8d97ab]" />
              </button>

              {showLevelMenu && (
                <div className="absolute top-full left-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#737885] dark:text-[#8d97ab]">
                    লেভেল নির্বাচন করুন
                  </div>
                  
                  <button
                    onClick={() => {
                      onSwitchLevel('N5');
                      setShowLevelMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeLevel === 'N5'
                        ? 'bg-[#fdf5f3] dark:bg-[#2c1514] text-[#c23b22]'
                        : 'text-[#191c21] dark:text-[#f6f8fb] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a]'
                    }`}
                  >
                    <span>JLPT N5 (লেসন ১–২৫)</span>
                    {activeLevel === 'N5' && <span className="text-[10px]">✓</span>}
                  </button>

                  <button
                    onClick={() => {
                      onSwitchLevel('N4');
                      setShowLevelMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeLevel === 'N4'
                        ? 'bg-[#fdf5f3] dark:bg-[#2c1514] text-[#c23b22]'
                        : 'text-[#191c21] dark:text-[#f6f8fb] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a]'
                    }`}
                  >
                    <span>JLPT N4 (লেসন ২৬–৫০)</span>
                    {activeLevel === 'N4' && <span className="text-[10px]">✓</span>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Controls: Streak, Audio settings, Theme toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Streak Counter Pill */}
            {streakDays > 0 && (
              <div 
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fdf5f3] dark:bg-[#2c1514] border border-[#f5c6cb] dark:border-[#4d2121] text-xs font-bold text-[#c23b22]"
                title={`${streakDays} দিন নিয়মিত অনুশীলন`}
              >
                <Flame className="w-3.5 h-3.5 fill-[#c23b22]" />
                <span className="font-mono">{streakDays}</span>
                <span className="text-[10px] font-bengali font-normal text-[#737885] dark:text-[#8d97ab]">দিন স্ট্রিক</span>
              </div>
            )}

            {/* Daily Goal Progress Indicator */}
            <div 
              className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] text-xs"
              title={`আজকের পড়া: ${todayStudiedCount} / ${dailyGoal}টি`}
            >
              <span className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali">আজকের পড়া:</span>
              <span className="font-mono font-bold text-[#191c21] dark:text-[#f6f8fb]">
                {todayStudiedCount}/{dailyGoal}
              </span>
            </div>

            {/* Voice Settings Button */}
            <button
              onClick={onOpenVoiceSettings}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] hover:bg-[#ece7dc] dark:hover:bg-[#222735] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] transition active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="ভয়েস ও উচ্চারণ সেটিংস"
            >
              <Volume2 className="w-4 h-4 text-[#c23b22]" />
              <span className="hidden sm:inline font-bengali">ভয়েস</span>
            </button>

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] hover:bg-[#ece7dc] dark:hover:bg-[#222735] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] transition active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title={isDarkMode ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-[#d4af37]" />
                  <span className="hidden sm:inline font-bengali">লাইট</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#191c21]" />
                  <span className="hidden sm:inline font-bengali">ডার্ক</span>
                </>
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Horizontal Tabs Bar */}
      <div className="border-t border-[#e8e3d8] dark:border-[#222735] bg-white/60 dark:bg-[#0d0f14]/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <nav className="flex items-center gap-1 py-1.5 min-w-max">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer active:scale-98 ${
                    isActive
                      ? 'bg-[#c23b22] text-white shadow-xs shadow-[#c23b22]/30'
                      : 'text-[#737885] dark:text-[#8d97ab] hover:text-[#191c21] dark:hover:text-[#f6f8fb] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a]'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-[#737885] dark:text-[#8d97ab]'}>
                    {item.icon}
                  </span>
                  
                  <span className="font-bengali leading-none">{item.label}</span>

                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white text-[#c23b22]'
                        : item.badgeVariant === 'crimson'
                        ? 'bg-[#fdf5f3] dark:bg-[#2c1514] text-[#c23b22] border border-[#f5c6cb] dark:border-[#4d2121]'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

    </header>
  );
};
