import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Volume2, 
  Star, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  X,
  BookOpen,
  Eye,
  Sliders,
  Turtle,
  ArrowUp,
  Download
} from 'lucide-react';
import { VocabItem } from '../types';
import { CATEGORIES } from '../data/categories';
import { speakJapanese, speakBangla, playBookmarkSound } from '../utils/sound';
import { EmptyState } from './EmptyState';

interface VocabListViewProps {
  allVocab: VocabItem[];
  bookmarkedIds: Set<number>;
  masteredIds: Set<number>;
  onToggleBookmark: (id: number) => void;
  onToggleMastered: (id: number) => void;
  onOpenCardInFlashcard?: (item: VocabItem) => void;
  onOpenVoiceSettings?: () => void;
  onNavigateToBook?: () => void;
}

export const VocabListView: React.FC<VocabListViewProps> = ({
  allVocab,
  bookmarkedIds,
  masteredIds,
  onToggleBookmark,
  onToggleMastered,
  onOpenCardInFlashcard,
  onOpenVoiceSettings,
  onNavigateToBook
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'unlearned' | 'mastered' | 'bookmarked'>('all');
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const handleBookmarkToggle = (id: number) => {
    onToggleBookmark(id);
    if (!bookmarkedIds.has(id)) {
      playBookmarkSound();
    }
  };

  // Filtered vocabulary computation
  const filteredVocab = useMemo(() => {
    return allVocab.filter((item) => {
      // 1. Category Filter
      if (selectedCategory !== 'all' && item.categoryKey !== selectedCategory) {
        return false;
      }

      // 2. Status Filter
      if (filterType === 'bookmarked' && !bookmarkedIds.has(item.id)) {
        return false;
      }
      if (filterType === 'mastered' && !masteredIds.has(item.id)) {
        return false;
      }
      if (filterType === 'unlearned' && masteredIds.has(item.id)) {
        return false;
      }

      // 3. Search Query (matches bn, kanji, hiragana, romaji, category)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesKanji = item.kanji.toLowerCase().includes(query);
        const matchesHiragana = item.hiragana.toLowerCase().includes(query);
        const matchesRomaji = item.romaji.toLowerCase().includes(query);
        const matchesBn = item.bn.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        const matchesExampleBn = item.exampleBn?.toLowerCase().includes(query);
        return matchesKanji || matchesHiragana || matchesRomaji || matchesBn || matchesCat || matchesExampleBn;
      }

      return true;
    });
  }, [allVocab, selectedCategory, filterType, searchQuery, bookmarkedIds, masteredIds]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setFilterType('all');
  };

  const toggleRowExpand = (id: number) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  return (
    <div id="vocab-list-view" className="max-w-6xl mx-auto px-4 py-6">
      
      {/* Search & Filter Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 mb-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              id="vocab-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="শব্দ খুঁজুন (বাংলা, Kanji, Hiragana বা Romaji যেমন: পাহাড়, yama, 山)..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-bengali"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="sm:w-64">
            <select
              id="list-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-bengali cursor-pointer"
            >
              <option value="all">সব বিষয়ভিত্তিক বিভাগ ({allVocab.length})</option>
              {CATEGORIES.filter(c => c.key !== 'all').map((cat) => {
                const count = allVocab.filter((v) => v.categoryKey === cat.key).length;
                return (
                  <option key={cat.key} value={cat.key}>
                    {cat.icon} {cat.nameBn} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Voice Settings Shortcut */}
          {onOpenVoiceSettings && (
            <button
              onClick={onOpenVoiceSettings}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 text-cyan-400 border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 transition text-xs font-semibold"
              title="ভয়েস ও উচ্চারণ সেটিংস"
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">ভয়েস সেটিংস</span>
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80 text-xs font-medium">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl border transition ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/30 shadow-md shadow-blue-600/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              সব শব্দ ({allVocab.length})
            </button>
            <button
              onClick={() => setFilterType('unlearned')}
              className={`px-3.5 py-1.5 rounded-xl border transition ${
                filterType === 'unlearned'
                  ? 'bg-blue-600 text-white border-blue-400/30 shadow-md shadow-blue-600/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              শেখা বাকি ({allVocab.length - masteredIds.size})
            </button>
            <button
              onClick={() => setFilterType('mastered')}
              className={`px-3.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                filterType === 'mastered'
                  ? 'bg-emerald-600 text-white border-emerald-400/30 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>শেখা হয়েছে ({masteredIds.size})</span>
            </button>
            <button
              onClick={() => setFilterType('bookmarked')}
              className={`px-3.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                filterType === 'bookmarked'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400/30 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>সংরক্ষিত ({bookmarkedIds.size})</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToBook && (
              <button
                onClick={onNavigateToBook}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700/80 text-xs font-bengali transition cursor-pointer shadow-xs"
                title="সম্পূর্ণ শব্দকোষ PDF বই আকারে দেখুন ও ডাউনলোড করুন"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>PDF বই ডাউনলোড</span>
              </button>
            )}
            <div className="text-slate-400 text-xs font-bengali">
              প্রদর্শিত হচ্ছে: <span className="font-bold text-cyan-400 font-mono">{filteredVocab.length}</span> টি শব্দ
            </div>
          </div>
        </div>

      </div>

      {/* Vocabulary List Table / Cards */}
      {filteredVocab.length === 0 ? (
        <EmptyState
          type={
            filterType === 'bookmarked'
              ? 'bookmarks'
              : filterType === 'mastered'
              ? 'mastered'
              : searchQuery
              ? 'search'
              : 'general'
          }
          searchQuery={searchQuery}
          onResetFilters={handleResetFilters}
        />
      ) : (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl shadow-black/20 divide-y divide-slate-800/70 overflow-hidden">
          {filteredVocab.map((item) => {
            const isBookmarked = bookmarkedIds.has(item.id);
            const isMastered = masteredIds.has(item.id);
            const isExpanded = expandedRowId === item.id;

            return (
              <div 
                key={item.id}
                className={`transition-colors ${
                  isExpanded ? 'bg-slate-950/60' : 'hover:bg-slate-850/50'
                }`}
              >
                <div 
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  onClick={() => toggleRowExpand(item.id)}
                >
                  
                  {/* Left Column: Kanji, Furigana & Meaning */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    
                    {/* Index Number */}
                    <span className="text-xs font-mono text-slate-500 w-8 shrink-0 pt-1 sm:pt-0">
                      #{item.id}
                    </span>

                    {/* Kanji / Hiragana */}
                    <div className="min-w-[140px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl sm:text-2xl font-bold font-japanese text-white">
                          {item.kanji}
                        </span>
                        {/* Normal Audio */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakJapanese(item.hiragana || item.kanji, { slow: false });
                          }}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-cyan-500/40 transition"
                          title="স্বাভাবিক স্পষ্ট উচ্চারণ শুনুন"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        {/* Slow Audio */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakJapanese(item.hiragana || item.kanji, { slow: true });
                          }}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 hover:border-amber-500/40 transition"
                          title="ধীর ও স্পষ্ট উচ্চারণ (0.65x)"
                        >
                          <Turtle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-cyan-400 font-medium font-japanese">
                        {item.hiragana}
                        <span className="text-slate-400 font-mono ml-1.5 font-normal">
                          [{item.romaji}]
                        </span>
                      </div>
                    </div>

                    {/* Bengali Translation & Bangla Audio */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-base sm:text-lg font-bold font-bengali text-slate-100">
                          {item.bn}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakBangla(item.bn);
                          }}
                          className="p-1 rounded-md bg-slate-950 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 transition text-[10px] flex items-center gap-0.5"
                          title="বাংলা অর্থ শুনুন"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span className="font-bengali">BN</span>
                        </button>
                      </div>
                      <span className="inline-block text-[11px] text-slate-400 font-bengali px-2.5 py-0.5 bg-slate-950 border border-slate-800 rounded-md mt-0.5">
                        {item.category}
                      </span>
                    </div>

                  </div>

                  {/* Right Column: Actions (Bookmark, Mastered, Expand) */}
                  <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    
                    {/* Mastered Toggle */}
                    <button
                      onClick={() => onToggleMastered(item.id)}
                      className={`p-2.5 rounded-xl border transition ${
                        isMastered
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-xs'
                          : 'bg-slate-950 text-slate-400 hover:text-emerald-300 border-slate-800 hover:border-emerald-500/30'
                      }`}
                      title={isMastered ? 'শেখা হয়েছে' : 'শেখা শেষ হিসেবে চিহ্নিত করুন'}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </button>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => handleBookmarkToggle(item.id)}
                      className={`p-2.5 rounded-xl border transition ${
                        isBookmarked
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs'
                          : 'bg-slate-950 text-slate-400 hover:text-amber-300 border-slate-800 hover:border-amber-500/30'
                      }`}
                      title="বুকমার্ক করুন"
                    >
                      <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    {/* Accordion Expand Button */}
                    <button
                      onClick={() => toggleRowExpand(item.id)}
                      className="p-2.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition"
                      title="বিস্তারিত বাক্য দেখুন"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                </div>

                {/* Expanded Details: Example Sentences & Furigana */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-2 text-sm bg-slate-950/70 border-t border-slate-800/80 animate-in fade-in duration-150">
                    <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-cyan-300 font-semibold font-bengali">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-cyan-400" />
                          ব্যবহারিক উদাহরণ বাক্য (Example Sentence):
                        </span>
                        {item.exampleJp && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => speakJapanese(item.exampleJp!, { slow: false })}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-800 transition text-xs font-mono"
                              title="জাপানি বাক্য শুনুন"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>JP</span>
                            </button>
                            <button
                              onClick={() => speakJapanese(item.exampleJp!, { slow: true })}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 transition text-xs"
                              title="ধীরে জাপানি বাক্য শুনুন (Slow)"
                            >
                              <Turtle className="w-3.5 h-3.5" />
                              <span>ধীরে</span>
                            </button>
                            {item.exampleBn && (
                              <button
                                onClick={() => speakBangla(item.exampleBn!)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-800 transition text-xs font-bengali"
                                title="বাংলা অর্থ শুনুন"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>বাংলা</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {item.exampleJp ? (
                        <div>
                          <p className="text-base font-japanese text-slate-100 font-medium">
                            {item.exampleFurigana || item.exampleJp}
                          </p>
                          {item.exampleRomaji && (
                            <p className="text-xs font-mono text-slate-400">
                              {item.exampleRomaji}
                            </p>
                          )}
                          <p className="text-sm font-bengali text-slate-300 mt-1">
                            {item.exampleBn}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic font-bengali">
                          এই শব্দের জন্য অতিরিক্ত বাক্য শীঘ্রই যুক্ত করা হবে।
                        </p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Sleek User-Friendly Bottom Bar for List View */}
      {filteredVocab.length > 0 && (
        <div className="mt-8 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-bengali">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>মোট {allVocab.length}টির মধ্যে {filteredVocab.length}টি শব্দ প্রদর্শিত হচ্ছে</span>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition shadow-sm active:scale-95"
            title="উপরে যান"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>উপরে স্ক্রোল করুন (Back to Top)</span>
          </button>
        </div>
      )}

    </div>
  );
};
