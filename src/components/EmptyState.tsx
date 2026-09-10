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
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-3xl border border-[#e8e2d4] max-w-lg mx-auto my-8 shadow-xs"
    >
      <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e2d4] mb-4">
        {getIcon()}
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-bengali mb-2">
        {getTitle()}
      </h3>

      <p className="text-sm text-slate-500 font-bengali leading-relaxed max-w-md mb-6">
        {getDescription()}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          id="btn-reset-filters"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#558b2f] hover:bg-[#467326] text-white font-bold font-bengali text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>ফিল্টার রিসেট করুন</span>
        </button>

        {onRestoreAll && (
          <button
            id="btn-restore-all"
            onClick={onRestoreAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#faf8f5] hover:bg-slate-100 text-slate-700 font-bold font-bengali text-xs uppercase tracking-wider transition-all border border-[#e2dcd0]"
          >
            <BookOpen className="w-4 h-4 text-[#558b2f]" />
            <span>সকল ৮৩৮ শব্দ দেখুন</span>
          </button>
        )}
      </div>
    </div>
  );
};
