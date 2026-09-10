export interface CategoryInfo {
  key: string;
  nameJp: string;
  nameBn: string;
  count: number;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'all', nameJp: 'すべて', nameBn: 'সব', count: 838, icon: '🌸', color: 'slate' },
  { key: 'verbs', nameJp: '動詞', nameBn: 'ক্রিয়া (Verb)', count: 164, icon: '⚡', color: 'emerald' },
  { key: 'i_adj', nameJp: 'い形容詞', nameBn: 'い-বিশেষণ (i-Adjective)', count: 50, icon: '✨', color: 'lime' },
  { key: 'na_adj', nameJp: 'な形容詞', nameBn: 'な-বিশেষণ (na-Adjective)', count: 28, icon: '💎', color: 'teal' },
  { key: 'family', nameJp: '家族', nameBn: 'মানুষ ও পরিবার', count: 46, icon: '👥', color: 'violet' },
  { key: 'time', nameJp: '時間', nameBn: 'সময় ও দিন', count: 62, icon: '⏰', color: 'amber' },
  { key: 'places', nameJp: '場所', nameBn: 'স্থান', count: 37, icon: '⛩️', color: 'blue' },
  { key: 'food', nameJp: '食べ物', nameBn: 'খাবার ও পানীয়', count: 53, icon: '🍱', color: 'orange' },
  { key: 'clothing', nameJp: '衣服・体', nameBn: 'শরীর ও পোশাক', count: 43, icon: '👕', color: 'rose' },
  { key: 'nature', nameJp: '自然・動物', nameBn: 'প্রকৃতি ও প্রাণী', count: 53, icon: '🌿', color: 'green' },
  { key: 'house', nameJp: '物・家', nameBn: 'জিনিসপত্র', count: 64, icon: '🏠', color: 'yellow' },
  { key: 'numbers', nameJp: '数字', nameBn: 'সংখ্যা', count: 21, icon: '🔢', color: 'indigo' },
  { key: 'particles_counters', nameJp: '助数詞', nameBn: 'গণনা শব্দ (Counter)', count: 34, icon: '🏷️', color: 'cyan' },
  { key: 'pronouns', nameJp: '代名詞', nameBn: 'সর্বনাম', count: 50, icon: '👤', color: 'purple' },
  { key: 'adverbs', nameJp: '副詞', nameBn: 'ক্রিয়া-বিশেষণ (Adverb)', count: 40, icon: '🎯', color: 'amber' },
  { key: 'positions', nameJp: '位置・指示', nameBn: 'নির্দেশক ও অবস্থান', count: 16, icon: '🧭', color: 'slate' },
  { key: 'transport', nameJp: '交通', nameBn: 'যানবাহন', count: 18, icon: '🚆', color: 'zinc' },
  { key: 'colors', nameJp: '色', nameBn: 'রং (Colors)', count: 11, icon: '🎨', color: 'pink' },
  { key: 'greetings', nameJp: '挨拶', nameBn: 'অভিবাদন ও অব্যয়', count: 24, icon: '🤝', color: 'fuchsia' },
];
