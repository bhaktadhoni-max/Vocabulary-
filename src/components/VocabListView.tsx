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
  Download,
  Layers,
  Sparkles
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
      if (filterType === 'mastered' && !masteredIds.has(item.id)) return false;
      if (filterType === 'unlearned' && masteredIds.has(item.id)) return false;
      if (filterType === 'bookmarked' && !bookmarkedIds.has(item.id)) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchKanji = item.kanji.toLowerCase().includes(query);
        const matchHiragana = item.hiragana.toLowerCase().includes(query);
        const matchRomaji = item.romaji.toLowerCase().includes(query);
        const matchBn = item.bn.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        return matchKanji || matchHiragana || matchRomaji || matchBn || matchCat;
      }

      return true;
    });
  }, [allVocab, selectedCategory, filterType, searchQuery, masteredIds, bookmarkedIds]);

  const toggleRowExpand = (id: number) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setFilterType('all');
  };

  return (
    <div id="vocab-list-view" className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      
      {/* Search & Filter Header Card */}
      <div className="bg-white dark:bg-[#141720] p-4 sm:p-5 rounded-3xl border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] mb-6 space-y-3.5">
        
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737885] dark:text-[#8d97ab]" />
            <input
              id="vocab-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="শব্দ খুঁজুন (যেমন: পাহাড়, yama, 山, taberu, খাওয়া)..."
              className="w-full min-h-[44px] pl-10 pr-10 py-2.5 bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] rounded-2xl text-sm text-[#191c21] dark:text-[#f6f8fb] placeholder-[#737885] dark:placeholder-[#8d97ab] focus:outline-hidden focus:border-[#c23b22] dark:focus:border-[#e0452d] font-bengali transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#737885] hover:text-[#191c21] dark:hover:text-white cursor-pointer"
                title="মুছে ফেলুন"
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
              className="w-full min-h-[44px] bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#191c21] dark:text-[#f6f8fb] focus:outline-hidden focus:border-[#c23b22] dark:focus:border-[#e0452d] font-bengali cursor-pointer transition"
            >
              <option value="all">সব বিভাগ ({allVocab.length})</option>
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
              className="flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] hover:bg-[#ede8df] dark:hover:bg-[#222738] transition text-xs font-semibold cursor-pointer"
              title="ভয়েস ও উচ্চারণ সেটিংস"
            >
              <Sliders className="w-4 h-4 text-[#c5a880]" />
              <span className="hidden sm:inline font-bengali">ভয়েস</span>
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#e8e3d8] dark:border-[#222735] text-xs font-medium">
          <div className="flex flex-wrap items-center gap-1.5 font-bengali select-none">
            <button
              onClick={() => setFilterType('all')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl border transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#191c21] dark:bg-white text-white dark:text-[#0d0f14] border-[#191c21] dark:border-white font-bold shadow-xs'
                  : 'bg-white dark:bg-[#141720] text-[#474b54] dark:text-[#cbd3e1] border-[#e8e3d8] dark:border-[#222735] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a]'
              }`}
            >
              সব ({allVocab.length})
            </button>
            
            <button
              onClick={() => setFilterType('unlearned')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl border transition cursor-pointer ${
                filterType === 'unlearned'
                  ? 'bg-[#c23b22] dark:bg-[#e0452d] text-white border-[#c23b22] dark:border-[#e0452d] font-bold shadow-xs'
                  : 'bg-white dark:bg-[#141720] text-[#474b54] dark:text-[#cbd3e1] border-[#e8e3d8] dark:border-[#222735] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a]'
              }`}
            >
              শেখা বাকি ({allVocab.length - masteredIds.size})
            </button>

            <button
              onClick={() => setFilterType('mastered')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                filterType === 'mastered'
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                  : 'bg-white dark:bg-[#141720] text-[#474b54] dark:text-[#cbd3e1] border-[#e8e3d8] dark:border-[#222735] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>আয়ত্ত ({masteredIds.size})</span>
            </button>

            <button
              onClick={() => setFilterType('bookmarked')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                filterType === 'bookmarked'
                  ? 'bg-amber-500 text-white font-bold border-amber-500 shadow-xs'
                  : 'bg-white dark:bg-[#141720] text-[#474b54] dark:text-[#cbd3e1] border-[#e8e3d8] dark:border-[#222735] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a]'
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
                className="flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] hover:bg-[#ede8df] dark:hover:bg-[#222738] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] text-xs font-bengali font-semibold transition cursor-pointer shadow-xs"
                title="সম্পূর্ণ শব্দকোষ PDF বই আকারে দেখুন ও ডাউনলোড করুন"
              >
                <Download className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>PDF বই</span>
              </button>
            )}
            <div className="text-[#737885] dark:text-[#8d97ab] text-xs font-bengali">
              মোট: <span className="font-bold text-[#191c21] dark:text-white font-mono">{filteredVocab.length}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Vocabulary List Items */}
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
        <div className="bg-white dark:bg-[#141720] rounded-3xl border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] divide-y divide-[#e8e3d8] dark:divide-[#222735] overflow-hidden">
          {filteredVocab.map((item) => {
            const isBookmarked = bookmarkedIds.has(item.id);
            const isMastered = masteredIds.has(item.id);
            const isExpanded = expandedRowId === item.id;

            return (
              <div 
                key={item.id}
                className={`transition-colors ${
                  isExpanded 
                    ? 'bg-[#f5f2eb]/70 dark:bg-[#1a1e2a]/60' 
                    : 'hover:bg-[#f5f2eb]/40 dark:hover:bg-[#1a1e2a]/40'
                }`}
              >
                <div 
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  onClick={() => toggleRowExpand(item.id)}
                >
                  
                  {/* Left Column: Kanji, Furigana & Meaning */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    
                    {/* Index Number */}
                    <span className="text-xs font-mono text-[#9ea3b0] dark:text-[#5d677d] w-8 shrink-0 pt-1 sm:pt-0">
                      #{item.id}
                    </span>

                    {/* Kanji & Hiragana */}
                    <div className="min-w-[130px] sm:min-w-[150px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl sm:text-2xl font-bold font-japanese text-[#191c21] dark:text-[#f6f8fb] select-text">
                          {item.kanji}
                        </span>
                        {/* Normal Audio */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakJapanese(item.hiragana || item.kanji, { slow: false });
                          }}
                          className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] hover:bg-[#ede8df] text-[#c23b22] dark:text-[#e0452d] border border-[#e8e3d8] dark:border-[#222735] transition cursor-pointer"
                          title="স্বাভাবিক উচ্চারণ শুনুন"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        {/* Slow Audio */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakJapanese(item.hiragana || item.kanji, { slow: true });
                          }}
                          className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] hover:bg-[#ede8df] text-[#737885] dark:text-[#8d97ab] border border-[#e8e3d8] dark:border-[#222735] transition cursor-pointer"
                          title="ধীর উচ্চারণ (0.65x)"
                        >
                          <Turtle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-[#c23b22] dark:text-[#e0452d] font-semibold font-japanese select-text">
                        {item.hiragana}
                        <span className="text-[#737885] dark:text-[#8d97ab] font-mono ml-1.5 font-normal">
                          [{item.romaji}]
                        </span>
                      </div>
                    </div>

                    {/* Bengali Translation & Bangla Audio */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-base sm:text-lg font-bold font-bengali text-[#191c21] dark:text-[#f6f8fb] select-text">
                          {item.bn}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakBangla(item.bn);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-[#f5f2eb] dark:bg-[#1a1e2a] hover:bg-[#ede8df] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] transition text-[10px] flex items-center gap-0.5 cursor-pointer"
                          title="বাংলা অর্থ শুনুন"
                        >
                          <Volume2 className="w-3 h-3 text-[#c5a880]" />
                          <span className="font-bengali font-semibold">BN</span>
                        </button>
                      </div>
                      <span className="inline-block text-[11px] text-[#737885] dark:text-[#8d97ab] font-bengali px-2 py-0.5 bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] rounded-lg mt-0.5">
                        {item.category}
                      </span>
                    </div>

                  </div>

                  {/* Right Column: Actions (Bookmark, Mastered, Expand) */}
                  <div className="flex items-center justify-end gap-1.5 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    
                    {/* Mastered Toggle */}
                    <button
                      onClick={() => onToggleMastered(item.id)}
                      className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border transition cursor-pointer ${
                        isMastered
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-white dark:bg-[#141720] text-[#9ea3b0] hover:text-emerald-600 border-[#e8e3d8] dark:border-[#222735]'
                      }`}
                      title={isMastered ? 'শেখা হয়েছে' : 'শেখা শেষ চিহ্নিত করুন'}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isMastered ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                    </button>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => handleBookmarkToggle(item.id)}
                      className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border transition cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : 'bg-white dark:bg-[#141720] text-[#9ea3b0] hover:text-amber-500 border-[#e8e3d8] dark:border-[#222735]'
                      }`}
                      title="বুকমার্ক করুন"
                    >
                      <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>

                    {/* Accordion Expand Button */}
                    <button
                      onClick={() => toggleRowExpand(item.id)}
                      className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                      title="বিস্তারিত বাক্য দেখুন"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                </div>

                {/* Expanded Details: Example Sentences & Furigana */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-4 pt-1 text-sm bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/60 animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-400 font-semibold font-bengali">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          ব্যবহারিক উদাহরণ বাক্য (Example Sentence):
                        </span>
                        {item.exampleJp && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => speakJapanese(item.exampleJp!, { slow: false })}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60 transition text-xs font-mono cursor-pointer"
                              title="জাপানি বাক্য শুনুন"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>JP</span>
                            </button>
                            <button
                              onClick={() => speakJapanese(item.exampleJp!, { slow: true })}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition text-xs cursor-pointer"
                              title="ধীর বাক্য (Slow)"
                            >
                              <Turtle className="w-3 h-3" />
                              <span>ধীর</span>
                            </button>
                            {item.exampleBn && (
                              <button
                                onClick={() => speakBangla(item.exampleBn!)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition text-xs font-bengali cursor-pointer"
                                title="বাংলা অর্থ শুনুন"
                              >
                                <Volume2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                <span>বাংলা</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {item.exampleJp ? (
                        <div className="space-y-1">
                          <p className="text-base font-japanese text-slate-900 dark:text-white font-medium select-text">
                            {item.exampleFurigana || item.exampleJp}
                          </p>
                          {item.exampleRomaji && (
                            <p className="text-xs font-mono text-slate-400 dark:text-slate-500 select-text">
                              {item.exampleRomaji}
                            </p>
                          )}
                          <p className="text-sm font-bengali text-slate-700 dark:text-slate-300 mt-1 select-text">
                            {item.exampleBn}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-bengali">
                          এই শব্দের জন্য আলাদা উদাহরণ বাক্য সংরক্ষিত নেই।
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

      {/* Sleek Bottom Bar for List View */}
      {filteredVocab.length > 0 && (
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-bengali">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>মোট {allVocab.length}টির মধ্যে {filteredVocab.length}টি প্রদর্শিত</span>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition shadow-xs active:scale-95 cursor-pointer"
            title="উপরে যান"
          >
            <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>উপরে ফিরুন</span>
          </button>
        </div>
      )}
    </div>
  );
};
