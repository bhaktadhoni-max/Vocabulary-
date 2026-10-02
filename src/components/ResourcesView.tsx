import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Volume2, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  FileText, 
  Hash, 
  Compass, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ExternalLink,
  Flame,
  ArrowRight
} from 'lucide-react';
import { speakJapanese, speakBangla } from '../utils/sound';

type ResourceCategory = 'all' | 'particles' | 'counters' | 'kanji' | 'verbs' | 'calendar' | 'cheatsheet';

interface ParticleItem {
  particle: string;
  romaji: string;
  roleBn: string;
  explanationBn: string;
  exampleJp: string;
  exampleFurigana: string;
  exampleRomaji: string;
  exampleBn: string;
}

interface CounterItem {
  counter: string;
  meaningBn: string;
  forWhatBn: string;
  readings: { num: number; jp: string; romaji: string; isIrregular?: boolean }[];
}

interface RadicalItem {
  radical: string;
  nameJp: string;
  meaningBn: string;
  examples: string[];
  explanationBn: string;
}

interface VerbConjugationItem {
  verbJp: string;
  kanji: string;
  meaningBn: string;
  group: 'Group 1 (五段)' | 'Group 2 (一段)' | 'Group 3 (不規則)';
  dictionary: string;
  masu: string;
  te: string;
  nai: string;
  ta: string;
  potential: string;
}

