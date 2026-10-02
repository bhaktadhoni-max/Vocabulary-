import React from 'react';
import { X, Trophy, CheckCircle2, Star, BookOpen, RotateCcw } from 'lucide-react';
import { VocabItem } from '../types';
import { CATEGORIES } from '../data/categories';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allVocab: VocabItem[];
  masteredIds: Set<number>;
  bookmarkedIds: Set<number>;
  onResetProgress: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  allVocab,
  masteredIds,
  bookmarkedIds,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const total = allVocab.length;
  const masteredCount = masteredIds.size;
  const bookmarkedCount = bookmarkedIds.size;
  const percent = Math.round((masteredCount / (total || 1)) * 100);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg font-bengali">
                JLPT N5 পড়াশোনার অগ্রগতি
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
                মোট শব্দকোষ ও বিভাগভিত্তিক সমাপ্তির হিসাব
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Stats */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Main Completion Progress Bar */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold font-bengali text-slate-800 dark:text-slate-200">
                সার্বিক সমাপ্তির হার
              </span>
              <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {percent}%
              </span>
            </div>

            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500 shadow-2xs"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-bengali">
              <span>শেখা হয়েছে: <strong className="text-slate-800 dark:text-white font-mono">{masteredCount}</strong> টি</span>
              <span>বাকি আছে: <strong className="text-slate-800 dark:text-white font-mono">{total - masteredCount}</strong> টি</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <BookOpen className="w-5 h-5 text-slate-500 dark:text-slate-400 mx-auto mb-1" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bengali">মোট শব্দ</span>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">{total}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bengali font-semibold">শেখা শেষ</span>
              <p className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">{masteredCount}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-center">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500 mx-auto mb-1" />
              <span className="text-xs text-amber-800 dark:text-amber-200 font-bengali font-semibold">সংরক্ষিত</span>
              <p className="text-lg sm:text-xl font-bold text-amber-900 dark:text-amber-200 font-mono mt-0.5">{bookmarkedCount}</p>
            </div>
          </div>

          {/* Category-by-Category Mastery breakdown */}
          <div>
            <h4 className="text-xs font-bold font-bengali text-slate-800 dark:text-slate-200 mb-2.5">
              বিভাগভিত্তিক সমাপ্তির হার
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {CATEGORIES.filter(c => c.key !== 'all').map((cat) => {
                const catVocab = allVocab.filter((v) => v.categoryKey === cat.key);
                const catMastered = catVocab.filter((v) => masteredIds.has(v.id)).length;
                const catPercent = Math.round((catMastered / (catVocab.length || 1)) * 100);

                return (
                  <div key={cat.key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200/70 dark:border-slate-700 text-xs transition">
                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className="font-medium font-bengali text-slate-800 dark:text-slate-200 truncate">{cat.nameBn}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 dark:text-slate-500 font-mono">
                        {catMastered}/{catVocab.length}
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono w-10 text-right">
                        {catPercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('আপনি কি সত্যিই আপনার অগ্রগতি ও বুকমার্ক রিসেট করতে চান?')) {
                onResetProgress();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>অগ্রগতি রিসেট করুন</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold font-bengali transition shadow-xs cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
