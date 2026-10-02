import re, json, sys

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

print(f"Total existing items indexed for examples: {len(existing)}")
