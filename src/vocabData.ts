export interface VocabWord {
  word: string;
  reading: string;
  romaji: string;
  partOfSpeech: string; // Noun | Verb (Group 1) | Verb (Group 2) | い-adjective | な-adjective | Noun / する-verb | Expression
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

export const VOCAB_DATA: VocabWord[] = [
  {
    word: "友達",
    reading: "ともだち",
    romaji: "tomodachi",
    partOfSpeech: "Noun",
    category: "People",
    level: "JLPT N5 Core",
    banglaMeaning: "বন্ধু",
    englishMeaning: "Friend",
    example: {
      jp: "友達と映画を見ます。",
      bangla: "আমি বন্ধুর সাথে সিনেমা দেখি।",
      english: "I watch a movie with my friend."
    }
  },
  {
    word: "勉強",
    reading: "べんきょう",
    romaji: "benkyou",
    partOfSpeech: "Noun / する-verb",
    category: "Education",
    level: "JLPT N5 Core",
    banglaMeaning: "পড়াশোনা",
    englishMeaning: "Study",
    example: {
      jp: "毎晩日本語を勉強します。",
      bangla: "আমি প্রতি রাতে জাপানি ভাষা পড়াশোনা করি।",
      english: "I study Japanese every night."
    }
  },
  {
    word: "食べる",
    reading: "たべる",
    romaji: "taberu",
    partOfSpeech: "Verb (Group 2)",
    category: "Daily Life",
    level: "JLPT N5 Core",
    banglaMeaning: "খাওয়া",
    englishMeaning: "To eat",
    example: {
      jp: "朝ごはんをたくさん食べました。",
      bangla: "সকালে অনেক নাস্তা খেয়েছি।",
      english: "I ate a lot for breakfast."
    }
  },
  {
    word: "天気",
    reading: "てんき",
    romaji: "tenki",
    partOfSpeech: "Noun",
    category: "Nature",
    level: "JLPT N5 Core",
    banglaMeaning: "আবহাওয়া",
    englishMeaning: "Weather",
    example: {
      jp: "今日はとてもいい天気ですね。",
      bangla: "আজকের আবহাওয়া সত্যিই খুব সুন্দর, তাই না?",
      english: "The weather is very nice today, isn't it?"
    }
  },
  {
    word: "大きい",
    reading: "おおきい",
    romaji: "ookii",
    partOfSpeech: "い-adjective",
    category: "Description",
    level: "JLPT N5 Core",
    banglaMeaning: "বড়",
    englishMeaning: "Big / Large",
    example: {
      jp: "あの大きいビルは図書館です。",
      bangla: "ঐ বড় ভবনটি একটি গ্রন্থাগার।",
      english: "That big building is a library."
    }
  },
  {
    word: "学校",
    reading: "がっこう",
    romaji: "gakkou",
    partOfSpeech: "Noun",
    category: "Places",
    level: "JLPT N5 Core",
    banglaMeaning: "বিদ্যালয় / স্কুল",
    englishMeaning: "School",
    example: {
      jp: "自転車で学校へ行きます。",
      bangla: "আমি সাইকেলে করে স্কুলে যাই।",
      english: "I go to school by bicycle."
    }
  },
  {
    word: "行く",
    reading: "いく",
    romaji: "iku",
    partOfSpeech: "Verb (Group 1)",
    category: "Movement",
    level: "JLPT N5 Core",
    banglaMeaning: "যাওয়া",
    englishMeaning: "To go",
    example: {
      jp: "明日東京へ行きます。",
      bangla: "আমি আগামীকাল টোকিও যাব।",
      english: "I will go to Tokyo tomorrow."
    }
  },
  {
    word: "先生",
    reading: "せんせい",
    romaji: "sensei",
    partOfSpeech: "Noun",
    category: "People",
    level: "JLPT N5 Core",
    banglaMeaning: "শিক্ষক",
    englishMeaning: "Teacher",
    example: {
      jp: "田中先生はとても親切です。",
      bangla: "তানাকা শিক্ষক খুবই দয়ালু।",
      english: "Teacher Tanaka is very kind."
    }
  },
  {
    word: "日本語",
    reading: "にほんご",
    romaji: "nihongo",
    partOfSpeech: "Noun",
    category: "Language",
    level: "JLPT N5 Core",
    banglaMeaning: "জাপানি ভাষা",
    englishMeaning: "Japanese Language",
    example: {
      jp: "日本語で話しましょう。",
      bangla: "চলুন জাপানি ভাষায় কথা বলি।",
      english: "Let's speak in Japanese."
    }
  },
  {
    word: "新しい",
    reading: "あたらしい",
    romaji: "atarashii",
    partOfSpeech: "い-adjective",
    category: "Description",
    level: "JLPT N5 Core",
    banglaMeaning: "নতুন",
    englishMeaning: "New",
    example: {
      jp: "新しい本を買いました。",
      bangla: "একটি নতুন বই কিনেছি।",
      english: "I bought a new book."
    }
  },
  {
    word: "静か",
    reading: "しずか",
    romaji: "shizuka",
    partOfSpeech: "な-adjective",
    category: "Description",
    level: "JLPT N5 Core",
    banglaMeaning: "শান্ত / নীরব",
    englishMeaning: "Quiet",
    example: {
      jp: "この図書館はとても静かです。",
      bangla: "এই লাইব্রেরিটি খুবই শান্ত।",
      english: "This library is very quiet."
    }
  },
  {
    word: "家族",
    reading: "かぞく",
    romaji: "kazoku",
    partOfSpeech: "Noun",
    category: "Family",
    level: "JLPT N5 Core",
    banglaMeaning: "পরিবার",
    englishMeaning: "Family",
    example: {
      jp: "家族と一緒に住んでいます。",
      bangla: "আমি পরিবারের সাথে একসাথে বাস করি।",
      english: "I live together with my family."
    }
  }
];
