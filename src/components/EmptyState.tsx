import React from 'react';
import { RotateCcw, SearchX, BookmarkX, BookOpen } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'bookmarks' | 'mastered' | 'category' | 'general';
  searchQuery?: string;
  onResetFilters: () => void;
  onRestoreAll?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  searchQuery,
  onResetFilters,
  onRestoreAll
}) => {
  const getIcon = () => {
    switch (type) {
      case 'bookmarks':
        return <BookmarkX className="w-12 h-12 text-amber-500 stroke-[1.5]" />;
      case 'search':
        return <SearchX className="w-12 h-12 text-slate-400 stroke-[1.5]" />;
      case 'mastered':
        return <BookOpen className="w-12 h-12 text-emerald-500 stroke-[1.5]" />;
      default:
        return <SearchX className="w-12 h-12 text-slate-400 stroke-[1.5]" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'bookmarks':
        return 'কোনো সংরক্ষিত শব্দ নেই (No Bookmarks)';
      case 'mastered':
        return 'এখনও কোনো শব্দ আয়ত্ত করা হয়নি (No Learned Words)';
      case 'category':
        return 'এই বিভাগে কোনো শব্দ পাওয়া যায়নি';
      case 'search':
        return searchQuery
          ? `"${searchQuery}" এর জন্য কোনো শব্দ মেলেনি`
          : 'কোনো ফলাফল পাওয়া যায়নি';
      default:
        return 'কোনো শব্দ পাওয়া যায়নি (Empty State)';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'bookmarks':
        return 'ফ্লিপকার্ড বা শব্দতালিকায় তারা (⭐️) আইকনে ক্লিক করে প্রয়োজনীয় শব্দগুলো বুকমার্ক করে রাখতে পারেন।';
      case 'mastered':
        return 'যে শব্দগুলো আপনার শেখা শেষ, সেগুলোকে "শেখা হয়েছে (Learned)" হিসেবে চিহ্নিত করলে এখানে জমা হবে।';
      case 'search':
        return 'অনুগ্রহ করে বানান যাচাই করুন অথবা ফিল্টার রিসেট করে সম্পূর্ণ ৮০০+ শব্দকোষে ফিরে যান।';
      default:
        return 'ফিল্টার পরিবর্তন করুন অথবা সকল শব্দ পুনরায় প্রদর্শন করতে রিসেট করুন।';
    }
  };

  return (
    <div
      id="vocab-empty-state"
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-dashed border-slate-800 max-w-lg mx-auto my-8 shadow-xl shadow-black/30"
    >
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-4 ring-8 ring-slate-950/50">
        {getIcon()}
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-white font-bengali mb-2">
        {getTitle()}
      </h3>

      <p className="text-sm text-slate-400 font-bengali leading-relaxed max-w-md mb-6">
        {getDescription()}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          id="btn-reset-filters"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold font-bengali text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20"
        >
          <RotateCcw className="w-4 h-4" />
          <span>ফিল্টার রিসেট করুন (Reset Filters)</span>
        </button>

        {onRestoreAll && (
          <button
            id="btn-restore-all"
            onClick={onRestoreAll}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 font-bold font-bengali text-xs uppercase tracking-wider transition-all border border-slate-800"
          >
            <BookOpen className="w-4 h-4" />
            <span>সকল ৮০০+ শব্দ দেখুন (View All 800+)</span>
          </button>
        )}
      </div>
    </div>
  );
};
