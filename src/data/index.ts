import { VocabItem, CategoryInfo } from '../types';
import { N5_PART1 } from './n5_part1';
import { N5_PART2 } from './n5_part2';
import { N5_PART3 } from './n5_part3';
import { N5_PART4 } from './n5_part4';
import { N5_PART5 } from './n5_part5';
import { CATEGORIES as N5_CATEGORIES_RAW } from './categories';
import { N4_ALL_VOCABULARY, N4_TOTAL_COUNT, N4_LESSONS_META } from './n4';
import { N5_LESSONS_META } from './n5LessonsMeta';

// N5 complete dataset (891 words, Lessons 1–25)
export const N5_VOCABULARY: VocabItem[] = [
  ...N5_PART1,
  ...N5_PART2,
  ...N5_PART3,
  ...N5_PART4,
  ...N5_PART5
];

// N4 complete dataset (854 words, Lessons 26–50)
export const N4_VOCABULARY: VocabItem[] = N4_ALL_VOCABULARY as VocabItem[];

// Unified Level Map
export const VOCABULARY_BY_LEVEL: Record<'N5' | 'N4', VocabItem[]> = {
  N5: N5_VOCABULARY,
  N4: N4_VOCABULARY
};

// Category Info for N4 matching CategoryInfo interface
export const N4_CATEGORIES_INFO: CategoryInfo[] = [
  { key: 'all', nameJp: 'すべて', nameBn: 'সব শব্দ', count: N4_TOTAL_COUNT, icon: '🌸', color: 'slate' },
  { key: 'verbs', nameJp: '動詞', nameBn: 'ক্রিয়া (Verbs)', count: N4_ALL_VOCABULARY.filter(i => i.categoryKey === 'verbs').length, icon: '⚡', color: 'emerald' },
  { key: 'nouns', nameJp: '名詞', nameBn: 'বিশেষ্য (Nouns)', count: N4_ALL_VOCABULARY.filter(i => i.categoryKey === 'nouns').length, icon: '📦', color: 'indigo' },
  { key: 'i_adj', nameJp: 'い形容詞', nameBn: 'ই-বিশেষণ (i-Adj)', count: N4_ALL_VOCABULARY.filter(i => i.categoryKey === 'i_adj').length, icon: '✨', color: 'lime' },
  { key: 'na_adj', nameJp: 'な形容詞', nameBn: 'না-বিশেষণ (na-Adj)', count: N4_ALL_VOCABULARY.filter(i => i.categoryKey === 'na_adj').length, icon: '💎', color: 'teal' },
  { key: 'adverbs', nameJp: '副詞', nameBn: 'ক্রিয়া-বিশেষণ (Adverbs)', count: N4_ALL_VOCABULARY.filter(i => i.categoryKey === 'adverbs').length, icon: '🎯', color: 'amber' },
  { key: 'expressions', nameJp: '表現・敬語', nameBn: 'ভাবপ্রকাশ ও কেইগো', count: N4_ALL_VOCABULARY.filter(i => i.categoryKey === 'expressions' || i.categoryKey === 'others').length, icon: '🤝', color: 'fuchsia' },
];

export const CATEGORIES_BY_LEVEL: Record<'N5' | 'N4', CategoryInfo[]> = {
  N5: N5_CATEGORIES_RAW,
  N4: N4_CATEGORIES_INFO
};

export const LESSONS_BY_LEVEL = {
  N5: N5_LESSONS_META,
  N4: N4_LESSONS_META
};

// Backward compatibility exports
export const ALL_VOCABULARY = N5_VOCABULARY;
export const CATEGORIES = N5_CATEGORIES_RAW;
export const TOTAL_VOCAB_COUNT = N5_VOCABULARY.length;
export { N5_CATEGORIES_RAW as N5_CATEGORIES, N5_LESSONS_META, N4_LESSONS_META };
