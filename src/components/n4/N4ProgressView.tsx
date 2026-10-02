import React from 'react';
import { 
  BarChart3, 
  Award, 
  Flame, 
  BookMarked, 
  RotateCcw, 
  Star, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { N4UserStats } from '../../data/n4/types';
import { N4_TOTAL_COUNT, N4_LESSONS_META, N4_VOCAB_BY_LESSON } from '../../data/n4';

interface N4ProgressViewProps {
  stats: N4UserStats;
  statusCounts: {
    total: number;
    newWords: number;
    learning: number;
    mastered: number;
    reviewDue: number;
    learned: number;
    percentMastered: number;
    percentLearned: number;
  };
  favoriteCount: number;
  onSetDailyGoal: (goal: number) => void;
  onResetProgress: () => void;
  onNavigateTab: (tab: any) => void;
}

export const N4ProgressView: React.FC<N4ProgressViewProps> = ({
  stats,
  statusCounts,
  favoriteCount,
  onSetDailyGoal,
  onResetProgress,
  onNavigateTab
}) => {
  const quizAccuracy = stats.totalQuizQuestions > 0 
    ? Math.round((stats.totalQuizCorrect / stats.totalQuizQuestions) * 100) 
    : 0;

  const studiedSet = new Set(stats.studiedWordIds);
  const masteredSet = new Set(stats.masteredWordIds);
  const dailyGoalPercent = Math.min(100, Math.round((stats.todayStudiedCount / (stats.dailyGoal || 1)) * 100));

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#fdf5f3] dark:bg-[#2c1514] text-[#c23b22] border border-[#f5c6cb] dark:border-[#4d2121]">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali">
              পড়াশোনার অগ্রগতি ও পরিসংখ্যান
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#737885] dark:text-[#8d97ab] font-bengali">
            আপনার JLPT N4 শব্দভাণ্ডারের সামগ্রিক অগ্রগতি এবং আয়ত্তের বিশ্লেষণ
          </p>
        </div>

        {/* Daily Goal Quick Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali">দৈনিক লক্ষ্য:</span>
          <div className="flex items-center gap-1 bg-[#f5f2eb] dark:bg-[#1a1e2a] p-1 rounded-2xl border border-[#e8e3d8] dark:border-[#222735]">
            {[10, 20, 30, 50].map((goal) => (
              <button
                key={goal}
                onClick={() => onSetDailyGoal(goal)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  stats.dailyGoal === goal
                    ? 'bg-[#c23b22] text-white shadow-xs'
                    : 'text-[#737885] dark:text-[#8d97ab] hover:text-[#191c21] dark:hover:text-[#f6f8fb]'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KEY METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali">স্ট্রিক দিন</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-500">
            {stats.streakDays}
          </div>
          <span className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali">ধারাবাহিক পড়া</span>
        </div>

        {/* Mastered */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali">আয়ত্তের হার</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {statusCounts.percentMastered}%
          </div>
          <span className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali">{statusCounts.mastered}টি শব্দ</span>
        </div>

        {/* Quiz Accuracy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali">কুইজ নির্ভুলতা</span>
            <HelpCircle className="w-4 h-4 text-[#c23b22]" />
          </div>
          <div className="text-3xl font-black font-mono text-[#c23b22]">
            {quizAccuracy}%
          </div>
          <span className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali">মোট {stats.totalQuizTaken}টি কুইজ</span>
        </div>

        {/* Bookmarks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali">সংরক্ষিত</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-3xl font-black font-mono text-[#b8860b] dark:text-[#d4af37]">
            {favoriteCount}
          </div>
          <span className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali">পছন্দের শব্দ</span>
        </div>

      </div>

      {/* LEARNING STAGES BREAKDOWN */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] space-y-4">
        <h3 className="text-lg font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali">
          শব্দভাণ্ডারের অবস্থা (Learning Stages)
        </h3>

        {/* Multi-segment progress bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735]">
          <div 
            style={{ width: `${(statusCounts.mastered / N4_TOTAL_COUNT) * 100}%` }} 
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`আয়ত্ত: ${statusCounts.mastered}`}
          />
          <div 
            style={{ width: `${(statusCounts.learning / N4_TOTAL_COUNT) * 100}%` }} 
            className="bg-[#c23b22] h-full transition-all duration-500"
            title={`শেখা হচ্ছে: ${statusCounts.learning}`}
          />
          <div 
            style={{ width: `${(statusCounts.newWords / N4_TOTAL_COUNT) * 100}%` }} 
            className="bg-[#e8e3d8] dark:bg-[#222735] h-full transition-all duration-500"
            title={`নতুন শব্দ: ${statusCounts.newWords}`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-bengali">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[#737885] dark:text-[#8d97ab]">
              আয়ত্ত: <strong>{statusCounts.mastered}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#c23b22] shrink-0" />
            <span className="text-[#737885] dark:text-[#8d97ab]">
              শেখা হচ্ছে: <strong>{statusCounts.learning}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#e8e3d8] dark:bg-[#222735] shrink-0" />
            <span className="text-[#737885] dark:text-[#8d97ab]">
              নতুন: <strong>{statusCounts.newWords}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* RESET PROGRESS CARD */}
      <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200 font-bengali">
            অগ্রগতি রিসেট করুন
          </h4>
          <p className="text-xs text-rose-700 dark:text-rose-300 font-bengali">
            আপনার সকল বুকমার্ক, স্ট্রিক ও পঠিত শব্দের তালিকা মুছে প্রথম থেকে শুরু করতে পারবেন।
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('আপনি কি নিশ্চিত যে আপনার N4 অগ্রগতি রিসেট করতে চান?')) {
              onResetProgress();
            }
          }}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs font-bengali transition cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
        >
          রিসেট করুন
        </button>
      </div>

    </div>
  );
};
