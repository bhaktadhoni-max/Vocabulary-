export interface CategoryInfo {
  key: string;
  nameJp: string;
  nameBn: string;
  count: number;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'all', nameJp: 'すべて', nameBn: 'সব শব্দ', count: 891, icon: '🌸', color: 'slate' },
  { key: 'verbs', nameJp: '動詞', nameBn: 'ক্রিয়া', count: 158, icon: '⚡', color: 'emerald' },
  { key: 'pronouns', nameJp: '代名詞', nameBn: 'সর্বনাম', count: 25, icon: '👤', color: 'purple' },
  { key: 'numbers', nameJp: '数字', nameBn: 'সংখ্যা', count: 10, icon: '🔢', color: 'indigo' },
  { key: 'time', nameJp: '時間', nameBn: 'সময়', count: 50, icon: '⏰', color: 'amber' },
  { key: 'calendar', nameJp: '曜日・月', nameBn: 'বার ও মাস', count: 27, icon: '📅', color: 'blue' },
  { key: 'family', nameJp: '家族', nameBn: 'পরিবার', count: 22, icon: '👨‍👩‍👧‍👦', color: 'rose' },
  { key: 'people', nameJp: '人', nameBn: 'মানুষ', count: 27, icon: '👥', color: 'violet' },
  { key: 'body', nameJp: '体', nameBn: 'শরীর', count: 16, icon: '🫀', color: 'red' },
  { key: 'colors', nameJp: '色', nameBn: 'রং', count: 5, icon: '🎨', color: 'pink' },
  { key: 'food', nameJp: '食べ物', nameBn: 'খাবার', count: 46, icon: '🍱', color: 'orange' },
  { key: 'clothing', nameJp: '衣服', nameBn: 'পোশাক', count: 15, icon: '👕', color: 'teal' },
  { key: 'house', nameJp: '家・家具', nameBn: 'ঘরবাড়ি', count: 39, icon: '🏠', color: 'yellow' },
  { key: 'nature', nameJp: '自然・天気', nameBn: 'প্রকৃতি', count: 18, icon: '🌿', color: 'emerald' },
  { key: 'animals', nameJp: '動物', nameBn: 'প্রাণী', count: 6, icon: '🐾', color: 'stone' },
  { key: 'places', nameJp: '場所', nameBn: 'স্থান', count: 58, icon: '⛩️', color: 'sky' },
  { key: 'positions', nameJp: '位置', nameBn: 'অবস্থান', count: 26, icon: '🧭', color: 'slate' },
  { key: 'transport', nameJp: '交通', nameBn: 'যানবাহন', count: 20, icon: '🚆', color: 'zinc' },
  { key: 'study', nameJp: '勉強・学校', nameBn: 'পড়াশোনা', count: 69, icon: '📚', color: 'cyan' },
  { key: 'i_adj', nameJp: 'い形容詞', nameBn: 'ই-বিশেষণ', count: 49, icon: '✨', color: 'lime' },
  { key: 'na_adj', nameJp: 'な形容詞', nameBn: 'না-বিশেষণ', count: 21, icon: '💎', color: 'teal' },
  { key: 'adverbs', nameJp: '副詞', nameBn: 'ক্রিয়া-বিশেষণ', count: 47, icon: '🎯', color: 'amber' },
  { key: 'counters', nameJp: '助数詞', nameBn: 'গণনা', count: 24, icon: '🏷️', color: 'indigo' },
  { key: 'others', nameJp: '助詞・その他', nameBn: 'অন্যান্য', count: 78, icon: '🧩', color: 'violet' },
  { key: 'greetings', nameJp: '挨拶', nameBn: 'অভিবাদন', count: 35, icon: '🤝', color: 'fuchsia' },
];
