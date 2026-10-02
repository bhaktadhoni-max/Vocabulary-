import re

files = ['src/data/vocab_part1.ts', 'src/data/vocab_part2.ts', 'src/data/vocab_part3.ts', 'src/data/vocab_part4.ts', 'src/data/vocab_part5.ts']
existing = {}

for fn in files:
    with open(fn, 'r', encoding='utf-8') as f:
        content = f.read()
    # Match object blocks
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
        if hiragana:
            existing[hiragana] = item
        if kanji:
            existing[kanji] = item

print(f"Loaded {len(existing)} unique entries from existing files.")
