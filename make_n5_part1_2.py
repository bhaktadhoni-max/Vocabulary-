import re, json

# Load existing database to match examples
files = ['src/data/vocab_part1.ts', 'src/data/vocab_part2.ts', 'src/data/vocab_part3.ts', 'src/data/vocab_part4.ts', 'src/data/vocab_part5.ts']
existing = {}

for fn in files:
    with open(fn, 'r', encoding='utf-8') as f:
        content = f.read()
    blocks = re.findall(r'\{[^{}]*id:\s*\d+[^{}]*\}', content, re.DOTALL)
    for b in blocks:
        def get_field(k):
            m = re.search(rf'{k}:\s*["\'](.*?)["\']', b)
            return m.group(1) if m else ''
        hiragana = get_field('hiragana')
        kanji = get_field('kanji')
        romaji = get_field('romaji')
        ex_jp = get_field('exampleJp')
        ex_furi = get_field('exampleFurigana')
        ex_rom = get_field('exampleRomaji')
        ex_bn = get_field('exampleBn')
        item = {
            'hiragana': hiragana,
            'kanji': kanji,
            'romaji': romaji,
            'exampleJp': ex_jp,
            'exampleFurigana': ex_furi,
            'exampleRomaji': ex_rom,
            'exampleBn': ex_bn
        }
        for k in [hiragana, kanji, romaji.lower()]:
            if k:
                existing[k] = item
                clean = re.sub(r'\[.*?\]|\(.*?\)|〜|~', '', k).strip()
                if clean:
                    existing[clean] = item

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

print("Base loaded successfully.")

def make_item(id_num, lesson, kanji, hiragana, romaji, bn, cat_key, default_ex=None):
    ex_jp = ''
    ex_furi = ''
    ex_rom = ''
    ex_bn = ''
    
    # Check existing
    candidates = [hiragana, kanji, romaji.lower()]
    clean_h = re.sub(r'\[.*?\]|\(.*?\)|〜|~', '', hiragana).strip()
    clean_k = re.sub(r'\[.*?\]|\(.*?\)|〜|~', '', kanji).strip()
    candidates.extend([clean_h, clean_k])
    
    for c in candidates:
        if c in existing and existing[c]['exampleJp']:
            match = existing[c]
            ex_jp = match['exampleJp']
            ex_furi = match['exampleFurigana']
            ex_rom = match['exampleRomaji']
            ex_bn = match['exampleBn']
            break
            
    if not ex_jp and default_ex:
        ex_jp, ex_furi, ex_rom, ex_bn = default_ex
        
    if not ex_jp:
        # Fallback simple example
        ex_jp = f"これは{kanji or hiragana}です。"
        ex_furi = f"これは{hiragana}です。"
        ex_rom = f"Kore wa {romaji} desu."
        ex_bn = f"এটি {bn}।"
        
    category_name = CAT_MAP.get(cat_key, 'その他 অন্যান্য')
    return {
        'id': id_num,
        'lesson': lesson,
        'kanji': kanji,
        'hiragana': hiragana,
        'romaji': romaji,
        'bn': bn,
        'category': category_name,
        'categoryKey': cat_key,
        'exampleJp': ex_jp,
        'exampleFurigana': ex_furi,
        'exampleRomaji': ex_rom,
        'exampleBn': ex_bn,
        'jlpt': 'N5'
    }

print("make_item function defined")
