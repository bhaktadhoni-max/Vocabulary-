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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-[#e8e2d4] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#e8e2d4] flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#f4f9ea] text-[#558b2f] border border-[#d6eab9]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg font-bengali">
                JLPT N5 পড়াশোনার অগ্রগতি
              </h3>
              <p className="text-xs text-slate-500 font-bengali">
                মোট শব্দকোষ ও বিভাগভিত্তিক সমাপ্তির হিসাব
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-[#e8e2d4] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Stats */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Main Completion Progress Bar */}
          <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e8e2d4]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold font-bengali text-slate-800">
                সার্বিক সমাপ্তির হার
              </span>
              <span className="text-lg font-extrabold text-[#558b2f] font-mono">
                {percent}%
              </span>
            </div>

            <div className="w-full h-3 bg-[#e8e2d4] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#558b2f] rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-bengali">
              <span>শেখা হয়েছে: <strong className="text-slate-800 font-mono">{masteredCount}</strong> টি</span>
              <span>বাকি আছে: <strong className="text-slate-800 font-mono">{total - masteredCount}</strong> টি</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e2d4] text-center">
              <BookOpen className="w-5 h-5 text-slate-600 mx-auto mb-1" />
              <span className="text-xs text-slate-500 font-bengali">মোট শব্দ</span>
              <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">{total}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f4f9ea] border border-[#d6eab9] text-center">
              <CheckCircle2 className="w-5 h-5 text-[#558b2f] mx-auto mb-1" />
              <span className="text-xs text-[#558b2f] font-bengali font-semibold">শেখা শেষ</span>
              <p className="text-xl font-bold text-[#3f6e1f] font-mono mt-0.5">{masteredCount}</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500 mx-auto mb-1" />
              <span className="text-xs text-amber-800 font-bengali font-semibold">সংরক্ষিত</span>
              <p className="text-xl font-bold text-amber-900 font-mono mt-0.5">{bookmarkedCount}</p>
            </div>
          </div>

          {/* Category-by-Category Mastery breakdown */}
          <div>
            <h4 className="text-sm font-bold font-bengali text-slate-800 mb-3">
              বিভাগভিত্তিক আয়ত্ত তালিকা ({CATEGORIES.length} টি অধ্যায়)
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {CATEGORIES.filter(c => c.key !== 'all').map((cat) => {
                const catVocab = allVocab.filter((v) => v.categoryKey === cat.key);
                const catMastered = catVocab.filter((v) => masteredIds.has(v.id)).length;
                const catPercent = Math.round((catMastered / (catVocab.length || 1)) * 100);

                return (
                  <div key={cat.key} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#faf8f5] hover:bg-[#f3eee5] border border-[#e8e2d4] text-xs transition">
                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className="font-medium font-bengali text-slate-800 truncate">{cat.nameBn}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 font-mono">
                        {catMastered}/{catVocab.length}
                      </span>
                      <span className="font-bold text-[#558b2f] font-mono w-10 text-right">
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
        <div className="p-4 sm:p-5 border-t border-[#e8e2d4] bg-[#faf8f5] flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('আপনি কি সত্যিই আপনার অগ্রগতি ও বুকমার্ক রিসেট করতে চান?')) {
                onResetProgress();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>অগ্রগতি রিসেট করুন</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#558b2f] hover:bg-[#467326] text-white text-xs font-bold font-bengali transition shadow-xs"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
