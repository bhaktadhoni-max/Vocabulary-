export interface VocabItem {
  id: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  bn: string;
  category: string;
  categoryKey: string;
  lesson?: number;
  exampleJp?: string;
  exampleFurigana?: string;
  exampleRomaji?: string;
  exampleBn?: string;
  jlpt?: string;
}

export type StudyMode = 
  | 'dashboard'
  | 'lessons'
  | 'flashcards' 
  | 'review' 
  | 'list' 
  | 'quiz' 
  | 'bookmarked' 
  | 'mastered' 
  | 'stats' 
  | 'book'
  | 'resources';

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface PracticeRecord {
  id: number;
  wrongCount: number;         // Times marked "Don't Know" or failed in quiz
  reviewCount: number;        // Times practiced in review mode
  consecutiveCorrect: number; // Consecutive times marked "Know" in review
  addedAt?: string;           // ISO timestamp
  lastReviewedAt?: string;    // ISO timestamp
  graduatedAt?: string;       // ISO timestamp when mastered from practice
}

export interface ReminderSettings {
  enabled: boolean;
  time: string;               // e.g. "20:00"
  frequency: 'daily' | 'twice_daily' | 'every_2_days';
  browserNotification: boolean;
  inAppAlerts?: boolean;
  lastNotifiedDate?: string;
}

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
