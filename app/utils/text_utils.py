import re
from collections import Counter


def count_words(text: str) -> int:
    return len(text.split())


def count_sentences(text: str) -> int:
    return len(split_sentences(text))


def split_sentences(text: str) -> list[str]:
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s for s in sentences if s.strip()]


def calculate_word_frequency(text: str) -> dict[str, int]:
    words = re.findall(r'\b[a-zA-Z]{2,}\b', text.lower())
    return dict(Counter(words))


def detect_questions(text: str) -> list[str]:
    sentences = split_sentences(text)
    return [s for s in sentences if s.strip().endswith("?")]


def has_direct_answer(first_paragraph: str, min_words: int = 30, max_words: int = 70) -> bool:
    word_count = count_words(first_paragraph)
    return min_words <= word_count <= max_words
