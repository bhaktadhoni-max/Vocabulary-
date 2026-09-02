export interface VocabItem {
  id: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  bn: string;
  category: string;
  categoryKey: string;
  exampleJp?: string;
  exampleFurigana?: string;
  exampleRomaji?: string;
  exampleBn?: string;
  jlpt?: string;
}

export type StudyMode = 'flashcards' | 'list' | 'quiz' | 'bookmarked' | 'mastered' | 'stats' | 'book';

export interface BookDisplayOptions {
  showRomaji: boolean;
  showExamples: boolean;
  showCheckboxes: boolean;
  viewMode: 'cards' | 'table';
  fontSize: 'sm' | 'base' | 'lg';
}

export interface CategoryInfo {
  key: string;
  nameJp: string;
  nameBn: string;
  count: number;
  icon: string;
  color: string;
}

export type FilterStatus = 'all' | 'unlearned' | 'learned' | 'bookmarked';


export interface FilterOptions {
  searchQuery: string;
  categoryKey: string;
  status: FilterStatus;
  sortBy: 'id' | 'alphabetical' | 'random';
}

export interface StudySettings {
  showFurigana: boolean;
  showRomaji: boolean;
  autoAudio: boolean;
  speechRate: number;
  autoPlayInterval: number; // in seconds
}

export interface QuizQuestion {
  vocab: VocabItem;
  options: string[];
  correctAnswer: string;
  type: 'jp_to_bn' | 'bn_to_jp';
}
