import React from 'react';
import { X, Trophy, CheckCircle2, Star, BookOpen, RotateCcw, Flame } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-2xl shadow-black/80 border border-slate-700/80 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg font-bengali">
                JLPT N5 পড়াশোনার অগ্রগতি
              </h3>
              <p className="text-xs text-slate-400 font-bengali">
                মোট শব্দকোষ ও বিভাগভিত্তিক সমাপ্তির হিসাব
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Stats */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Main Completion Progress Bar */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold font-bengali text-slate-200">
                সার্বিক সমাপ্তির হার
              </span>
              <span className="text-lg font-extrabold text-cyan-400 font-mono">
                {percent}%
              </span>
            </div>

            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/30"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-bengali">
              <span>শেখা হয়েছে: <strong className="text-white font-mono">{masteredCount}</strong> টি</span>
              <span>বাকি আছে: <strong className="text-white font-mono">{total - masteredCount}</strong> টি</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <BookOpen className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <span className="text-xs text-slate-400 font-bengali">মোট শব্দ</span>
              <p className="text-xl font-bold text-white font-mono mt-0.5">{total}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-900/40 text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <span className="text-xs text-emerald-400 font-bengali">শেখা শেষ</span>
              <p className="text-xl font-bold text-emerald-300 font-mono mt-0.5">{masteredCount}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-900/40 text-center">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto mb-1" />
              <span className="text-xs text-amber-400 font-bengali">সংরক্ষিত</span>
              <p className="text-xl font-bold text-amber-300 font-mono mt-0.5">{bookmarkedCount}</p>
            </div>
          </div>

          {/* Category-by-Category Mastery breakdown */}
          <div>
            <h4 className="text-sm font-bold font-bengali text-slate-200 mb-3">
              বিভাগভিত্তিক আয়ত্ত তালিকা ({CATEGORIES.length} টি অধ্যায়)
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {CATEGORIES.filter(c => c.key !== 'all').map((cat) => {
                const catVocab = allVocab.filter((v) => v.categoryKey === cat.key);
                const catMastered = catVocab.filter((v) => masteredIds.has(v.id)).length;
                const catPercent = Math.round((catMastered / (catVocab.length || 1)) * 100);

                return (
                  <div key={cat.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/40 border border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className="font-medium font-bengali text-slate-300 truncate">{cat.nameBn}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-500 font-mono">
                        {catMastered}/{catVocab.length}
                      </span>
                      <span className="font-bold text-cyan-400 font-mono w-10 text-right">
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
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('আপনি কি সত্যিই আপনার অগ্রগতি ও বুকমার্ক রিসেট করতে চান?')) {
                onResetProgress();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>অগ্রগতি রিসেট করুন (Reset)</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold font-bengali transition shadow-lg shadow-blue-600/20"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
