import React, { useMemo } from 'react';
import { Star, Volume2, Layers, BookMarked, Play } from 'lucide-react';
import { N4VocabItem } from '../../data/n4/types';
import { speakJapanese } from '../../utils/sound';

interface N4FavoritesViewProps {
  allVocab: N4VocabItem[];
  favoriteIds: Set<number>;
  onToggleFavorite: (id: number) => void;
  onStartStudyFavorites: () => void;
}

export const N4FavoritesView: React.FC<N4FavoritesViewProps> = ({
  allVocab,
  favoriteIds,
  onToggleFavorite,
  onStartStudyFavorites
}) => {
  const favoriteItems = useMemo(() => {
    return allVocab.filter(item => favoriteIds.has(item.id));
  }, [allVocab, favoriteIds]);

  if (favoriteItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] font-bengali space-y-3 animate-in fade-in duration-300">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 mx-auto flex items-center justify-center">
          <Star className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-[#191c21] dark:text-[#f6f8fb]">
          কোনো সংরক্ষিত শব্দ নেই
        </h3>
        <p className="text-xs sm:text-sm text-[#737885] dark:text-[#8d97ab] max-w-sm mx-auto">
          যেকোনো শব্দে স্টার (★) চিহ্নে ক্লিক করলে তা দ্রুত পর্যালোচনার জন্য এখানে সংরক্ষিত থাকবে।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
              <Star className="w-4 h-4 fill-amber-500" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#191c21] dark:text-[#f6f8fb] font-bengali">
              সংরক্ষিত শব্দসমূহ (Favorites)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#737885] dark:text-[#8d97ab] font-bengali">
            মোট <strong>{favoriteItems.length}</strong>টি শব্দ আপনার পছন্দের তালিকায় রয়েছে
          </p>
        </div>

        <button
          onClick={onStartStudyFavorites}
          className="px-5 py-2.5 rounded-2xl bg-[#c23b22] hover:bg-[#a8321d] text-white font-bold text-xs sm:text-sm font-bengali transition cursor-pointer flex items-center gap-2 shadow-md shadow-[#c23b22]/20 shrink-0 active:scale-98"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>পছন্দের শব্দগুলো পড়ুন</span>
        </button>
      </div>

      {/* Grid of Favorite Words */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {favoriteItems.map(item => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] flex items-start justify-between gap-3 hover:border-[#c23b22]/40 transition group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-[#c23b22] bg-[#fdf5f3] dark:bg-[#2c1514] px-2 py-0.5 rounded-md border border-[#f5c6cb] dark:border-[#4d2121]">
                  L{item.lesson}
                </span>
                <span className="text-[11px] text-[#737885] dark:text-[#8d97ab] font-mono">
                  {item.categoryKey}
                </span>
              </div>

              {/* Japanese Expression */}
              <div className="font-japanese font-black text-xl text-[#191c21] dark:text-[#f6f8fb]">
                {item.kanji}
              </div>
              <div className="font-japanese text-xs text-[#737885] dark:text-[#8d97ab]">
                {item.furigana} • <span className="font-mono text-[#b8860b] dark:text-[#d4af37]">{item.romaji}</span>
              </div>

              {/* Bengali Meaning */}
              <div className="font-bengali font-bold text-sm text-[#191c21] dark:text-[#f6f8fb] mt-2">
                {item.meaningBn}
              </div>
            </div>

            {/* Actions: Audio & Star Toggle */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <button
                onClick={() => onToggleFavorite(item.id)}
                className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition cursor-pointer"
                title="বুকমার্ক মুছুন"
              >
                <Star className="w-5 h-5 fill-amber-500" />
              </button>

              <button
                onClick={() => speakJapanese(item.furigana || item.kanji)}
                className="p-2 rounded-xl text-[#737885] hover:text-[#c23b22] hover:bg-[#fdf5f3] dark:hover:bg-[#2c1514] transition cursor-pointer"
                title="উচ্চারণ শুনুন"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
