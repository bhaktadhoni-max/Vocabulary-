import React, { useState, useMemo, useCallback, useRef } from 'react';
import { 
  Search, 
  LayoutGrid, 
  List, 
  Volume2, 
  Star, 
  Filter, 
  RotateCcw, 
  BookMarked,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';
import { N4VocabItem, N4Status } from '../../data/n4/types';
import { N4_CATEGORIES } from '../../data/n4';
import { speakJapanese, stopAllSpeech } from '../../utils/sound';

interface N4GridViewProps {
  items: N4VocabItem[];
  favoriteIds: Set<number>;
  statusMap: Map<number, N4Status>;
  dueItemIds: Set<number>;
  onToggleFavorite: (id: number) => void;
  onSelectWordForStudy?: (item: N4VocabItem) => void;
}

export const N4GridView: React.FC<N4GridViewProps> = ({
  items,
  favoriteIds,
  statusMap,
  dueItemIds,
  onToggleFavorite,
  onSelectWordForStudy
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'learning' | 'mastered' | 'favorites' | 'due'>('all');
  const [lessonFilter, setLessonFilter] = useState<number | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeSpeakingId, setActiveSpeakingId] = useState<number | null>(null);

  // Audio debounce
  const lastAudioRef = useRef<number>(0);

  const handleSpeak = useCallback((item: N4VocabItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastAudioRef.current < 450) return;
    lastAudioRef.current = now;

    stopAllSpeech();
    setActiveSpeakingId(item.id);
    speakJapanese(item.kanji || item.hiragana, {
      onEnd: () => setActiveSpeakingId(null),
      onError: () => setActiveSpeakingId(null),
    });
  }, []);

  // Multi-dimensional instant search & filtering
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return items.filter((item) => {
      // 1. Status Filter
      const status = statusMap.get(item.id) || 'new';
      if (statusFilter === 'favorites' && !favoriteIds.has(item.id)) return false;
      if (statusFilter === 'due' && !dueItemIds.has(item.id)) return false;
      if (statusFilter === 'mastered' && status !== 'mastered') return false;
      if (statusFilter === 'learning' && status !== 'learning' && status !== 'review') return false;
      if (statusFilter === 'new' && status !== 'new') return false;

      // 2. Lesson Filter
      if (lessonFilter !== 'all' && item.lesson !== lessonFilter) return false;

      // 3. Category Filter
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'expressions') {
          if (item.categoryKey !== 'expressions' && item.categoryKey !== 'others') return false;
        } else if (item.categoryKey !== categoryFilter) {
          return false;
        }
      }

      // 4. Instant Search Filter (Japanese, Hiragana, Romaji, Bangla, Lesson)
      if (q) {
        const matchesKanji = item.kanji && item.kanji.toLowerCase().includes(q);
        const matchesKana = item.hiragana && item.hiragana.toLowerCase().includes(q);
        const matchesRomaji = item.romaji && item.romaji.toLowerCase().includes(q);
        const matchesBn = item.bn && item.bn.toLowerCase().includes(q);
        const matchesLesson = `lesson ${item.lesson}`.includes(q) || `l${item.lesson}` === q || item.lesson.toString() === q;
        if (!matchesKanji && !matchesKana && !matchesRomaji && !matchesBn && !matchesLesson) {
          return false;
        }
      }

      return true;
    });
  }, [items, searchQuery, statusFilter, lessonFilter, categoryFilter, statusMap, favoriteIds, dueItemIds]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* SEARCH & CONTROLS CONTAINER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] space-y-4">
        
        {/* Row 1: Search Bar & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Instant Search Bar */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737885] dark:text-[#8d97ab]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="জাপানি, হিরাগানা, রোমাজি, বাংলা অর্থ বা লেসন নং দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] text-sm font-bengali text-[#191c21] dark:text-[#f6f8fb] placeholder-[#737885] dark:placeholder-[#8d97ab] focus:outline-hidden focus:border-[#c23b22] dark:focus:border-[#e0452d]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#737885] hover:text-[#191c21] dark:hover:text-white"
              >
                মুছুন
              </button>
            )}
          </div>

          {/* View Mode Toggle: Grid vs List */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#f5f2eb] dark:bg-[#1a1e2a] self-end sm:self-auto shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-[#191c21] dark:bg-white text-white dark:text-[#0d0f14] shadow-xs font-bold'
                  : 'text-[#474b54] dark:text-[#cbd3e1] hover:text-[#191c21]'
              }`}
              title="গ্রিড ভিউ"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline font-bengali">গ্রিড</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-[#191c21] dark:bg-white text-white dark:text-[#0d0f14] shadow-xs font-bold'
                  : 'text-[#474b54] dark:text-[#cbd3e1] hover:text-[#191c21]'
              }`}
              title="লিস্ট ভিউ"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline font-bengali">লিস্ট</span>
            </button>
          </div>

        </div>

        {/* Row 2: Status & Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#e8e3d8] dark:border-[#222735]">
          
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'সকল শব্দ' },
              { id: 'new', label: 'নতুন' },
              { id: 'learning', label: 'শিখছেন' },
              { id: 'mastered', label: 'আয়ত্ত করা' },
              { id: 'favorites', label: 'সংরক্ষিত ★' },
              { id: 'due', label: 'রিভিউ উপযোগী' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setStatusFilter(pill.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer font-bengali whitespace-nowrap ${
                  statusFilter === pill.id
                    ? 'bg-[#c23b22] dark:bg-[#e0452d] text-white shadow-xs font-bold'
                    : 'bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#474b54] dark:text-[#cbd3e1] hover:bg-[#ede8df] dark:hover:bg-[#222738]'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Lesson & Category Dropdowns */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Lesson Selector */}
            <select
              value={lessonFilter}
              onChange={(e) => setLessonFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-xs font-semibold rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] px-2.5 py-1.5 text-[#191c21] dark:text-[#f6f8fb] font-bengali cursor-pointer focus:outline-hidden"
            >
              <option value="all">সকল লেসন (26–50)</option>
              {Array.from({ length: 25 }, (_, i) => i + 26).map(l => (
                <option key={l} value={l}>লেসন {l}</option>
              ))}
            </select>

            {/* Category Selector */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold rounded-xl bg-[#f5f2eb] dark:bg-[#1a1e2a] border border-[#e8e3d8] dark:border-[#222735] px-2.5 py-1.5 text-[#191c21] dark:text-[#f6f8fb] font-bengali cursor-pointer focus:outline-hidden"
            >
              <option value="all">সব ক্যাটাগরি</option>
              <option value="verbs">ক্রিয়া (動詞)</option>
              <option value="nouns">বিশেষ্য (名詞)</option>
              <option value="i_adj">ই-বিশেষণ (い形)</option>
              <option value="na_adj">না-বিশেষণ (な形)</option>
              <option value="adverbs">ক্রিয়া-বিশেষণ (副詞)</option>
              <option value="expressions">ভাবপ্রকাশ ও কেইগো</option>
            </select>
          </div>

        </div>

      </div>

      {/* RESULT COUNT */}
      <div className="flex items-center justify-between px-2 text-xs text-[#737885] dark:text-[#8d97ab] font-bengali">
        <span>মোট <strong>{filteredItems.length}</strong>টি শব্দ প্রদর্শিত হচ্ছে</span>
        {(searchQuery || statusFilter !== 'all' || lessonFilter !== 'all' || categoryFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setLessonFilter('all');
              setCategoryFilter('all');
            }}
            className="text-[#c23b22] dark:text-[#e0452d] font-bold hover:underline cursor-pointer"
          >
            ফিল্টার রিসেট করুন
          </button>
        )}
      </div>

      {/* ================= GRID VIEW ================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredItems.map((item) => {
            const isFav = favoriteIds.has(item.id);
            const status = statusMap.get(item.id) || 'new';

            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] hover:border-[#c5a880]/60 dark:hover:border-[#c5a880]/60 shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Lesson Badge, Category & Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735]">
                        L{item.lesson}
                      </span>
                      <span className="text-[10px] text-[#737885] dark:text-[#8d97ab] font-bengali">
                        {item.partOfSpeech.split(' ')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Audio Button */}
                      <button
                        onClick={(e) => handleSpeak(item, e)}
                        className={`p-1.5 rounded-xl text-[#737885] hover:text-[#c23b22] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a] transition cursor-pointer ${
                          activeSpeakingId === item.id ? 'text-[#c23b22] ring-2 ring-[#c23b22] dark:ring-[#e0452d] animate-pulse' : ''
                        }`}
                        title="উচ্চারণ শুনুন"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {/* Favorite Button */}
                      <button
                        onClick={() => onToggleFavorite(item.id)}
                        className={`p-1.5 rounded-xl transition cursor-pointer ${
                          isFav 
                            ? 'text-amber-500 fill-amber-500' 
                            : 'text-[#9ea3b0] dark:text-[#5d677d] hover:text-amber-400'
                        }`}
                        title="সংরক্ষণ করুন"
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Japanese Kanji + Kana Reading */}
                  <div className="mb-2">
                    <div className="text-xs font-japanese text-[#c23b22] dark:text-[#e0452d] font-semibold">
                      {item.hiragana}
                    </div>
                    <h3 className="text-2xl font-bold font-japanese text-[#191c21] dark:text-[#f6f8fb] tracking-tight leading-snug">
                      {item.kanji || item.hiragana}
                    </h3>
                  </div>

                  {/* Bangla Meaning */}
                  <p className="text-sm font-bold font-bengali text-[#474b54] dark:text-[#cbd3e1] line-clamp-2 mb-2">
                    {item.bn}
                  </p>
                </div>

                {/* Bottom Context / Status */}
                <div className="pt-3 border-t border-[#e8e3d8] dark:border-[#222735] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-[#966b1e] dark:text-[#d4af37]">
                    {item.romaji}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xl uppercase ${
                    status === 'mastered'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25'
                      : status === 'learning' || status === 'review'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25'
                      : 'bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#8d97ab] border border-[#e8e3d8] dark:border-[#222735]'
                  }`}>
                    {status}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ================= LIST VIEW ================= */}
      {viewMode === 'list' && (
        <div className="rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] shadow-[0_2px_10px_-2px_rgba(25,28,33,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] divide-y divide-[#e8e3d8] dark:divide-[#222735] overflow-hidden">
          {filteredItems.map((item) => {
            const isFav = favoriteIds.has(item.id);
            const status = statusMap.get(item.id) || 'new';

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#f5f2eb]/40 dark:hover:bg-[#1a1e2a]/40 transition"
              >
                {/* Left: Japanese & Meaning */}
                <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
                  <span className="w-10 sm:w-12 text-center py-1 rounded-xl text-xs font-mono font-bold bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#191c21] dark:text-[#f6f8fb] border border-[#e8e3d8] dark:border-[#222735] shrink-0">
                    L{item.lesson}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-bold font-japanese text-[#191c21] dark:text-[#f6f8fb] truncate">
                        {item.kanji || item.hiragana}
                      </span>
                      <span className="text-xs text-[#c23b22] dark:text-[#e0452d] font-japanese truncate">
                        ({item.hiragana})
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm font-bengali text-[#474b54] dark:text-[#cbd3e1] truncate mt-0.5">
                      {item.bn}
                    </div>
                  </div>
                </div>

                {/* Right: Status, Audio & Favorite */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-xl uppercase ${
                    status === 'mastered'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : status === 'learning' || status === 'review'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      : 'bg-[#f5f2eb] dark:bg-[#1a1e2a] text-[#737885] dark:text-[#8d97ab]'
                  }`}>
                    {status}
                  </span>

                  {/* Audio */}
                  <button
                    onClick={(e) => handleSpeak(item, e)}
                    className="p-2 rounded-xl text-[#737885] hover:text-[#c23b22] hover:bg-[#f5f2eb] dark:hover:bg-[#1a1e2a] transition cursor-pointer"
                    title="উচ্চারণ শুনুন"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Favorite */}
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      isFav 
                        ? 'text-amber-500 fill-amber-500' 
                        : 'text-[#9ea3b0] dark:text-[#5d677d] hover:text-amber-400'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#141720] border border-[#e8e3d8] dark:border-[#222735] font-bengali">
          <p className="text-base font-bold text-[#191c21] dark:text-[#f6f8fb] mb-1">
            কোনো শব্দ পাওয়া যায়নি
          </p>
          <p className="text-xs text-[#737885] dark:text-[#8d97ab]">
            অনুগ্রহ করে অন্য শব্দ বা ফিল্টার দিয়ে চেষ্টা করুন।
          </p>
        </div>
      )}

    </div>
  );
};