export const ResourcesView: React.FC<{
  currentLevel?: 'N5' | 'N4';
  onNavigateMode?: (mode: string) => void;
}> = ({ currentLevel = 'N5', onNavigateMode }) => {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // ---------------------------------------------------------------------------
  // 1. PARTICLES DATA
  // ---------------------------------------------------------------------------
  const particlesData: ParticleItem[] = [
    {
      particle: 'は',
      romaji: 'wa',
      roleBn: 'টপিক মার্কার (মূল বিষয়)',
      explanationBn: 'বাক্যের মূল বিষয় বা টপিক নির্দেশ করতে ব্যবহৃত হয়। এটি "ha" লেখা হলেও "wa" উচ্চারিত হয়।',
      exampleJp: '私は学生です。',
      exampleFurigana: 'わたしはがくせいです。',
      exampleRomaji: 'Watashi wa gakusei desu.',
      exampleBn: 'আমি একজন ছাত্র।'
    },
    {
      particle: 'が',
      romaji: 'ga',
      roleBn: 'নির্দিষ্ট সাবজেক্ট / পছন্দ-সামর্থ্য',
      explanationBn: 'বাক্যের নির্দিষ্ট কর্তা বোঝাতে অথবা 好き (পছন্দ), 上手 (দক্ষ), あります/います (থাকা)-র সাথে ব্যবহৃত হয়।',
      exampleJp: '雨が降っています。猫が好きです。',
      exampleFurigana: 'あめがふっています。ねこがすきです。',
      exampleRomaji: 'Ame ga futte imasu. Neko ga suki desu.',
      exampleBn: 'বৃষ্টি পড়ছে। আমি বিড়াল পছন্দ করি।'
    },
    {
      particle: 'を',
      romaji: 'o / wo',
      roleBn: 'কর্ম বা অবজেক্ট মার্কার',
      explanationBn: 'সরাসরি কাজের অবজেক্ট বা কর্ম নির্দেশ করতে ট্রানজিটিভ ভার্বের পূর্বে বসে।',
      exampleJp: '水を飲みます。本を読みます。',
      exampleFurigana: 'みずをのみます。ほんをよみます。',
      exampleRomaji: 'Mizu o nomimasu. Hon o yomimasu.',
      exampleBn: 'পানি পান করি। বই পড়ি।'
    },
    {
      particle: 'に',
      romaji: 'ni',
      roleBn: 'নির্দিষ্ট সময় / লক্ষ্য / গন্তব্য',
      explanationBn: 'নির্দিষ্ট সময় (৭টায়), গন্তব্যের শেষ বিন্দু (স্কুলে), বা কারোর কাছে যাওয়া/দেওয়া বোঝাতে বসে।',
      exampleJp: '7時に起きます。学校に行きます。',
      exampleFurigana: 'しちじにおきます。がっこうにいきます。',
      exampleRomaji: 'Shichiji ni okimasu. Gakkou ni ikimasu.',
      exampleBn: '৭টায় ঘুম থেকে উঠি। স্কুলে যাই।'
    },
    {
      particle: 'で',
      romaji: 'de',
      roleBn: 'কাজের স্থান / মাধ্যম বা উপকরণ',
      explanationBn: 'যেখানে কোনো কাজ ঘটে (লাইব্রেরিতে), যানবাহন (বাসে), বা উপকরণ (কলম দিয়ে) বোঝায়।',
      exampleJp: '図書館で勉強します。バスで行きます。',
      exampleFurigana: 'としょかんでべんきょうします。ばすでいきます。',
      exampleRomaji: 'Toshokan de benkyou shimasu. Basu de ikimasu.',
      exampleBn: 'লাইব্রেরিতে পড়াশোনা করি। বাসে করে যাই।'
    },
    {
      particle: 'へ',
      romaji: 'e',
      roleBn: 'অভিমুখ বা দিকের নির্দেশক',
      explanationBn: 'কোনো গন্তব্যের অভিমুখে যাত্রা নির্দেশ করে ("he" লেখা হলেও "e" উচ্চারিত হয়)।',
      exampleJp: '日本へ行きます。',
      exampleFurigana: 'にほんへいきます。',
      exampleRomaji: 'Nihon e ikimasu.',
      exampleBn: 'জাপানের উদ্দেশ্যে যাচ্ছি।'
    },
    {
      particle: 'と',
      romaji: 'to',
      roleBn: 'সাথে (সঙ্গী) / এবং (সংযোজক)',
      explanationBn: 'ব্যক্তির সাথে কোনো কাজ করা (বন্ধুর সাথে) অথবা দুটি বিশেষ্যকে একত্র করতে বসে।',
      exampleJp: '友達と遊びます。パンと水。',
      exampleFurigana: 'ともだちとあそびます。ぱんとみず。',
      exampleRomaji: 'Tomodachi to asobimasu. Pan to mizu.',
      exampleBn: 'বন্ধুর সাথে ঘুরতে যাই। রুটি এবং পানি।'
    },
    {
      particle: 'も',
      romaji: 'mo',
      roleBn: 'ও / আমিও (Also / Too)',
      explanationBn: 'পূর্বের প্রসঙ্গের সাথে মিল রেখে "ও" বা "তুমিও" অর্থে বসে (は, が, を প্রতিস্থাপন করে)।',
      exampleJp: '私も行きます。これも美味しいです。',
      exampleFurigana: 'わたしもいきます。これもおいしいです。',
      exampleRomaji: 'Watashi mo ikimasu. Kore mo oishii desu.',
      exampleBn: 'আমিও যাব। এটাও সুস্বাদু।'
    },
    {
      particle: 'から',
      romaji: 'kara',
      roleBn: 'হতে / থেকে / কারণবশত',
      explanationBn: 'শুরুর সময়/স্থান (৯টা থেকে) অথবা বাক্যের শেষে কারণ (গরমের কারণে) প্রকাশ করে।',
      exampleJp: '9時から働きます。暑いから窓を開けます。',
      exampleFurigana: 'くじからはたらきます。あついからまどをあけます。',
      exampleRomaji: 'Kuji kara hatarakimasu. Atsui kara mado o akemasu.',
      exampleBn: '৯টা থেকে কাজ করি। গরম তাই জানালা খুলছি।'
    },
    {
      particle: 'まで',
      romaji: 'made',
      roleBn: 'পর্যন্ত / অবধি',
      explanationBn: 'কাজের শেষ সময় বা গন্তব্যের শেষ সীমা নির্দেশ করে।',
      exampleJp: '5時まで勉強します。東京まで行きます。',
      exampleFurigana: 'ごじまでべんきょうします。とうきょうまでいきます。',
      exampleRomaji: 'Goji made benkyou shimasu. Toukyou made ikimasu.',
      exampleBn: '৫টা পর্যন্ত পড়ব। টোকিও পর্যন্ত যাব।'
    },
    {
      particle: 'より',
      romaji: 'yori',
      roleBn: 'চেয়ে / তুলনায় (তুলনা)',
      explanationBn: 'তুলনা করতে ব্যবহৃত হয় (যেমন: ট্রেনের চেয়ে বাস সস্তা)।',
      exampleJp: '新幹線はバスより速いです。',
      exampleFurigana: 'しんかんせんはばすよりはやいです。',
      exampleRomaji: 'Shinkansen wa basu yori hayai desu.',
      exampleBn: 'শিঙ্কানসেন বাসের চেয়ে দ্রুতগামী।'
    },
    {
      particle: 'だけ',
      romaji: 'dake',
      roleBn: 'শুধুমাত্র (Positive Only)',
      explanationBn: 'কোনো কিছুর সীমাবদ্ধতা প্রকাশ করে ইতিবাচক বাক্যে ব্যবহৃত হয়।',
      exampleJp: '水だけ飲みました。',
      exampleFurigana: 'みずだけのみました。',
      exampleRomaji: 'Mizu dake nomimashita.',
      exampleBn: 'শুধুমাত্র পানি পান করেছি।'
    },
    {
      particle: 'しか',
      romaji: 'shika',
      roleBn: 'ছাড়া আর নেই (Negative Only)',
      explanationBn: 'এর সাথে সর্বদা নেগেটিভ ভার্ব বসে; "ছাড়া আর কিছুই না" অর্থ প্রকাশ করে।',
      exampleJp: '100円しかありません。',
      exampleFurigana: 'ひゃくえんしかありません。',
      exampleRomaji: 'Hyaku-en shika arimasen.',
      exampleBn: '১০০ ইয়েন ছাড়া আর কিছুই নেই।'
    },
    {
      particle: 'ね',
      romaji: 'ne',
      roleBn: 'সম্মতি চাওয়া (তাই না?)',
      explanationBn: 'শ্রোতার একমত বা সম্মতি প্রত্যাশা করে বাক্যের শেষে বসে।',
      exampleJp: '今日はいい天気ですね。',
      exampleFurigana: 'きょうはいいてんきですね。',
      exampleRomaji: 'Kyou wa ii tenki desu ne.',
      exampleBn: 'আজ চমৎকার আবহাওয়া, তাই না?'
    },
    {
      particle: 'よ',
      romaji: 'yo',
      roleBn: 'নতুন তথ্য / নিশ্চয়তা প্রদান',
      explanationBn: 'শ্রোতাকে কোনো নতুন তথ্য জানানো বা নিশ্চিত করার জন্য বাক্যের শেষে বসে।',
      exampleJp: '明日は休みですよ。',
      exampleFurigana: 'あしたはやすみですよ。',
      exampleRomaji: 'Ashita wa yasumi desu yo.',
      exampleBn: 'কাল কিন্তু ছুটির দিন!'
    }
  ];

  // ---------------------------------------------------------------------------
  // 2. COUNTERS DATA
  // ---------------------------------------------------------------------------
  const countersData: CounterItem[] = [
    {
      counter: '〜つ (Tsu)',
      meaningBn: 'সাধারণ বস্তু গণনায় (১ থেকে ১০)',
      forWhatBn: 'যেকোনো ছোট বস্তু, ফল, খাবার বা বিমূর্ত বিষয়',
      readings: [
        { num: 1, jp: 'ひとつ', romaji: 'hitotsu', isIrregular: true },
        { num: 2, jp: 'ふたつ', romaji: 'futatsu', isIrregular: true },
        { num: 3, jp: 'みっつ', romaji: 'mittsu', isIrregular: true },
        { num: 4, jp: 'よっつ', romaji: 'yottsu', isIrregular: true },
        { num: 5, jp: 'いつつ', romaji: 'itsutsu', isIrregular: true },
        { num: 6, jp: 'むっつ', romaji: 'muttsu', isIrregular: true },
        { num: 7, jp: 'ななつ', romaji: 'nanatsu', isIrregular: true },
        { num: 8, jp: 'やっつ', romaji: 'yattsu', isIrregular: true },
        { num: 9, jp: 'ここのつ', romaji: 'kokonotsu', isIrregular: true },
        { num: 10, jp: 'とお', romaji: 'too', isIrregular: true }
      ]
    },
    {
      counter: '〜本 (Hon / Bon / Pon)',
      meaningBn: 'লম্বা ও বেলনাকার বস্তু',
      forWhatBn: 'কলম, পেন্সিল, বোতল, ছাতা, গাছ, নদী',
      readings: [
        { num: 1, jp: 'いっぽん', romaji: 'ippon', isIrregular: true },
        { num: 2, jp: 'にほん', romaji: 'nihon' },
        { num: 3, jp: 'さんぼん', romaji: 'sambon', isIrregular: true },
        { num: 4, jp: 'よんほん', romaji: 'yonhon' },
        { num: 5, jp: 'ごほん', romaji: 'gohon' },
        { num: 6, jp: 'ろっぽん', romaji: 'roppon', isIrregular: true },
        { num: 7, jp: 'ななほん', romaji: 'nanahon' },
        { num: 8, jp: 'はっぽん', romaji: 'happon', isIrregular: true },
        { num: 9, jp: 'きゅうほん', romaji: 'kyuuhon' },
        { num: 10, jp: 'じゅっぽん', romaji: 'juppon', isIrregular: true }
      ]
    },
    {
      counter: '〜枚 (Mai)',
      meaningBn: 'পাতলা ও চ্যাপ্টা জিনিস',
      forWhatBn: 'কাগজ, টিকিট, ছবি, প্লেট, শার্ট/টি-শার্ট',
      readings: [
        { num: 1, jp: 'いちまい', romaji: 'ichimai' },
        { num: 2, jp: 'にまい', romaji: 'nimai' },
        { num: 3, jp: 'さんまい', romaji: 'sammai' },
        { num: 4, jp: 'よんまい', romaji: 'yommai' },
        { num: 5, jp: 'ごまい', romaji: 'gomai' },
        { num: 6, jp: 'ろくまい', romaji: 'rokumai' },
        { num: 7, jp: 'ななまい', romaji: 'nanamai' },
        { num: 8, jp: 'はちまい', romaji: 'hachimai' },
        { num: 9, jp: 'きゅうまい', romaji: 'kyuumai' },
        { num: 10, jp: 'じゅうまい', romaji: 'juumai' }
      ]
    },
    {
      counter: '〜人 (Nin / Ri)',
      meaningBn: 'মানুষ গণনায়',
      forWhatBn: 'ব্যক্তি, লোকসংখ্যা',
      readings: [
        { num: 1, jp: 'ひとり', romaji: 'hitori', isIrregular: true },
        { num: 2, jp: 'ふたり', romaji: 'futari', isIrregular: true },
        { num: 3, jp: 'さんにん', romaji: 'sannin' },
        { num: 4, jp: 'よにん', romaji: 'yonin', isIrregular: true },
        { num: 5, jp: 'ごにん', romaji: 'gonin' },
        { num: 6, jp: 'ろくにん', romaji: 'rokunin' },
        { num: 7, jp: 'しちにん / ななにん', romaji: 'shichinin' },
        { num: 8, jp: 'はちにん', romaji: 'hachinin' },
        { num: 9, jp: 'くにん / きゅうにん', romaji: 'kunin' },
        { num: 10, jp: 'じゅうにん', romaji: 'juunin' }
      ]
    },
    {
      counter: '〜冊 (Satsu)',
      meaningBn: 'বই ও বাঁধাই করা পুস্তিকা',
      forWhatBn: 'বই, ম্যাগাজিন, নোটবুক, ডায়েরি',
      readings: [
        { num: 1, jp: 'いっさつ', romaji: 'issatsu', isIrregular: true },
        { num: 2, jp: 'にさつ', romaji: 'nisatsu' },
        { num: 3, jp: 'さんさつ', romaji: 'sansatsu' },
        { num: 4, jp: 'よんさつ', romaji: 'yonsatsu' },
        { num: 5, jp: 'ごさつ', romaji: 'gosatsu' },
        { num: 6, jp: 'ろくさつ', romaji: 'rokusatsu' },
        { num: 7, jp: 'ななさつ', romaji: 'nanasatsu' },
        { num: 8, jp: 'はっさつ', romaji: 'hassatsu', isIrregular: true },
        { num: 9, jp: 'きゅうさつ', romaji: 'kyuusatsu' },
        { num: 10, jp: 'じゅっさつ', romaji: 'jussatsu', isIrregular: true }
      ]
    },
    {
      counter: '〜台 (Dai)',
      meaningBn: 'যন্ত্রপাতি ও যানবাহন',
      forWhatBn: 'গাড়ি, সাইকেল, কম্পিউটার, মোবাইল ফোন, টিভি',
      readings: [
        { num: 1, jp: 'いちだい', romaji: 'ichidai' },
        { num: 2, jp: 'にだい', romaji: 'nidai' },
        { num: 3, jp: 'さんだい', romaji: 'sandai' },
        { num: 4, jp: 'よんだい', romaji: 'yondai' },
        { num: 5, jp: 'ごだい', romaji: 'godai' },
        { num: 6, jp: 'ろくだい', romaji: 'rokudai' },
        { num: 7, jp: 'ななだい', romaji: 'nanadai' },
        { num: 8, jp: 'はちだい', romaji: 'hachidai' },
        { num: 9, jp: 'きゅうだい', romaji: 'kyuudai' },
        { num: 10, jp: 'じゅうだい', romaji: 'juudai' }
      ]
    },
    {
      counter: '〜杯 (Hai / Bai / Pai)',
      meaningBn: 'কাপ ও গ্লাসভর্তি পানীয়',
      forWhatBn: 'চা, কফি, পানি, স্যুপ, বাটি',
      readings: [
        { num: 1, jp: 'いっぱい', romaji: 'ippai', isIrregular: true },
        { num: 2, jp: 'にはい', romaji: 'nihai' },
        { num: 3, jp: 'さんばい', romaji: 'sambai', isIrregular: true },
        { num: 4, jp: 'よんはい', romaji: 'yonhai' },
        { num: 5, jp: 'ごはい', romaji: 'gohai' },
        { num: 6, jp: 'ろっぱい', romaji: 'roppai', isIrregular: true },
        { num: 7, jp: 'ななはい', romaji: 'nanahai' },
        { num: 8, jp: 'はっぱい', romaji: 'happai', isIrregular: true },
        { num: 9, jp: 'きゅうはい', romaji: 'kyuuhai' },
        { num: 10, jp: 'じゅっぱい', romaji: 'juppai', isIrregular: true }
      ]
    },
    {
      counter: '〜階 (Kai / Gai)',
      meaningBn: 'ভবনের তলা (ফ্লোর)',
      forWhatBn: '১ম তলা, ২য় তলা, ৩য় তলা',
      readings: [
        { num: 1, jp: 'いっかい', romaji: 'ikkai', isIrregular: true },
        { num: 2, jp: 'にかい', romaji: 'nikai' },
        { num: 3, jp: 'さんがい', romaji: 'sangai', isIrregular: true },
        { num: 4, jp: 'よんかい', romaji: 'yonkai' },
        { num: 5, jp: 'ごかい', romaji: 'gokai' },
        { num: 6, jp: 'ろっかい', romaji: 'rokkai', isIrregular: true },
        { num: 7, jp: 'ななかい', romaji: 'nanakai' },
        { num: 8, jp: 'はちかい / はっかい', romaji: 'hachikai' },
        { num: 9, jp: 'きゅうかい', romaji: 'kyuukai' },
        { num: 10, jp: 'じゅっかい', romaji: 'jukkai', isIrregular: true }
      ]
    }
  ];

  // ---------------------------------------------------------------------------
  // 3. KANJI RADICALS DATA
  // ---------------------------------------------------------------------------
  const radicalsData: RadicalItem[] = [
    {
      radical: '亻',
      nameJp: 'にんべん (Ninben)',
      meaningBn: 'মানুষ বা ব্যক্তি নির্দেশক',
      examples: ['休 (বিশ্রাম)', '体 (শরীর)', '作 (তৈরি করা)', '働 (কাজ করা)'],
      explanationBn: 'বামে বসে মানুষের ক্রিয়া ও সত্তা সংশ্লিষ্ট কাঞ্জি গঠন করে।'
    },
    {
      radical: '氵',
      nameJp: 'さんずい (Sanzui)',
      meaningBn: 'পানি বা তরল পদার্থ',
      examples: ['海 (সমুদ্র)', '泳 (সাঁতার)', '洗 (ধোয়া)', '池 (পুকুর)'],
      explanationBn: 'তিন ফোঁটা পানির প্রতীক; পানি, নদী বা পরিষ্কারের কাঞ্জিতে থাকে।'
    },
    {
      radical: '木',
      nameJp: 'きへん (Kihen)',
      meaningBn: 'গাছ বা কাঠের উপাদান',
      examples: ['林 (ছোট বন)', '森 (গহীন বন)', '校 (বিদ্যালয়)', '机 (টেবিল)'],
      explanationBn: 'উদ্ভিদ, গাছপালা বা কাঠ দিয়ে তৈরি আসবাবপত্রের কাঞ্জিতে বসে।'
    },
    {
      radical: '口',
      nameJp: 'くち (Kuchi)',
      meaningBn: 'মুখ, কথাবার্তা বা প্রবেশদ্বার',
      examples: ['呼 (ডাকা)', '吸 (শ্বাস নেওয়া)', '味 (স্বাদ)', '咲 (ফোটা)'],
      explanationBn: 'মুখের কাজ খাওয়া, পান করা, কথা বলা নির্দেশ করে।'
    },
    {
      radical: '日',
      nameJp: 'ひへん (Hihen)',
      meaningBn: 'সূর্য, দিন বা আলো',
      examples: ['明 (উজ্জ্বল)', '暗 (অন্ধকার)', '晴 (পরিষ্কার আকাশ)', '時 (সময়)'],
      explanationBn: 'সূর্যের আলো, দিন এবং সময় সংক্রান্ত কাঞ্জিতে বামে বসে।'
    },
    {
      radical: '月',
      nameJp: 'つきへん (Tsukihen) / にくづき',
      meaningBn: 'চাঁদ / মানব অঙ্গপ্রত্যঙ্গ',
      examples: ['朝 (সকাল)', '期 (সময়কাল)', '服 (পোশাক)', '脳 (মস্তিষ্ক)'],
      explanationBn: 'চাঁদ বা মানব শরীরের বিভিন্ন অংশ বোঝাতে ব্যবহৃত হয়।'
    },
    {
      radical: '火 / 灬',
      nameJp: 'ひ / れんが (Hi / Renga)',
      meaningBn: 'আগুন ও উত্তাপ',
      examples: ['焼 (পোড়ানো/ভাজা)', '煙 (ধোঁয়া)', '照 (আলোকিত করা)', '点 (বিন্দু)'],
      explanationBn: 'রান্না, তাপ বা আগুন সংশ্লিষ্ট কাঞ্জির নিচে বা পাশে থাকে।'
    },
    {
      radical: '心 / 忄',
      nameJp: 'こころ / りっしんべん (Kokoro)',
      meaningBn: 'হৃদয়, অনুভূতি ও মন',
      examples: ['思 (ভাবা)', '感 (অনুভূতি)', '忙 (ব্যস্ত)', '情 (আবেগ)'],
      explanationBn: 'মানসিক চিন্তা ও আবেগের কাঞ্জিতে ব্যবহৃত হয়।'
    },
    {
      radical: '手 / 扌',
      nameJp: 'て / てへん (Tehen)',
      meaningBn: 'হাত ও হাতের স্পর্শ',
      examples: ['持 (ধরা/রাখা)', '指 (আঙুল)', '打 (আঘাত করা)', '押 (ধাক্কা দেওয়া)'],
      explanationBn: 'হাত দিয়ে কোনো কাজ করা বোঝাতে কাঞ্জির বামে বসে।'
    },
    {
      radical: '言',
      nameJp: 'ごんべん (Gomben)',
      meaningBn: 'ভাষা, কথা ও শব্দ',
      examples: ['話 (কথা বলা)', '語 (ভাষা)', '読 (পড়া)', '訳 (অনুবাদ)'],
      explanationBn: 'বক্তব্য, বই পড়া ও যোগাযোগ সংক্রান্ত কাঞ্জিতে বসে।'
    },
    {
      radical: '門',
      nameJp: 'もんがまえ (Mongamae)',
      meaningBn: 'দরজা, ফটক বা পরিবেষ্টনী',
      examples: ['開 (খোলা)', '閉 (বন্ধ করা)', '間 (মাঝখানে/ব্যবধানে)', '聞 (শোনা)'],
      explanationBn: 'দরজা বা তার ভেতরে ঘটে যাওয়া কাজের কাঞ্জিতে ফ্রেম হিসেবে বসে।'
    },
    {
      radical: '糸',
      nameJp: 'いとへん (Itohen)',
      meaningBn: 'সুতো, বন্ধন বা সম্পর্ক',
      examples: ['終 (শেষ)', '約 (প্রতিশ্রুতি)', '紙 (কাগজ)', '絵 (ছবি)'],
      explanationBn: 'সুতা দিয়ে বোনা, সংযোগ বা সম্পর্কযুক্ত কাঞ্জিতে থাকে।'
    }
  ];

  // ---------------------------------------------------------------------------
  // 4. VERB CONJUGATION MATRIX DATA
  // ---------------------------------------------------------------------------
  const verbsConjugationData: VerbConjugationItem[] = [
    {
      verbJp: 'かく',
      kanji: '書く',
      meaningBn: 'লেখা (to write)',
      group: 'Group 1 (五段)',
      dictionary: '書く (kaku)',
      masu: '書きます (kakimasu)',
      te: '書いて (kaite)',
      nai: '書かない (kakanai)',
      ta: '書いた (kaita)',
      potential: '書ける (kakeru)'
    },
    {
      verbJp: 'のむ',
      kanji: '飲む',
      meaningBn: 'পান করা (to drink)',
      group: 'Group 1 (五段)',
      dictionary: '飲む (nomu)',
      masu: '飲みます (nomimasu)',
      te: '飲んで (nonde)',
      nai: '飲まない (nomanai)',
      ta: '飲んだ (nonda)',
      potential: '飲める (nomeru)'
    },
    {
      verbJp: 'かう',
      kanji: '買う',
      meaningBn: 'কেনা (to buy)',
      group: 'Group 1 (五段)',
      dictionary: '買う (kau)',
      masu: '買います (kaimasu)',
      te: '買って (katte)',
      nai: '買わない (kawanai)',
      ta: '買った (katta)',
      potential: '買える (kaeru)'
    },
    {
      verbJp: 'はなす',
      kanji: '話す',
      meaningBn: 'কথা বলা (to speak)',
      group: 'Group 1 (五段)',
      dictionary: '話す (hanasu)',
      masu: '話します (hanashimasu)',
      te: '話して (hanashite)',
      nai: '話さない (hanasanai)',
      ta: '話した (hanashita)',
      potential: '話せる (hanaseru)'
    },
    {
      verbJp: 'たべる',
      kanji: '食べる',
      meaningBn: 'খাওয়া (to eat)',
      group: 'Group 2 (一段)',
      dictionary: '食べる (taberu)',
      masu: '食べます (tabemasu)',
      te: '食べて (tabete)',
      nai: '食べない (tabenai)',
      ta: '食べた (tabeta)',
      potential: '食べられる (taberareru)'
    },
    {
      verbJp: 'みる',
      kanji: '見る',
      meaningBn: 'দেখা (to see / watch)',
      group: 'Group 2 (一段)',
      dictionary: '見る (miru)',
      masu: '見ます (mimasu)',
      te: '見て (mite)',
      nai: '見ない (minai)',
      ta: '見た (mita)',
      potential: '見られる (mirareru)'
    },
    {
      verbJp: 'する',
      kanji: 'する',
      meaningBn: 'করা (to do)',
      group: 'Group 3 (不規則)',
      dictionary: 'する (suru)',
      masu: 'します (shimasu)',
      te: 'して (shite)',
      nai: 'しない (shinai)',
      ta: 'した (shita)',
      potential: 'できる (dekiru)'
    },
    {
      verbJp: 'くる',
      kanji: '来る',
      meaningBn: 'আসা (to come)',
      group: 'Group 3 (不規則)',
      dictionary: '来る (kuru)',
      masu: '来ます (kimasu)',
      te: '来て (kite)',
      nai: '来ない (konai)',
      ta: '来た (kita)',
      potential: '来られる (korareru)'
    }
  ];

  // ---------------------------------------------------------------------------
  // 5. CALENDAR & TIME GUIDE
  // ---------------------------------------------------------------------------
  const daysOfWeek = [
    { jp: '月曜日', furigana: 'げつようび', romaji: 'getsuyoubi', bn: 'সোমবার', element: '月 (চাঁদ - Moon)' },
    { jp: '火曜日', furigana: 'かようび', romaji: 'kayoubi', bn: 'মঙ্গলবার', element: '火 (আগুন - Fire)' },
    { jp: '水曜日', furigana: 'すいようび', romaji: 'suiyoubi', bn: 'বুধবার', element: '水 (পানি - Water)' },
    { jp: '木曜日', furigana: 'もくようび', romaji: 'mokuyoubi', bn: 'বৃহস্পতিবার', element: '木 (গাছ - Wood)' },
    { jp: '金曜日', furigana: 'きんようび', romaji: 'kinyoubi', bn: 'শুক্রবার', element: '金 (স্বর্ণ - Gold)' },
    { jp: '土曜日', furigana: 'どようび', romaji: 'doyoubi', bn: 'শনিবার', element: '土 (মাটি - Earth)' },
    { jp: '日曜日', furigana: 'にちようび', romaji: 'nichiyoubi', bn: 'রবিবার', element: '日 (সূর্য - Sun)' }
  ];

  const specialDatesOfMonth = [
    { day: '১ তারিখ', jp: 'ついたち', romaji: 'tsuitachi' },
    { day: '২ তারিখ', jp: 'ふつか', romaji: 'futsuka' },
    { day: '৩ তারিখ', jp: 'みっか', romaji: 'mikka' },
    { day: '৪ তারিখ', jp: 'よっか', romaji: 'yokka' },
    { day: '৫ তারিখ', jp: 'いつか', romaji: 'itsuka' },
    { day: '৬ তারিখ', jp: 'むいか', romaji: 'muika' },
    { day: '৭ তারিখ', jp: 'なのか', romaji: 'nanoka' },
    { day: '৮ তারিখ', jp: 'ようか', romaji: 'youka' },
    { day: '৯ তারিখ', jp: 'ここのか', romaji: 'kokonoka' },
    { day: '১০ তারিখ', jp: 'とおか', romaji: 'tooka' },
    { day: '১৪ তারিখ', jp: 'じゅうよっか', romaji: 'juuyokka' },
    { day: '২০ তারিখ', jp: 'はつか', romaji: 'hatsuka' },
    { day: '২৪ তারিখ', jp: 'にじゅうよっか', romaji: 'nijuuyokka' }
  ];

  // ---------------------------------------------------------------------------
  // FILTERING LOGIC
  // ---------------------------------------------------------------------------
  const filteredParticles = useMemo(() => {
    if (!searchQuery) return particlesData;
    const q = searchQuery.toLowerCase();
    return particlesData.filter(p => 
      p.particle.toLowerCase().includes(q) ||
      p.romaji.toLowerCase().includes(q) ||
      p.roleBn.toLowerCase().includes(q) ||
      p.explanationBn.toLowerCase().includes(q) ||
      p.exampleJp.includes(q)
    );
  }, [searchQuery]);

  const filteredCounters = useMemo(() => {
    if (!searchQuery) return countersData;
    const q = searchQuery.toLowerCase();
    return countersData.filter(c => 
      c.counter.toLowerCase().includes(q) ||
      c.meaningBn.toLowerCase().includes(q) ||
      c.forWhatBn.toLowerCase().includes(q) ||
      c.readings.some(r => r.jp.includes(q) || r.romaji.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const filteredRadicals = useMemo(() => {
    if (!searchQuery) return radicalsData;
    const q = searchQuery.toLowerCase();
    return radicalsData.filter(r => 
      r.radical.includes(q) ||
      r.nameJp.toLowerCase().includes(q) ||
      r.meaningBn.toLowerCase().includes(q) ||
      r.examples.some(e => e.includes(q))
    );
  }, [searchQuery]);

  const filteredVerbs = useMemo(() => {
    if (!searchQuery) return verbsConjugationData;
    const q = searchQuery.toLowerCase();
    return verbsConjugationData.filter(v => 
      v.kanji.includes(q) ||
      v.verbJp.includes(q) ||
      v.meaningBn.toLowerCase().includes(q) ||
      v.group.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      
      {/* =========================================================================
          HERO BANNER: EXECUTIVE PROFESSIONAL STUDY SUITE
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-[#111520] text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md text-slate-200 text-xs font-semibold mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>JLPT {currentLevel} স্টাডি রিসোর্স ও ব্যাকরণ সংগ্রহশালা</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-japanese leading-tight mb-2">
              রিসোর্স ও ব্যাকরণ গাইড <span className="text-rose-400 font-sans text-xl sm:text-2xl font-bold">Cheat Sheets</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-bengali leading-relaxed max-w-xl">
              জাপানিজ ভাষার আবশ্যকীয় কণা (Particles), গণনার নিয়মাবলী (Counters), মূল কাঞ্জি র‌্যাডিক্যালস এবং ক্রিয়ার রূপান্তর চার্ট — দ্রুত রিভিশন ও আত্মস্থের জন্য একক প্ল্যাটফর্মে।
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer font-bengali"
              title="চিটশিট প্রিন্ট বা পিডিএফ হিসেবে সেভ করুন"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>প্রিন্ট / সেভ PDF</span>
            </button>

            {onNavigateMode && (
              <button
                onClick={() => onNavigateMode('flashcards')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-2 cursor-pointer font-bengali"
              >
                <span>ফ্ল্যাশকার্ডে ফিরুন</span>
                <ArrowRight className="w-4 h-4 text-rose-400" />
              </button>
            )}
          </div>
        </div>

        {/* SEARCH BAR & CATEGORY SELECTOR */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="যেকোনো কণা, নিয়ম, কাঞ্জি বা কাউন্টার খুঁজুন (যেমন: は, 本, 人, Te-form)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 dark:bg-slate-950/70 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-bengali transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                মুছুন
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          RESOURCE CATEGORY TABS
         ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'সকল রিসোর্স', icon: <Layers className="w-4 h-4" /> },
          { id: 'particles', label: 'কণা ও ব্যাকরণ (Particles)', icon: <Compass className="w-4 h-4" /> },
          { id: 'counters', label: 'গণনা ও কাউন্টারস (助数詞)', icon: <Hash className="w-4 h-4" /> },
          { id: 'kanji', label: 'কাঞ্জি ও র‌্যাডিক্যালস (部首)', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'verbs', label: 'ক্রিয়া রূপান্তর (動詞活用)', icon: <Flame className="w-4 h-4" /> },
          { id: 'calendar', label: 'দিন, বার ও সময়', icon: <Clock className="w-4 h-4" /> },
          { id: 'cheatsheet', label: 'একনজরে চিটশিট', icon: <FileText className="w-4 h-4" /> }
        ].map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as ResourceCategory)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-bold'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span className="font-bengali">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          1. PARTICLES SECTION
         ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'particles') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-rose-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-bengali">
                জাপানিজ কণা ও ব্যাকরণ গাইড (JLPT Particles)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {filteredParticles.length} টি প্রধান কণা
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParticles.map((item, idx) => (
              <div 
                key={idx}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Particle Symbol & Role */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 font-japanese font-black text-xl flex items-center justify-center">
                        {item.particle}
                      </span>
                      <div>
                        <div className="text-[11px] font-mono text-slate-500 font-bold">[{item.romaji}]</div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-bengali leading-tight">
                          {item.roleBn}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => speakJapanese(item.exampleJp)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="উদাহরণ শুনুন"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Rule Explanation */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-bengali leading-relaxed mb-3">
                    {item.explanationBn}
                  </p>
                </div>

                {/* Example Box */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 p-3 mt-1">
                  <div className="text-xs font-japanese font-bold text-slate-900 dark:text-white mb-0.5">
                    {item.exampleJp}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                    {item.exampleRomaji}
                  </div>
                  <div className="text-xs font-bengali font-medium text-rose-700 dark:text-rose-400">
                    {item.exampleBn}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          2. COUNTERS SECTION (助数詞)
         ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'counters') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-amber-500" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-bengali">
                জাপানিজ গণনার নিয়মাবলী ও কাউন্টারস (Counters Guide)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {filteredCounters.length} টি কাউন্টার ক্যাটাগরি
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCounters.map((counter, idx) => (
              <div 
                key={idx}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold font-japanese text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 font-mono text-xs">
                        {counter.counter}
                      </span>
                      <span className="font-bengali text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {counter.meaningBn}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali mt-1">
                      ব্যবহার: {counter.forWhatBn}
                    </p>
                  </div>
                </div>

                {/* Grid of 1 to 10 Numbers */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {counter.readings.map((r) => (
                    <div 
                      key={r.num}
                      onClick={() => speakJapanese(r.jp)}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer hover:scale-102 active:scale-98 ${
                        r.isIrregular 
                          ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200' 
                          : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200/70 dark:border-slate-800 text-slate-900 dark:text-slate-200'
                      }`}
                      title={`${r.jp} (${r.romaji}) - ক্লিক করে উচ্চারণ শুনুন`}
                    >
                      <div className="text-[10px] font-mono text-slate-400 font-bold mb-0.5">
                        {r.num}
                      </div>
                      <div className="text-xs font-japanese font-bold truncate">
                        {r.jp}
                      </div>
                      <div className="text-[9px] font-mono opacity-75 truncate">
                        {r.romaji}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[10px] text-slate-400 text-right font-bengali">
                  * হালকা হলুদ রঙে চিহ্নিত শব্দগুলোতে বিশেষ উচ্চারণ ব্যবহৃত হয়।
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          3. KANJI RADICALS SECTION (部首)
         ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'kanji') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-emerald-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-bengali">
                কাঞ্জি বেসিক ও বুশু র‌্যাডিক্যালস (214 Radicals Essential Guide)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {filteredRadicals.length} টি প্রধান বুশু
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRadicals.map((rad, idx) => (
              <div 
                key={idx}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 font-japanese font-black text-2xl flex items-center justify-center shrink-0">
                      {rad.radical}
                    </span>
                    <div>
                      <div className="text-[11px] font-japanese font-bold text-slate-500">
                        {rad.nameJp}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bengali">
                        {rad.meaningBn}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-bengali leading-relaxed mb-3">
                    {rad.explanationBn}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 p-2.5">
                  <div className="text-[10px] font-bold text-slate-400 font-bengali mb-1.5 uppercase">
                    সাধারণ কাঞ্জি উদাহরণ:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rad.examples.map((ex, i) => (
                      <span 
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-japanese font-semibold text-slate-800 dark:text-slate-200"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          4. VERB CONJUGATION MATRIX SECTION (動詞活用)
         ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'verbs') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-blue-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-bengali">
                জাপানিজ ক্রিয়ার কনজুগেশন ও রূপান্তর চার্ট (Verb Conjugations)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Group 1, Group 2, Group 3
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bengali">
                  <th className="p-3 sm:p-4">ক্রিয়া ও অর্থ</th>
                  <th className="p-3 sm:p-4">গ্রুপ</th>
                  <th className="p-3 sm:p-4">Masu (মার্জিত)</th>
                  <th className="p-3 sm:p-4">Te (সংযোগ/অনুরোধ)</th>
                  <th className="p-3 sm:p-4">Nai (না-বোধক)</th>
                  <th className="p-3 sm:p-4">Ta (অতীতকাল)</th>
                  <th className="p-3 sm:p-4">Potential (সামর্থ্য)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-japanese">
                {filteredVerbs.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 sm:p-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {v.kanji}
                      </div>
                      <div className="text-[11px] font-bengali text-slate-500">
                        {v.meaningBn}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {v.group}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 font-semibold text-slate-800 dark:text-slate-200">
                      {v.masu}
                    </td>
                    <td className="p-3 sm:p-4 font-bold text-rose-700 dark:text-rose-400">
                      {v.te}
                    </td>
                    <td className="p-3 sm:p-4 font-semibold text-slate-800 dark:text-slate-200">
                      {v.nai}
                    </td>
                    <td className="p-3 sm:p-4 font-semibold text-slate-800 dark:text-slate-200">
                      {v.ta}
                    </td>
                    <td className="p-3 sm:p-4 font-semibold text-blue-700 dark:text-blue-400">
                      {v.potential}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =========================================================================
          5. CALENDAR & TIME GUIDE
         ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'calendar') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-violet-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-bengali">
                দিন, বার, মাস ও সময় নির্দেশিকা (Days & Time Guide)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Days of Week */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bengali mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                সপ্তাহের ৭ দিন (曜日 - Youbi)
              </h3>
              <div className="space-y-2">
                {daysOfWeek.map((day, idx) => (
                  <div 
                    key={idx}
                    onClick={() => speakJapanese(day.jp)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-japanese font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {day.jp}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        ({day.romaji})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bengali font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {day.bn}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {day.element}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Dates of Month */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bengali mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                মাসের বিশেষ তারিখসমূহ (১ম থেকে ১০ম, ১৪, ২০, ২৪)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {specialDatesOfMonth.map((d, idx) => (
                  <div 
                    key={idx}
                    onClick={() => speakJapanese(d.jp)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <div className="text-[10px] text-slate-500 font-bengali">
                      {d.day}
                    </div>
                    <div className="font-japanese font-bold text-xs text-rose-700 dark:text-rose-400">
                      {d.jp}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      {d.romaji}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          6. PRINTABLE CHEATSHEET SUMMARY
         ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'cheatsheet') && (
        <section className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 sm:p-8 border border-slate-800 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold font-bengali">
                একনজরে অফলাইন স্টাডি ও প্রিন্ট চিটশিট
              </h3>
              <p className="text-xs text-slate-400 font-bengali mt-0.5">
                পরীক্ষার আগে দ্রুত চোখ বুলিয়ে নেওয়ার জন্য সকল নিয়মাবলী এক পাতায়
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer font-bengali shrink-0"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>প্রিন্ট করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bengali text-slate-300">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
              <strong className="text-white block mb-1">কণা সারসংক্ষেপ:</strong>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-300">
                <li>は (বিষয়) | が (নির্দিষ্ট কর্তা/পছন্দ)</li>
                <li>を (অবজেক্ট) | に (সময়/গন্তব্য)</li>
                <li>で (কাজের স্থান/মাধ্যম) | と (সাথে/এবং)</li>
                <li>も (তুমিও) | から (হতে) | まで (পর্যন্ত)</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
              <strong className="text-white block mb-1">কাউন্টার নিয়ম:</strong>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-300">
                <li>つ (১-১০ সাধারণ বস্তু)</li>
                <li>本 (লম্বা: いっぽん, さんぼん)</li>
                <li>枚 (পাতলা কাগজ/শার্ট)</li>
                <li>人 (ひとり, ふたり, さんにん)</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
              <strong className="text-white block mb-1">কাঞ্জি পড়ার কৌশল:</strong>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-300">
                <li>অন-রিডিং: কাঞ্জি যৌগে ব্যবহৃত হয়</li>
                <li>কুন-রিডিং: একা বা ওকুদিগেরানার সাথে</li>
                <li>বামের বুশু নির্দেশ করে অর্থের ধরণ</li>
                <li>ডানের অংশ নির্দেশ করে প্রায়শই উচ্চারণ</li>
              </ul>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
