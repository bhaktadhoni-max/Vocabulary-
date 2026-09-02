export interface CategoryInfo {
  key: string;
  nameJp: string;
  nameBn: string;
  count: number;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'all', nameJp: 'すべて', nameBn: 'সব শব্দ (All)', count: 838, icon: '🌸', color: 'rose' },
  { key: 'pronouns', nameJp: '代名詞', nameBn: 'সর্বনাম (Pronouns)', count: 22, icon: '👤', color: 'indigo' },
  { key: 'numbers', nameJp: '数字', nameBn: 'সংখ্যা (Numbers)', count: 21, icon: '🔢', color: 'blue' },
  { key: 'time', nameJp: '時間', nameBn: 'সময় (Time & Dates)', count: 39, icon: '⏰', color: 'amber' },
  { key: 'calendar', nameJp: '曜日・月', nameBn: 'বার ও মাস (Days & Months)', count: 23, icon: '📅', color: 'orange' },
  { key: 'family', nameJp: '家族', nameBn: 'পরিবার (Family)', count: 24, icon: '👨‍👩‍👧', color: 'emerald' },
  { key: 'people', nameJp: '人', nameBn: 'মানুষ ও পেশা (People)', count: 22, icon: '👥', color: 'violet' },
  { key: 'body', nameJp: '体', nameBn: 'শরীর (Body Parts)', count: 22, icon: '🫀', color: 'red' },
  { key: 'colors', nameJp: '色', nameBn: 'রং (Colors)', count: 11, icon: '🎨', color: 'pink' },
  { key: 'food', nameJp: '食べ物', nameBn: 'খাবার ও পানীয় (Food & Drink)', count: 53, icon: '🍱', color: 'amber' },
  { key: 'clothing', nameJp: '衣服', nameBn: 'পোশাক (Clothing)', count: 21, icon: '👕', color: 'teal' },
  { key: 'house', nameJp: '家・家具', nameBn: 'ঘরবাড়ি ও আসবাব (House)', count: 38, icon: '🏠', color: 'cyan' },
  { key: 'nature', nameJp: '自然・天気', nameBn: 'প্রকৃতি ও আবহাওয়া (Nature)', count: 35, icon: '⛅', color: 'sky' },
  { key: 'animals', nameJp: '動物', nameBn: 'প্রাণী (Animals)', count: 18, icon: '🐾', color: 'lime' },
  { key: 'places', nameJp: '場所', nameBn: 'স্থান ও ভবন (Places)', count: 37, icon: '⛩️', color: 'purple' },
  { key: 'positions', nameJp: '位置', nameBn: 'অবস্থান ও দিক (Positions)', count: 16, icon: '🧭', color: 'slate' },
  { key: 'transport', nameJp: '交通', nameBn: 'যানবাহন (Transportation)', count: 18, icon: '🚆', color: 'zinc' },
  { key: 'study', nameJp: '学校・勉強', nameBn: 'পড়াশোনা ও স্কুল (Study)', count: 28, icon: '📚', color: 'blue' },
  { key: 'verbs', nameJp: '動詞', nameBn: 'ক্রিয়া (Verbs)', count: 116, icon: '⚡', color: 'rose' },
  { key: 'i-adj', nameJp: 'い形容詞', nameBn: 'বিশেষণ (い)', count: 62, icon: '✨', color: 'yellow' },
  { key: 'na-adj', nameJp: 'な形容詞', nameBn: 'বিশেষণ (な)', count: 40, icon: '💎', color: 'emerald' },
  { key: 'adverbs', nameJp: '副詞', nameBn: 'ক্রিয়াবিশেষণ (Adverbs)', count: 35, icon: '🎯', color: 'orange' },
  { key: 'counters', nameJp: '助数詞', nameBn: 'গণনা (Counters)', count: 18, icon: '🏷️', color: 'violet' },
  { key: 'other', nameJp: 'その他', nameBn: 'অন্যান্য (Other Nouns)', count: 85, icon: '📦', color: 'gray' },
  { key: 'greetings', nameJp: '挨拶', nameBn: 'অভিবাদন (Greetings)', count: 34, icon: '🤝', color: 'fuchsia' },
];
