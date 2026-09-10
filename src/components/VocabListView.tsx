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
    <div id="vocab-list-view" className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      
      {/* Search & Filter Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e8e2d4] shadow-xs mb-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="vocab-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="শব্দ খুঁজুন (যেমন: পাহাড়, yama, 山, taberu, খাওয়া)..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#faf8f5] border border-[#e2dcd0] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#558b2f] focus:ring-1 focus:ring-[#558b2f] font-bengali transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
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
              className="w-full bg-[#faf8f5] border border-[#e2dcd0] rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#558b2f] focus:ring-1 focus:ring-[#558b2f] font-bengali cursor-pointer transition"
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
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#faf8f5] text-[#558b2f] border border-[#e2dcd0] hover:bg-[#f0f7e6] transition text-xs font-semibold"
              title="ভয়েস ও উচ্চারণ সেটিংস"
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">ভয়েস সেটিংস</span>
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#e8e2d4] text-xs font-medium">
          <div className="flex flex-wrap items-center gap-2 font-bengali">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-full border transition ${
                filterType === 'all'
                  ? 'bg-[#1e293b] text-white border-[#1e293b] shadow-2xs font-bold'
                  : 'bg-white text-slate-700 border-[#e2dcd0] hover:bg-[#faf7f0]'
              }`}
            >
              সব শব্দ ({allVocab.length})
            </button>
            <button
              onClick={() => setFilterType('unlearned')}
              className={`px-3.5 py-1.5 rounded-full border transition ${
                filterType === 'unlearned'
                  ? 'bg-[#558b2f] text-white border-[#558b2f] shadow-2xs font-bold'
                  : 'bg-white text-slate-700 border-[#e2dcd0] hover:bg-[#faf7f0]'
              }`}
            >
              শেখা বাকি ({allVocab.length - masteredIds.size})
            </button>
            <button
              onClick={() => setFilterType('mastered')}
              className={`px-3.5 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
                filterType === 'mastered'
                  ? 'bg-[#558b2f] text-white border-[#558b2f] shadow-2xs font-bold'
                  : 'bg-white text-slate-700 border-[#e2dcd0] hover:bg-[#faf7f0]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>শেখা হয়েছে ({masteredIds.size})</span>
            </button>
            <button
              onClick={() => setFilterType('bookmarked')}
              className={`px-3.5 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
                filterType === 'bookmarked'
                  ? 'bg-[#f6c445] text-[#78350f] font-bold border-[#eab308] shadow-2xs'
                  : 'bg-white text-slate-700 border-[#e2dcd0] hover:bg-[#faf7f0]'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>সংরক্ষিত ({bookmarkedIds.size})</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToBook && (
              <button
                onClick={onNavigateToBook}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f4f9ea] hover:bg-[#e9f4d7] text-[#558b2f] border border-[#d6eab9] text-xs font-bengali font-semibold transition cursor-pointer shadow-2xs"
                title="সম্পূর্ণ শব্দকোষ PDF বই আকারে দেখুন ও ডাউনলোড করুন"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF বই ডাউনলোড</span>
              </button>
            )}
            <div className="text-slate-500 text-xs font-bengali">
              প্রদর্শিত হচ্ছে: <span className="font-bold text-slate-900 font-mono">{filteredVocab.length}</span> টি শব্দ
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
        <div className="bg-white rounded-2xl border border-[#e8e2d4] shadow-xs divide-y divide-[#f0eae0] overflow-hidden">
          {filteredVocab.map((item) => {
            const isBookmarked = bookmarkedIds.has(item.id);
            const isMastered = masteredIds.has(item.id);
            const isExpanded = expandedRowId === item.id;

            return (
              <div 
                key={item.id}
                className={`transition-colors ${
                  isExpanded ? 'bg-[#faf8f5]' : 'hover:bg-[#faf8f5]/60'
                }`}
              >
                <div 
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  onClick={() => toggleRowExpand(item.id)}
                >
                  
                  {/* Left Column: Kanji, Furigana & Meaning */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    
                    {/* Index Number */}
                    <span className="text-xs font-mono text-slate-400 w-8 shrink-0 pt-1 sm:pt-0">
                      #{item.id}
                    </span>

                    {/* Kanji / Hiragana */}
                    <div className="min-w-[140px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl sm:text-2xl font-bold font-japanese text-slate-900">
                          {item.kanji}
                        </span>
                        {/* Normal Audio */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakJapanese(item.hiragana || item.kanji, { slow: false });
                          }}
                          className="p-1 rounded-lg bg-[#f4f9ea] hover:bg-[#e9f4d7] text-[#558b2f] border border-[#d6eab9] transition"
                          title="স্বাভাবিক স্পষ্ট উচ্চারণ শুনুন"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        {/* Slow Audio */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakJapanese(item.hiragana || item.kanji, { slow: true });
                          }}
                          className="p-1 rounded-lg bg-[#fef9ee] hover:bg-[#fef3d6] text-[#b45309] border border-[#fde68a] transition"
                          title="ধীর ও স্পষ্ট উচ্চারণ (0.65x)"
                        >
                          <Turtle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-[#558b2f] font-semibold font-japanese">
                        {item.hiragana}
                        <span className="text-slate-400 font-mono ml-1.5 font-normal">
                          [{item.romaji}]
                        </span>
                      </div>
                    </div>

                    {/* Bengali Translation & Bangla Audio */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-base sm:text-lg font-bold font-bengali text-slate-900">
                          {item.bn}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakBangla(item.bn);
                          }}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition text-[10px] flex items-center gap-0.5"
                          title="বাংলা অর্থ শুনুন"
                        >
                          <Volume2 className="w-3 h-3 text-[#558b2f]" />
                          <span className="font-bengali">BN</span>
                        </button>
                      </div>
                      <span className="inline-block text-[11px] text-slate-500 font-bengali px-2 py-0.5 bg-[#faf8f5] border border-[#e8e2d4] rounded-md mt-0.5">
                        {item.category}
                      </span>
                    </div>

                  </div>

                  {/* Right Column: Actions (Bookmark, Mastered, Expand) */}
                  <div className="flex items-center justify-end gap-1.5 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    
                    {/* Mastered Toggle */}
                    <button
                      onClick={() => onToggleMastered(item.id)}
                      className={`p-2 rounded-xl border transition ${
                        isMastered
                          ? 'bg-[#f4f9ea] text-[#3f6e1f] border-[#cce4ab]'
                          : 'bg-white text-slate-400 hover:text-[#558b2f] border-[#e5dec9]'
                      }`}
                      title={isMastered ? 'শেখা হয়েছে' : 'শেখা শেষ হিসেবে চিহ্নিত করুন'}
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#558b2f]" />
                    </button>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => handleBookmarkToggle(item.id)}
                      className={`p-2 rounded-xl border transition ${
                        isBookmarked
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-white text-slate-400 hover:text-amber-500 border-[#e5dec9]'
                      }`}
                      title="বুকমার্ক করুন"
                    >
                      <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>

                    {/* Accordion Expand Button */}
                    <button
                      onClick={() => toggleRowExpand(item.id)}
                      className="p-2 rounded-xl bg-white text-slate-400 hover:text-slate-800 border border-[#e5dec9] transition"
                      title="বিস্তারিত বাক্য দেখুন"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                </div>

                {/* Expanded Details: Example Sentences & Furigana */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-4 pt-1 text-sm bg-[#faf8f5] border-t border-[#f0eae0] animate-in fade-in duration-150">
                    <div className="bg-white p-3.5 rounded-xl border border-[#e8e2d4] space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#558b2f] font-semibold font-bengali">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          ব্যবহারিক উদাহরণ বাক্য (Example Sentence):
                        </span>
                        {item.exampleJp && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => speakJapanese(item.exampleJp!, { slow: false })}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#f4f9ea] hover:bg-[#e9f4d7] text-[#558b2f] border border-[#d6eab9] transition text-xs font-mono"
                              title="জাপানি বাক্য শুনুন"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>JP</span>
                            </button>
                            <button
                              onClick={() => speakJapanese(item.exampleJp!, { slow: true })}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#fef9ee] hover:bg-[#fef3d6] text-[#b45309] border border-[#fde68a] transition text-xs"
                              title="ধীরে জাপানি বাক্য শুনুন (Slow)"
                            >
                              <Turtle className="w-3 h-3" />
                              <span>ধীরে</span>
                            </button>
                            {item.exampleBn && (
                              <button
                                onClick={() => speakBangla(item.exampleBn!)}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition text-xs font-bengali"
                                title="বাংলা অর্থ শুনুন"
                              >
                                <Volume2 className="w-3 h-3 text-[#558b2f]" />
                                <span>বাংলা</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {item.exampleJp ? (
                        <div>
                          <p className="text-base font-japanese text-slate-900 font-medium">
                            {item.exampleFurigana || item.exampleJp}
                          </p>
                          {item.exampleRomaji && (
                            <p className="text-xs font-mono text-slate-400">
                              {item.exampleRomaji}
                            </p>
                          )}
                          <p className="text-sm font-bengali text-slate-600 mt-1">
                            {item.exampleBn}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-bengali">
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
        <div className="mt-8 pt-4 border-t border-[#e8e2d4] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-bengali">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#558b2f]" />
            <span>মোট {allVocab.length}টির মধ্যে {filteredVocab.length}টি শব্দ প্রদর্শিত হচ্ছে</span>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#e5dec9] transition shadow-2xs active:scale-95"
            title="উপরে যান"
          >
            <ArrowUp className="w-3.5 h-3.5 text-[#558b2f]" />
            <span>উপরে স্ক্রোল করুন (Back to Top)</span>
          </button>
        </div>
      )}

    </div>
  );
};
