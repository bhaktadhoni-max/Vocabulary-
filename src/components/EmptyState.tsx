import React from 'react';
import { RotateCcw, SearchX, BookmarkX, BookOpen, Sparkles } from 'lucide-react';

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
        return <BookmarkX className="w-10 h-10 text-amber-500 stroke-[1.5]" />;
      case 'search':
        return <SearchX className="w-10 h-10 text-slate-400 dark:text-slate-500 stroke-[1.5]" />;
      case 'mastered':
        return <BookOpen className="w-10 h-10 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />;
      default:
        return <SearchX className="w-10 h-10 text-slate-400 dark:text-slate-500 stroke-[1.5]" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'bookmarks':
        return 'কোনো সংরক্ষিত শব্দ নেই';
      case 'mastered':
        return 'এখনও কোনো শব্দ আয়ত্ত করা হয়নি';
      case 'category':
        return 'এই বিভাগে কোনো শব্দ পাওয়া যায়নি';
      case 'search':
        return searchQuery
          ? `"${searchQuery}" এর জন্য কোনো শব্দ মেলেনি`
          : 'কোনো ফলাফল পাওয়া যায়নি';
      default:
        return 'কোনো শব্দ পাওয়া যায়নি';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'bookmarks':
        return 'ফ্ল্যাশকার্ডে স্টার (⭐️) আইকনে ক্লিক করে কঠিন বা প্রয়োজনীয় শব্দগুলো বুকমার্ক করে রাখুন।';
      case 'mastered':
        return 'যেসব শব্দ আপনার ভালোভাবে শেখা শেষ, সেগুলোতে "জানি" বা চেক দিলে এখানে জমা হবে।';
      case 'search':
        return 'বানান যাচাই করুন অথবা ফিল্টার রিসেট করে সম্পূর্ণ শব্দকোষে ফিরে যান।';
      default:
        return 'অন্য কোনো বিষয়ভিত্তিক বিভাগ নির্বাচন করুন অথবা সব শব্দ দেখতে রিসেট করুন।';
    }
  };

  return (
    <div
      id="vocab-empty-state"
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 max-w-md mx-auto my-8 shadow-sm animate-fadeInScale"
    >
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 mb-4">
        {getIcon()}
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white font-bengali mb-1.5">
        {getTitle()}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bengali leading-relaxed max-w-sm mb-6">
        {getDescription()}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          id="btn-reset-filters"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 min-h-[42px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-bengali text-xs transition active:scale-95 cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>ফিল্টার রিসেট করুন</span>
        </button>

        {onRestoreAll && (
          <button
            id="btn-restore-all"
            onClick={onRestoreAll}
            className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold font-bengali text-xs transition cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>সকল শব্দ দেখুন</span>
          </button>
        )}
      </div>
    </div>
  );
};
