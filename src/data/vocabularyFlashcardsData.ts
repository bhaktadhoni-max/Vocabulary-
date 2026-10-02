export interface VocabularyFlashcardItem {
  id?: string | number;
  word: string;
  reading: string;
  romaji: string;
  partOfSpeech: string;
  category: string;
  level: string;
  banglaMeaning: string;
  englishMeaning: string;
  example: {
    jp: string;
    bangla: string;
    english: string;
  };
}

export const VOCABULARY_FLASHCARDS_DATA: VocabularyFlashcardItem[] = [
  {
    word: '友達',
    reading: 'ともだち',
    romaji: 'tomodachi',
    partOfSpeech: 'Noun',
    category: 'People & Relationships',
    level: 'N5',
    banglaMeaning: 'বন্ধু / সাথী',
    englishMeaning: 'Friend / Companion',
    example: {
      jp: '日曜日、友達と映画を見に行きます。',
      bangla: 'রবিবার বন্ধুর সাথে সিনেমা দেখতে যাব।',
      english: 'On Sunday, I am going to watch a movie with a friend.'
    }
  },
  {
    word: '食べる',
    reading: 'たべる',
    romaji: 'taberu',
    partOfSpeech: 'Verb',
    category: 'Food & Daily Life',
    level: 'N5',
    banglaMeaning: 'খাওয়া / আহার করা',
    englishMeaning: 'To eat',
    example: {
      jp: '朝ご飯にパンと卵を食べました。',
      bangla: 'সকালের নাস্তায় রুটি এবং ডিম খেয়েছি।',
      english: 'I ate bread and eggs for breakfast.'
    }
  },
  {
    word: '学校',
    reading: 'がっこう',
    romaji: 'gakkou',
    partOfSpeech: 'Noun',
    category: 'Places & Education',
    level: 'N5',
    banglaMeaning: 'বিদ্যালয় / স্কুল',
    englishMeaning: 'School',
    example: {
      jp: '毎朝八時に学校へ行きます。',
      bangla: 'প্রতিদিন সকাল আটটায় স্কুলে যাই।',
      english: 'I go to school at 8 o\'clock every morning.'
    }
  },
  {
    word: '勉強',
    reading: 'べんきょう',
    romaji: 'benkyou',
    partOfSpeech: 'Noun / Suru Verb',
    category: 'Education & Study',
    level: 'N5',
    banglaMeaning: 'পড়াশোনা / অধ্যায়ন',
    englishMeaning: 'Study / Learning',
    example: {
      jp: '図書館で日本語を勉強します。',
      bangla: 'লাইব্রেরিতে জাপানি ভাষা পড়ব।',
      english: 'I study Japanese at the library.'
    }
  },
  {
    word: '新しい',
    reading: 'あたらしい',
    romaji: 'atarashii',
    partOfSpeech: 'Adjective (i)',
    category: 'Descriptions',
    level: 'N5',
    banglaMeaning: 'নতুন',
    englishMeaning: 'New / Fresh',
    example: {
      jp: '新しいパソコンを買いました。',
      bangla: 'একটি নতুন কম্পিউটার কিনেছি।',
      english: 'I bought a new computer.'
    }
  },
  {
    word: '先生',
    reading: 'せんせい',
    romaji: 'sensei',
    partOfSpeech: 'Noun',
    category: 'People & Profession',
    level: 'N5',
    banglaMeaning: 'শিক্ষক / গুরু',
    englishMeaning: 'Teacher / Instructor',
    example: {
      jp: '田中先生はとても優しいです。',
      bangla: 'তানাকা শিক্ষক খুবই দয়ালু।',
      english: 'Teacher Tanaka is very kind.'
    }
  },
  {
    word: '車',
    reading: 'くるま',
    romaji: 'kuruma',
    partOfSpeech: 'Noun',
    category: 'Transportation',
    level: 'N5',
    banglaMeaning: 'গাড়ি / মোটরগাড়ি',
    englishMeaning: 'Car / Automobile',
    example: {
      jp: '父は車で会社へ行きます。',
      bangla: 'বাবা গাড়িতে করে অফিসে যান।',
      english: 'My father goes to the office by car.'
    }
  },
  {
    word: '話す',
    reading: 'はなす',
    romaji: 'hanasu',
    partOfSpeech: 'Verb',
    category: 'Communication',
    level: 'N5',
    banglaMeaning: 'কথা বলা / আলোচনা করা',
    englishMeaning: 'To speak / To talk',
    example: {
      jp: '先生とゆっくり話しました。',
      bangla: 'শিক্ষকের সাথে ধীরে ধীরে কথা বলেছি।',
      english: 'I spoke slowly with the teacher.'
    }
  },
  {
    word: '時間',
    reading: 'じかん',
    romaji: 'jikan',
    partOfSpeech: 'Noun',
    category: 'Time & Units',
    level: 'N5',
    banglaMeaning: 'সময় / ঘণ্টা',
    englishMeaning: 'Time / Hours',
    example: {
      jp: '今、日本語を勉強する時間があります。',
      bangla: 'এখন জাপানি পড়ার সময় আছে।',
      english: 'I have time to study Japanese now.'
    }
  },
  {
    word: '案内する',
    reading: 'あんないする',
    romaji: 'annai suru',
    partOfSpeech: 'Verb (Suru)',
    category: 'Actions & Travel',
    level: 'N4',
    banglaMeaning: 'পথ দেখানো / ঘুরে দেখানো',
    englishMeaning: 'To guide / To show around',
    example: {
      jp: '明日、東京の街をご案内します。',
      bangla: 'আগামীকাল আপনাকে টোকিও শহর ঘুরে দেখাব।',
      english: 'Tomorrow, I will guide you around Tokyo city.'
    }
  },
  {
    word: '予約',
    reading: 'よやく',
    romaji: 'yoyaku',
    partOfSpeech: 'Noun / Suru Verb',
    category: 'Travel & Services',
    level: 'N4',
    banglaMeaning: 'অগ্রিম বুকিং / রিজার্ভেশন',
    englishMeaning: 'Reservation / Booking',
    example: {
      jp: 'ホテルの部屋をインターネットで予約しました。',
      bangla: 'ইন্টারনেটে হোটেলের রুম বুকিং করেছি।',
      english: 'I booked a hotel room online.'
    }
  },
  {
    word: '親切',
    reading: 'しんせつ',
    romaji: 'shinsetsu',
    partOfSpeech: 'Adjective (na)',
    category: 'Character & Personality',
    level: 'N5',
    banglaMeaning: 'দয়ালু / আন্তরিক',
    englishMeaning: 'Kind / Helpful',
    example: {
      jp: '駅のスタッフはとても親切でした。',
      bangla: 'স্টেশনের কর্মীরা খুবই আন্তরিক ছিলেন।',
      english: 'The station staff was very kind.'
    }
  }
];
