export interface N4VocabItem {
  id: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  bn: string;
  categoryKey: 'verbs' | 'nouns' | 'i_adj' | 'na_adj' | 'adverbs' | 'expressions' | 'others';
  category: string;
  lesson: number; // 26 through 50
  partOfSpeech: string;
  exampleJp?: string;
  exampleFurigana?: string;
  exampleRomaji?: string;
  exampleBn?: string;
  context?: string;
  jlpt: 'N4';
}

export type N4Status = 'new' | 'learning' | 'review' | 'mastered';

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface N4ReviewRecord {
  id: number;
  status: N4Status;
  interval: number; // in days
  easeFactor: number; // default 2.5
  reps: number;
  lapses: number;
  lastReviewedAt: string;
  nextReviewAt: string;
}

export interface N4LessonMeta {
  lesson: number;
  titleJp: string;
  titleBn: string;
  description: string;
  grammarFocus: string;
  count: number;
}

export interface N4QuizQuestion {
  vocab: N4VocabItem;
  questionText: string;
  readingHint?: string;
  promptAudioText?: string;
  options: {
    id: string;
    text: string;
    subText?: string;
    isCorrect: boolean;
  }[];
  correctAnswerText: string;
  type: 'jp_to_bn' | 'bn_to_jp' | 'multiple_choice' | 'listening' | 'reading_recognition' | 'flashcard_review';
}

export interface N4UserStats {
  studiedWordIds: number[];
  masteredWordIds: number[];
  favoriteWordIds: number[];
  streakDays: number;
  lastActiveDate: string;
  dailyGoal: number; // default 20
  todayStudiedCount: number;
  totalQuizTaken: number;
  totalQuizCorrect: number;
  totalQuizQuestions: number;
  currentLesson: number; // default 26
}

export type N4ActiveTab = 
  | 'dashboard'
  | 'lessons'
  | 'flashcards'
  | 'grid'
  | 'quiz'
  | 'review'
  | 'favorites'
  | 'resources'
  | 'progress';

export type N4QuizMode = 
  | 'jp_to_bn'
  | 'bn_to_jp'
  | 'multiple_choice'
  | 'listening'
  | 'reading_recognition'
  | 'flashcard_review';
