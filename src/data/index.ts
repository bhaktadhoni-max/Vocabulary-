import { VocabItem } from '../types';
import { VOCAB_PART1 } from './vocab_part1';
import { VOCAB_PART2 } from './vocab_part2';
import { VOCAB_PART3 } from './vocab_part3';
import { VOCAB_PART4 } from './vocab_part4';
import { VOCAB_PART5 } from './vocab_part5';
import { CATEGORIES } from './categories';

export const ALL_VOCABULARY: VocabItem[] = [
  ...VOCAB_PART1,
  ...VOCAB_PART2,
  ...VOCAB_PART3,
  ...VOCAB_PART4,
  ...VOCAB_PART5
];

export { CATEGORIES };

export const TOTAL_VOCAB_COUNT = ALL_VOCABULARY.length;
