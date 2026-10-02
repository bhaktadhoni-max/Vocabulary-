import React, { useState, useMemo } from 'react';
import { 
  BookMarked, 
  Layers, 
  HelpCircle, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  Search,
  Filter,
  Sparkles
} from 'lucide-react';
import { N4LessonMeta, N4VocabItem } from '../../data/n4/types';
import { N4_LESSONS_META, N4_VOCAB_BY_LESSON } from '../../data/n4';

interface N4LessonsViewProps {
  studiedWordIds: number[];
  masteredWordIds: number[];
  onSelectLessonToStudy: (lessonNum: number) => void;
  onSelectLessonToQuiz: (lessonNum: number) => void;
}

export const N4LessonsView: React.FC<N4LessonsViewProps> = ({
  studiedWordIds,
  masteredWordIds,
  onSelectLessonToStudy,
  onSelectLessonToQuiz
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const studiedSet = useMemo(() => new Set(studiedWordIds), [studiedWordIds]);
  const masteredSet = useMemo(() => new Set(masteredWordIds), [masteredWordIds]);

  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return N4_LESSONS_META;
    const q = searchQuery.toLowerCase().trim();
    return N4_LESSONS_META.filter((l) => 
      l.lesson.toString().includes(q) ||
      l.titleBn.toLowerCase().includes(q) ||
      l.titleJp.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.grammarFocus.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#fdf5f3] dark:bg-[#2c1514] text-[#c23b22] border border-[#f5c6cb] dark:border-[#4d2121]">
              <BookMarked className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali">
              JLPT N4 অধ্যায়ভিত্তিক পাঠ (Lesson 26–50)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#737885] dark:text-[#8d97ab] font-bengali">
            মিন্না নো নিহোঙ্গো ২য় খণ্ডের সম্পূর্ণ ২৫টি লেসনের শব্দভাণ্ডার
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737885] dark:text-[#8d97ab]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="লেসন বা বিষয়বস্তু খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#f5f2eb]/80 dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] text-xs sm:text-sm text-[#191c21] dark:text-[#f6f8fb] focus:outline-hidden focus:ring-2 focus:ring-[#c23b22]/40 transition font-bengali"
          />
        </div>
      </div>

      {/* LESSONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLessons.map((item) => {
          const lessonVocab = N4_VOCAB_BY_LESSON[item.lesson] || [];
          const studiedInLesson = lessonVocab.filter(v => studiedSet.has(v.id)).length;
          const masteredInLesson = lessonVocab.filter(v => masteredSet.has(v.id)).length;
          const progressPercent = Math.round((studiedInLesson / (item.count || 1)) * 100);

          return (
            <div
              key={item.lesson}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:border-[#c23b22]/40 transition space-y-4 group"
            >
              {/* Header: Lesson badge & Count */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-xl bg-[#fdf5f3] dark:bg-[#2c1514] text-[#c23b22] text-xs font-mono font-bold border border-[#f5c6cb] dark:border-[#4d2121]">
                    লেসন {item.lesson}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs text-[#737885] dark:text-[#8d97ab] font-mono">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{item.count} শব্দ</span>
                  </div>
                </div>

                {/* Lesson Titles */}
                <h3 className="text-base sm:text-lg font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali group-hover:text-[#c23b22] transition">
                  {item.titleBn}
                </h3>
                <p className="text-xs text-[#737885] dark:text-[#8d97ab] font-japanese mt-0.5">
                  {item.titleJp}
                </p>

                {/* Description */}
                <p className="text-xs text-[#737885] dark:text-[#8d97ab] font-bengali mt-2 line-clamp-2">
                  {item.description}
                </p>

                {/* Grammar Focus Pill */}
                <div className="mt-3 px-3 py-1.5 rounded-xl bg-[#f5f2eb]/70 dark:bg-[#1a1e2a]/60 border border-[#e8e3d8] dark:border-[#222735] text-[11px] text-[#737885] dark:text-[#8d97ab] font-mono line-clamp-1">
                  💡 {item.grammarFocus}
                </div>
              </div>

              {/* Progress Bar & Counts */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-[#737885] dark:text-[#8d97ab]">
                  <span>অগ্রগতি: {progressPercent}%</span>
                  <span>{studiedInLesson}/{item.count} পঠিত</span>
                </div>
                <div className="w-full bg-[#f5f2eb] dark:bg-[#1a1e2a] h-2 rounded-full overflow-hidden border border-[#e8e3d8]/80 dark:border-[#222735]/80">
                  <div
                    className="h-full bg-gradient-to-r from-[#c23b22] to-[#b8860b] rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons: Study & Quiz */}
              <div className="pt-3 border-t border-[#e8e3d8]/80 dark:border-[#222735]/80 flex items-center gap-2">
                <button
                  onClick={() => onSelectLessonToStudy(item.lesson)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#c23b22] hover:bg-[#a8321d] text-white font-bold text-xs font-bengali transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>লেসন পড়ুন</span>
                </button>

                <button
                  onClick={() => onSelectLessonToQuiz(item.lesson)}
                  className="py-2.5 px-3 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] hover:bg-[#ece7dc] dark:hover:bg-[#222735] text-[#191c21] dark:text-[#f6f8fb] font-bold text-xs font-bengali border border-[#e8e3d8] dark:border-[#222735] transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#b8860b] dark:text-[#d4af37]" />
                  <span>কুইজ দিন</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
