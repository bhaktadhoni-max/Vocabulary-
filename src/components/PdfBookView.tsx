import React, { useState, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  Download, 
  Printer, 
  Search, 
  FileText, 
  CheckSquare, 
  Eye, 
  EyeOff, 
  Volume2, 
  ChevronDown, 
  Sparkles, 
  SlidersHorizontal,
  Layers,
  ArrowUp,
  Bookmark,
  Share2,
  CheckCircle2,
  ListFilter,
  AlertCircle
} from 'lucide-react';
import { VocabItem, CategoryInfo } from '../types';
import { CATEGORIES } from '../data/categories';
import { speakJapanese, speakBangla, playBookmarkSound } from '../utils/sound';
import { 
  downloadElementAsPdf, 
  downloadOfflineHtmlBook, 
  PdfGenerationProgress 
} from '../utils/pdfGenerator';

interface PdfBookViewProps {
  allVocab: VocabItem[];
  bookmarkedIds: Set<number>;
  masteredIds: Set<number>;
  onToggleBookmark: (id: number) => void;
  onToggleMastered: (id: number) => void;
  onOpenVoiceSettings?: () => void;
}

export const PdfBookView: React.FC<PdfBookViewProps> = ({
  allVocab,
  bookmarkedIds,
  masteredIds,
  onToggleBookmark,
  onToggleMastered,
  onOpenVoiceSettings,
}) => {
  // Navigation & Filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Display Options
  const [showRomaji, setShowRomaji] = useState<boolean>(true);
  const [showExamples, setShowExamples] = useState<boolean>(true);
  const [showCheckboxes, setShowCheckboxes] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<PdfGenerationProgress | null>(null);
  const [pdfDownloadScope, setPdfDownloadScope] = useState<'current' | 'all'>('current');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

  const bookContainerRef = useRef<HTMLDivElement>(null);

  // Group vocabulary by category
  const groupedCategories = useMemo(() => {
    const map: Record<string, VocabItem[]> = {};
    CATEGORIES.forEach((cat) => {
      if (cat.key !== 'all') {
        map[cat.key] = [];
      }
    });

    allVocab.forEach((item) => {
      if (!map[item.categoryKey]) {
        map[item.categoryKey] = [];
      }
      // Apply search filter if query is present
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesKanji = item.kanji.toLowerCase().includes(q);
        const matchesHiragana = item.hiragana.toLowerCase().includes(q);
        const matchesRomaji = item.romaji.toLowerCase().includes(q);
        const matchesBn = item.bn.toLowerCase().includes(q);
        const matchesEx = item.exampleBn?.toLowerCase().includes(q);
        if (matchesKanji || matchesHiragana || matchesRomaji || matchesBn || matchesEx) {
          map[item.categoryKey].push(item);
        }
      } else {
        map[item.categoryKey].push(item);
      }
    });

    return map;
  }, [allVocab, searchQuery]);

  // Active category list to render
  const visibleCategories = useMemo(() => {
    if (selectedCategory !== 'all') {
      const cat = CATEGORIES.find((c) => c.key === selectedCategory);
      return cat && (groupedCategories[cat.key]?.length || 0) > 0 ? [cat] : [];
    }
    return CATEGORIES.filter((c) => c.key !== 'all' && (groupedCategories[c.key]?.length || 0) > 0);
  }, [selectedCategory, groupedCategories]);

  const totalVisibleWords = useMemo(() => {
    return visibleCategories.reduce((acc, cat) => acc + (groupedCategories[cat.key]?.length || 0), 0);
  }, [visibleCategories, groupedCategories]);

  // Handle PDF Generation
  const handleStartPdfDownload = async (scope: 'current' | 'all') => {
    setIsDownloadModalOpen(false);
    setIsGeneratingPdf(true);

    try {
      const targetId = scope === 'all' && selectedCategory !== 'all' 
        ? 'printable-pdf-book' 
        : 'printable-pdf-book';

      // Temporarily clear category if user chose "all" while a filter was active
      const originalCat = selectedCategory;
      if (scope === 'all' && selectedCategory !== 'all') {
        setSelectedCategory('all');
        // Give state a brief tick to re-render all chapters in DOM
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const filename = scope === 'all' 
        ? 'JLPT_N5_Full_Vocabulary_Book.pdf' 
        : `JLPT_N5_Vocabulary_${selectedCategory}.pdf`;

      await downloadElementAsPdf(targetId, filename, (progress) => {
        setPdfProgress(progress);
      });

      // Restore category filter if needed
      if (scope === 'all' && originalCat !== 'all') {
        setSelectedCategory(originalCat);
      }

      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfProgress(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      // Keep error message open so user can see it and use alternate print/download
    }
  };

  // Direct native print to PDF
  const handlePrintToPdf = () => {
    window.print();
  };

  // Offline HTML Book Download
  const handleDownloadOfflineBook = () => {
    downloadOfflineHtmlBook(CATEGORIES, allVocab);
  };

  const scrollToSection = (chapterKey: string) => {
    const el = document.getElementById(`book-chapter-${chapterKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 font-sans">
      
      {/* Top Floating Action & Configuration Hub (Hidden when printing) */}
      <div className="no-print bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/40 mb-8 sticky top-20 z-30">
        
        {/* Row 1: Header Titles and Main Download Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <BookOpen className="w-4 h-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white font-bengali">
                JLPT N5 সম্পূর্ণ শব্দকোষ ও বই (PDF Book Edition)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-bengali">
              সম্পূর্ণ ৮৩৮টি শব্দ, কাঞ্জি, হিরাগানা, রোমাজি ও বাংলা অনুবাদ সংবলিত প্রকাশনা মানসম্পন্ন ডিজিটাল বই
            </p>
          </div>

          {/* Primary Action Button Cluster */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Download PDF Dropdown/Trigger */}
            <button
              id="btn-download-pdf-modal"
              onClick={() => setIsDownloadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-bengali"
              title="পিডিএফ ফাইল ডাউনলোড করুন"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>ডাউনলোড PDF বই</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {/* Direct Vector Print / Save-as-PDF */}
            <button
              id="btn-print-to-pdf"
              onClick={handlePrintToPdf}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 font-medium text-xs sm:text-sm transition-all cursor-pointer font-bengali"
              title="সরাসরি প্রিন্ট বা ব্রাউজার থেকে PDF হিসেবে সেভ করুন"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>প্রিন্ট / সেভ PDF</span>
            </button>

            {/* Offline Standalone HTML Book */}
            <button
              id="btn-download-offline-html"
              onClick={handleDownloadOfflineBook}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 font-medium text-xs sm:text-sm transition-all cursor-pointer font-bengali"
              title="ইন্টারনেট ছাড়া যেকোনো ব্রাউজারে পড়ার অফলাইন বই ফাইল"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">অফলাইন ফাইল (.html)</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search, Category Filter, and View Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-4">
          
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-book-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="বইয়ের মধ্যে শব্দ খুঁজুন (কাঞ্জি, রোমাজি, বাংলা)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-bengali"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Chapter / Category Selector */}
          <div className="md:col-span-4 relative">
            <select
              id="select-book-chapter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 font-bengali cursor-pointer"
            >
              <option value="all">📖 সম্পূর্ণ বই (সকল ২৪টি অধ্যায় - ৮৩৮টি শব্দ)</option>
              {CATEGORIES.filter((c) => c.key !== 'all').map((cat, i) => (
                <option key={cat.key} value={cat.key}>
                  {i + 1}. {cat.icon} {cat.nameBn} ({cat.count} টি)
                </option>
              ))}
            </select>
          </div>

          {/* Display & Reading Toggles */}
          <div className="md:col-span-4 flex items-center justify-end gap-2 flex-wrap text-xs">
            
            {/* View Mode Toggle */}
            <div className="flex rounded-lg bg-slate-950/80 border border-slate-800 p-0.5">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1.5 rounded-md font-bengali transition ${
                  viewMode === 'cards' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="কার্ড লেআউট"
              >
                বই স্টাইল
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 rounded-md font-bengali transition ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="ঘন টেবিল লেআউট"
              >
                ছক স্টাইল
              </button>
            </div>

            {/* Toggle Romaji */}
            <button
              onClick={() => setShowRomaji(!showRomaji)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition ${
                showRomaji 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
                  : 'bg-slate-950/60 text-slate-500 border-slate-800'
              }`}
              title="রোমাজি অন/অফ"
            >
              Romaji
            </button>

            {/* Toggle Examples */}
            <button
              onClick={() => setShowExamples(!showExamples)}
              className={`px-2.5 py-1.5 rounded-lg border font-bengali text-xs transition ${
                showExamples 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                  : 'bg-slate-950/60 text-slate-500 border-slate-800'
              }`}
              title="উদাহরণ বাক্য প্রদর্শন"
            >
              উদাহরণ
            </button>

            {/* Font Size Adjust */}
            <div className="flex rounded-lg bg-slate-950/80 border border-slate-800 p-0.5">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-1 rounded text-xs ${fontSize === 'sm' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-1 rounded text-xs ${fontSize === 'base' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-1 rounded text-xs ${fontSize === 'lg' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
              >
                A+
              </button>
            </div>

          </div>
        </div>

        {/* Quick Chapter Chips Bar */}
        {selectedCategory === 'all' && !searchQuery && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-slate-800/60 pb-1 scrollbar-none text-xs">
            <span className="text-slate-500 font-bengali whitespace-nowrap pl-1 pr-2">
              দ্রুত অধ্যায়ে যান:
            </span>
            {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
              <button
                key={cat.key}
                onClick={() => scrollToSection(cat.key)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 whitespace-nowrap text-xs transition flex items-center gap-1"
              >
                <span>{cat.icon}</span>
                <span className="font-bengali">{cat.nameBn.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* THE ACTUAL PRINTABLE & READABLE BOOK CANVAS (#printable-pdf-book) */}
      {/* ========================================================================= */}
      <div 
        ref={bookContainerRef}
        id="printable-pdf-book"
        className="bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-12 transition-all duration-300"
      >
        
        {/* BOOK COVER PAGE */}
        <div className="book-cover-page border-4 border-double border-slate-300 rounded-2xl p-8 sm:p-12 mb-12 text-center bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-900 font-mono font-bold text-xs tracking-wider uppercase mb-6 border border-indigo-200">
            <span>JLPT N5 OFFICIAL STUDY COMPANION</span>
            <span>•</span>
            <span>বাংলা সংস্করণ</span>
          </div>

          <div className="font-japanese text-3xl sm:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            日本語能力試験 N5 単語集
          </div>

          <h1 className="font-bengali text-2xl sm:text-4xl font-bold text-blue-800 mb-4 tracking-tight leading-tight">
            জাপানি-বাংলা সম্পূর্ণ শব্দকোষ ও শিক্ষা সহায়িকা
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-bengali max-w-2xl mx-auto mb-8 leading-relaxed">
            JLPT N5 পরীক্ষার জন্য প্রয়োজনীয় সম্পূর্ণ ৮৩৮টি জাপানি শব্দ, হিরাগানা-কাঞ্জি-রোমাজি লিখন, নির্ভুল বাংলা অর্থ, পদবিন্যাস ও বাস্তব ব্যবহারিক উদাহরণ বাক্যসহ।
          </p>

          {/* Key Book Stats Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto mb-10 text-left">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-bengali block">মোট শব্দভাণ্ডার</span>
              <strong className="text-xl font-bold text-slate-900 font-mono">৮৩৮ টি</strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-bengali block">বিষয়ভিত্তিক অধ্যায়</span>
              <strong className="text-xl font-bold text-slate-900 font-mono">২৪ টি</strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-bengali block">উদাহরণ বাক্য</span>
              <strong className="text-xl font-bold text-slate-900 font-mono">১০০%</strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-bengali block">JLPT লেভেল</span>
              <strong className="text-xl font-bold text-indigo-700 font-mono">N5 (মৌলিক)</strong>
            </div>
          </div>

          {/* Quick Study Guidelines Box on Cover */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-6 border-t border-slate-200 text-xs text-slate-600 font-bengali">
            <div className="p-3 bg-slate-100/80 rounded-lg">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span>🇯🇵</span> বর্ণমালার নির্দেশিকা
              </h4>
              <p>প্রতিটি কাঞ্জি শব্দের ওপরে বা পাশে হিরাগানা রিডিং এবং রোমাজি উচ্চারণ স্পষ্টভাবে প্রদান করা হয়েছে।</p>
            </div>
            <div className="p-3 bg-slate-100/80 rounded-lg">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span>📝</span> ব্যবহারিক বাক্য
              </h4>
              <p>শব্দগুলো ব্যাকরণ ও দৈনন্দিন কথপোকথনে কীভাবে ব্যবহৃত হয় তা বুঝতে প্রতিটি শব্দের উদাহরণ বাক্য পড়ুন।</p>
            </div>
            <div className="p-3 bg-slate-100/80 rounded-lg">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span>✅</span> চেকবক্স ব্যবহার
              </h4>
              <p>প্রিন্ট করার পর যেসব শব্দ মুখস্ত সম্পন্ন হবে সেগুলোতে টিক দিয়ে অগ্রগতি সহজে ট্র্যাক করুন।</p>
            </div>
          </div>

        </div>

        {/* TABLE OF CONTENTS (সূচিপত্র) */}
        {selectedCategory === 'all' && (
          <div 
            id="book-toc-section" 
            className="book-toc-section mb-14 pb-8 border-b-2 border-slate-200 page-break-inside"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-bengali flex items-center gap-2">
                <span>📑 সূচিপত্র (Table of Contents)</span>
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                24 Chapters • 838 Total Words
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-bengali">
              {CATEGORIES.filter((c) => c.key !== 'all').map((cat, idx) => (
                <a
                  key={cat.key}
                  href={`#book-chapter-${cat.key}`}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition text-slate-700 hover:text-blue-900 group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 text-slate-400 font-mono text-[11px]">{idx + 1}.</span>
                    <span className="text-sm">{cat.icon}</span>
                    <span className="font-medium truncate">{cat.nameBn}</span>
                  </div>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-800">
                    {cat.count}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE CHAPTERS & VOCABULARY SECTIONS */}
        <div className="space-y-12">
          {visibleCategories.map((category, catIndex) => {
            const items = groupedCategories[category.key] || [];
            if (items.length === 0) return null;

            return (
              <section
                key={category.key}
                id={`book-chapter-${category.key}`}
                className="book-chapter-section pt-4 page-break-before"
              >
                
                {/* Chapter Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-slate-900 text-white rounded-xl mb-6 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl shadow-xs">
                      {category.icon}
                    </div>
                    <div>
                      <div className="text-xs text-cyan-300 font-mono font-semibold">
                        CHAPTER {catIndex + 1} • {category.nameJp}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold font-bengali">
                        {category.nameBn}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                      {items.length} টি শব্দ
                    </span>
                  </div>
                </div>

                {/* VOCABULARY ITEMS: CARD VIEW */}
                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => {
                      const isBookmarked = bookmarkedIds.has(item.id);
                      const isMastered = masteredIds.has(item.id);

                      return (
                        <div
                          key={item.id}
                          className="book-item-card border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition-shadow hover:shadow-md flex flex-col justify-between"
                        >
                          {/* Item Header: Kanji, Hiragana & Action buttons */}
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-baseline gap-2.5 flex-wrap">
                                {/* Kanji */}
                                <span className={`font-japanese font-bold text-slate-900 tracking-tight leading-none ${
                                  fontSize === 'lg' ? 'text-2xl sm:text-3xl' : fontSize === 'sm' ? 'text-xl' : 'text-2xl'
                                }`}>
                                  {item.kanji}
                                </span>

                                {/* Hiragana */}
                                <span className="font-japanese font-semibold text-blue-600 text-sm sm:text-base">
                                  {item.hiragana}
                                </span>

                                {/* Romaji */}
                                {showRomaji && (
                                  <span className="text-xs text-slate-500 font-mono italic">
                                    /{item.romaji}/
                                  </span>
                                )}
                              </div>

                              {/* Top right: Audio & ID & Checkbox */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {/* Audio speak button (Web mode only) */}
                                <button
                                  type="button"
                                  onClick={() => speakJapanese(item.hiragana)}
                                  className="no-print p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 transition"
                                  title="জাপানি উচ্চারণ শুনুন"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>

                                {/* ID Badge */}
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                  #{item.id}
                                </span>

                                {/* Study Print Checkbox */}
                                {showCheckboxes && (
                                  <div 
                                    className="no-print ml-1 cursor-pointer"
                                    onClick={() => onToggleMastered(item.id)}
                                    title="মুখস্ত সম্পন্ন মার্ক করুন"
                                  >
                                    <input 
                                      type="checkbox"
                                      checked={isMastered}
                                      onChange={() => {}}
                                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 cursor-pointer"
                                    />
                                  </div>
                                )}
                                {/* Print-only static checkbox box */}
                                <div className="hidden print:inline-block w-4 h-4 border border-slate-400 rounded-xs ml-1" />
                              </div>
                            </div>

                            {/* Bengali Meaning */}
                            <div className="mb-3">
                              <span className={`font-bengali font-bold text-slate-900 ${
                                fontSize === 'lg' ? 'text-base' : fontSize === 'sm' ? 'text-xs' : 'text-sm'
                              }`}>
                                {item.bn}
                              </span>
                            </div>

                            {/* Example Sentence Box */}
                            {showExamples && item.exampleJp && (
                              <div className="p-2.5 rounded-lg bg-slate-50 border-l-3 border-blue-500 text-xs font-sans space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="font-japanese text-slate-800 font-medium">
                                    {item.exampleJp}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => speakJapanese(item.exampleJp || '')}
                                    className="no-print p-1 text-slate-400 hover:text-blue-600 transition"
                                    title="বাক্যের উচ্চারণ শুনুন"
                                  >
                                    <Volume2 className="w-3 h-3" />
                                  </button>
                                </div>

                                {showRomaji && item.exampleRomaji && (
                                  <div className="text-[11px] text-slate-500 font-mono italic">
                                    {item.exampleRomaji}
                                  </div>
                                )}

                                <div className="font-bengali text-slate-700 text-xs">
                                  {item.exampleBn}
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* VOCABULARY ITEMS: COMPACT TABLE VIEW */
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                          <th className="p-2.5 w-10 text-center font-mono">#</th>
                          <th className="p-2.5 font-bengali font-semibold">কাঞ্জি ও হিরাগানা</th>
                          {showRomaji && <th className="p-2.5 font-mono font-semibold">রোমাজি</th>}
                          <th className="p-2.5 font-bengali font-semibold">বাংলা অর্থ</th>
                          {showExamples && <th className="p-2.5 font-bengali font-semibold">উদাহরণ বাক্য</th>}
                          <th className="p-2.5 w-12 text-center font-bengali">শিখা</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5 text-center font-mono text-slate-400 text-[11px]">
                              {item.id}
                            </td>
                            <td className="p-2.5">
                              <div className="font-japanese font-bold text-base text-slate-900">
                                {item.kanji}
                              </div>
                              <div className="font-japanese font-medium text-blue-600 text-xs">
                                {item.hiragana}
                              </div>
                            </td>
                            {showRomaji && (
                              <td className="p-2.5 font-mono text-slate-600 italic text-xs">
                                {item.romaji}
                              </td>
                            )}
                            <td className="p-2.5 font-bengali font-semibold text-slate-800 text-sm">
                              {item.bn}
                            </td>
                            {showExamples && (
                              <td className="p-2.5">
                                {item.exampleJp ? (
                                  <div className="space-y-0.5">
                                    <div className="font-japanese text-slate-800 text-xs font-medium">
                                      {item.exampleJp}
                                    </div>
                                    <div className="font-bengali text-slate-600 text-[11px]">
                                      {item.exampleBn}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                            )}
                            <td className="p-2.5 text-center">
                              <div className="inline-block w-4 h-4 border border-slate-300 rounded cursor-pointer">
                                {masteredIds.has(item.id) && (
                                  <span className="block text-emerald-600 text-xs font-bold leading-none">✓</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </section>
            );
          })}
        </div>

        {/* BOOK APPENDIX / BACK MATTER */}
        {selectedCategory === 'all' && (
          <div 
            id="book-appendix-section" 
            className="book-appendix-section mt-16 pt-10 border-t-2 border-slate-200 page-break-before font-sans"
          >
            
            <div className="text-center mb-8">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-semibold">
                APPENDIX & REFERENCE
              </span>
              <h3 className="text-2xl font-bold font-bengali text-slate-900 mt-2">
                পরিশিষ্ট ও সহায়ক তথ্য
              </h3>
              <p className="text-xs text-slate-500 font-bengali mt-1">
                পরীক্ষার জন্য গুরুত্বপূর্ণ সংখ্যা, দিন, মাস ও নিয়মিত ব্যবহারিক অভিবাদন
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Box 1: Numbers & Counters */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-slate-900 text-sm font-bengali mb-3 flex items-center gap-2">
                  <span>🔢</span> ১ থেকে ১০ সাধারণ গণনা (つ)
                </h4>
                <div className="grid grid-cols-2 gap-2 font-japanese text-xs">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-blue-600">ひとつ</strong> (Hitotsu) = ১টি
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-blue-600">ふたつ</strong> (Futatsu) = ২টি
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-blue-600">みっつ</strong> (Mittsu) = ৩টি
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-blue-600">よっつ</strong> (Yottsu) = ৪টি
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-blue-600">いつつ</strong> (Itsutsu) = ৫টি
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-blue-600">むっつ</strong> (Muttsu) = ৬টি
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-blue-600">ななつ</strong> (Nanatsu) = ৭টি
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-blue-600">やっつ</strong> (Yattsu) = ৮টি
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-blue-600">ここのつ</strong> (Kokonotsu) = ৯টি
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-blue-600">とお</strong> (Too) = ১০টি
                  </div>
                </div>
              </div>

              {/* Box 2: Essential Daily Greetings */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-slate-900 text-sm font-bengali mb-3 flex items-center gap-2">
                  <span>🤝</span> নিত্যপ্রয়োজনীয় অভিবাদন
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                    <div>
                      <strong className="font-japanese text-slate-900">おはようございます</strong>
                      <span className="text-slate-500 font-mono ml-2">Ohayou gozaimasu</span>
                    </div>
                    <span className="font-bengali text-slate-700">শুভ সকাল</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                    <div>
                      <strong className="font-japanese text-slate-900">こんにちは</strong>
                      <span className="text-slate-500 font-mono ml-2">Konnichiwa</span>
                    </div>
                    <span className="font-bengali text-slate-700">শুভ দুপুর / হ্যালো</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                    <div>
                      <strong className="font-japanese text-slate-900">ありがとうございます</strong>
                      <span className="text-slate-500 font-mono ml-2">Arigatou gozaimasu</span>
                    </div>
                    <span className="font-bengali text-slate-700">অনেক ধন্যবাদ</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                    <div>
                      <strong className="font-japanese text-slate-900">すみません</strong>
                      <span className="text-slate-500 font-mono ml-2">Sumimasen</span>
                    </div>
                    <span className="font-bengali text-slate-700">মাফ করবেন / Excuse me</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                    <div>
                      <strong className="font-japanese text-slate-900">さようなら</strong>
                      <span className="text-slate-500 font-mono ml-2">Sayounara</span>
                    </div>
                    <span className="font-bengali text-slate-700">বিদায়</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Book End Signature */}
            <div className="text-center mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500 font-bengali">
              <p className="font-medium text-slate-700">
                JLPT N5 জাপানি শব্দকোষ বই সফলভাবে সম্পন্ন হয়েছে। নিয়মিত রিভিশন দিন এবং সাফল্য অর্জন করুন!
              </p>
              <p className="font-mono text-[11px] text-slate-400 mt-1">
                Japanese JLPT N5 Complete Vocabulary Book • Bengali Edition
              </p>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* PDF DOWNLOAD OPTION MODAL */}
      {/* ========================================================================= */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setIsDownloadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-bengali">
                  PDF বই ডাউনলোড অপশন
                </h3>
                <p className="text-xs text-slate-400 font-bengali">
                  আপনার পছন্দসই ফরম্যাটে PDF ফাইল ডাউনলোড করুন
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6 font-bengali">
              {/* Option 1: Current Chapter */}
              <button
                id="btn-download-chapter-pdf"
                onClick={() => handleStartPdfDownload('current')}
                className="w-full p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-sm text-white group-hover:text-cyan-300">
                    {selectedCategory === 'all' ? 'বর্তমান ভিউ PDF ডাউনলোড' : `${CATEGORIES.find(c => c.key === selectedCategory)?.nameBn} অধ্যায় PDF`}
                  </strong>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono">
                    দ্রুত (~২-৪ সেকেন্ড)
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  নির্বাচিত ক্যাটাগরি ও ফিল্টার অনুসারে পরিষ্কার PDF ডাউনলোড
                </p>
              </button>

              {/* Option 2: Full Book All 838 words */}
              <button
                id="btn-download-full-book-pdf"
                onClick={() => handleStartPdfDownload('all')}
                className="w-full p-3.5 rounded-xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 hover:from-blue-900/60 hover:to-indigo-900/60 border border-blue-500/40 text-left transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-sm text-cyan-200 group-hover:text-cyan-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    সম্পূর্ণ বই PDF (৮৩৮টি শব্দ)
                  </strong>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                    পূর্ণাঙ্গ সংস্করণ
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  কভার পাতা, সূচিপত্র, ২৪টি অধ্যায় এবং পরিশিষ্ট সহ সম্পূর্ণ বই
                </p>
              </button>

              {/* Option 3: Browser Vector Print to PDF */}
              <button
                id="btn-modal-print-to-pdf"
                onClick={() => {
                  setIsDownloadModalOpen(false);
                  handlePrintToPdf();
                }}
                className="w-full p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-sm text-emerald-300 group-hover:text-emerald-200 flex items-center gap-1.5">
                    <Printer className="w-4 h-4" />
                    ব্রাউজার প্রিন্ট / Save as PDF
                  </strong>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    ১০০% ক্রিস্প ভেক্টর
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  কম্পিউটার বা ফোনের প্রিন্ট মেন্যু দিয়ে ইনস্ট্যান্ট ভেক্টর PDF সেভ করুন
                </p>
              </button>
            </div>

            <div className="text-right">
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bengali"
              >
                বাতিল করুন
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PDF GENERATION PROGRESS MODAL OVERLAY */}
      {/* ========================================================================= */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            {pdfProgress?.status === 'error' ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                </div>

                <h3 className="text-base font-bold text-white font-bengali mb-1">
                  পিডিএফ তৈরি করা সম্ভব হয়নি
                </h3>
                <p className="text-xs text-slate-400 font-bengali mb-5 leading-relaxed">
                  {pdfProgress?.message || 'ব্রাউজারের সীমাবদ্ধতার কারণে সরাসরি ডাউনলোড ব্যর্থ হয়েছে। আপনি ক্রিস্প ভেক্টর PDF সেভ করতে পারেন:'}
                </p>

                <div className="space-y-2 mb-4 font-bengali">
                  <button
                    onClick={() => {
                      setIsGeneratingPdf(false);
                      setPdfProgress(null);
                      handlePrintToPdf();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Save as PDF (ব্রাউজার প্রিন্ট)</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsGeneratingPdf(false);
                      setPdfProgress(null);
                      handleDownloadOfflineBook();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition border border-slate-700"
                  >
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>অফলাইন HTML বই ডাউনলোড</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsGeneratingPdf(false);
                    setPdfProgress(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  বাতিল করুন
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Download className="w-6 h-6 text-cyan-400" />
                </div>

                <h3 className="text-base font-bold text-white font-bengali mb-1">
                  পিডিএফ তৈরি হচ্ছে...
                </h3>
                <p className="text-xs text-slate-400 font-bengali mb-4">
                  {pdfProgress?.message || 'বইয়ের পৃষ্ঠাগুলো প্রস্তুত করা হচ্ছে...'}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
                    style={{
                      width: `${
                        pdfProgress?.status === 'saving' || pdfProgress?.status === 'done'
                          ? 100
                          : pdfProgress?.current && pdfProgress?.total
                          ? Math.round((pdfProgress.current / pdfProgress.total) * 95)
                          : 35
                      }%`
                    }}
                  />
                </div>

                <p className="text-[11px] font-mono text-slate-500">
                  {pdfProgress?.current && pdfProgress?.total
                    ? `ধাপ ${pdfProgress.current} / ${pdfProgress.total}`
                    : 'অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন'}
                </p>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
