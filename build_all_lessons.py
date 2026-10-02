import re, json

# Category display names
CAT_MAP = {
    'pronouns': '代名詞 সর্বনাম',
    'numbers': '数字 সংখ্যা',
    'time': '時間 সময়',
    'calendar': '曜日・月 বার ও মাস',
    'family': '家族 পরিবার',
    'people': '人 মানুষ',
    'body': '体 শরীর',
    'colors': '色 রং',
    'food': '食べ物 খাবার',
    'clothing': '衣服 পোশাক',
    'house': '家・家具 ঘরবাড়ি',
    'nature': '自然・天気 প্রকৃতি',
    'animals': '動物 প্রাণী',
    'places': '場所 স্থান',
    'positions': '位置 অবস্থান',
    'transport': '交通 যানবাহন',
    'study': '勉強・学校 পড়াশোনা',
    'verbs': '動詞 ক্রিয়া',
    'i_adj': 'い形容詞 ই-বিশেষণ',
    'na_adj': 'な形容詞 না-বিশেষণ',
    'adverbs': '副詞 ক্রিয়া-বিশেষণ',
    'counters': '助数詞 গণনা',
    'others': '助詞・その他 অন্যান্য',
    'greetings': '挨拶 অভিবাদন'
}

print("Loaded Category map")
