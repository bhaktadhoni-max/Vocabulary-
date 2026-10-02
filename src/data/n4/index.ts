import { N4VocabItem } from './types';
import { N4_LESSON_26_30 } from './lesson26_30';
import { N4_LESSON_31_35 } from './lesson31_35';
import { N4_LESSON_36_40 } from './lesson36_40';
import { N4_LESSON_41_45 } from './lesson41_45';
import { N4_LESSON_46_50 } from './lesson46_50';
import { N4_LESSONS_META } from './lessonsMeta';

export * from './types';
export * from './lessonsMeta';

export const N4_ALL_VOCABULARY: N4VocabItem[] = [
  ...N4_LESSON_26_30,
  ...N4_LESSON_31_35,
  ...N4_LESSON_36_40,
  ...N4_LESSON_41_45,
  ...N4_LESSON_46_50
];

export const N4_TOTAL_COUNT = N4_ALL_VOCABULARY.length;

// Pre-computed map for fast O(1) lookups
export const N4_VOCAB_MAP = new Map<number, N4VocabItem>(
  N4_ALL_VOCABULARY.map(item => [item.id, item])
);

// Grouped by lesson number
export const N4_VOCAB_BY_LESSON = N4_ALL_VOCABULARY.reduce<Record<number, N4VocabItem[]>>((acc, item) => {
  if (!acc[item.lesson]) {
    acc[item.lesson] = [];
  }
  acc[item.lesson].push(item);
  return acc;
}, {});

// Parts of Speech / Category filters
export interface N4CategoryOption {
  key: string;
  nameJp: string;
  nameBn: string;
  count: number;
}

export const N4_CATEGORIES: N4CategoryOption[] = [
  { key: 'all', nameJp: 'すべて', nameBn: 'সকল শব্দ', count: N4_TOTAL_COUNT },
  { key: 'verbs', nameJp: '動詞', nameBn: 'ক্রিয়া (Verbs)', count: N4_ALL_VOCABULARY.filter(i => i.categoryKey === 'verbs').length },
  { key: 'nouns', nameJp: '名詞', nameBn: 'বিশেষ্য (Nouns)', count: N4_ALL_VOCABULARY.filter(i => i.categoryKey === 'nouns').length },
  { key: 'i_adj', nameJp: 'い形容詞', nameBn: 'ই-বিশেষণ (i-Adj)', count: N4_ALL_VOCABULARY.filter(i => i.categoryKey === 'i_adj').length },
  { key: 'na_adj', nameJp: 'な形容詞', nameBn: 'না-বিশেষণ (na-Adj)', count: N4_ALL_VOCABULARY.filter(i => i.categoryKey === 'na_adj').length },
  { key: 'adverbs', nameJp: '副詞', nameBn: 'ক্রিয়া-বিশেষণ (Adverbs)', count: N4_ALL_VOCABULARY.filter(i => i.categoryKey === 'adverbs').length },
  { key: 'expressions', nameJp: '表現・敬語', nameBn: 'ভাবপ্রকাশ ও কেইগো (Expressions & Keigo)', count: N4_ALL_VOCABULARY.filter(i => i.categoryKey === 'expressions' || i.categoryKey === 'others').length }
];
