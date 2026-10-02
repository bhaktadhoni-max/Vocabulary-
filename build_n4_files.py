# -*- coding: utf-8 -*-
"""
Full JLPT N4 Vocabulary Generator for Lessons 26 - 50
With authentic Japanese, Hiragana, Romaji, Bangla Meanings, Part of Speech, Context, and Examples.
"""
import json, os

def make_item(id_num, kanji, hiragana, romaji, bn, category_key, category_name, lesson, pos, example_jp, example_furi, example_romaji, example_bn, context=""):
    return {
        "id": id_num,
        "kanji": kanji,
        "hiragana": hiragana,
        "romaji": romaji,
        "bn": bn,
        "categoryKey": category_key,
        "category": category_name,
        "lesson": lesson,
        "partOfSpeech": pos,
        "exampleJp": example_jp,
        "exampleFurigana": example_furi,
        "exampleRomaji": example_romaji,
        "exampleBn": example_bn,
        "context": context,
        "jlpt": "N4"
    }

# We will generate modular files:
# lesson26_30.ts, lesson31_35.ts, lesson36_40.ts, lesson41_45.ts, lesson46_50.ts
print("Initialized generator structure.")
