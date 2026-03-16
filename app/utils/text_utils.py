import re
from collections import Counter

STOP_WORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "it", "as", "be", "was", "are",
    "this", "that", "has", "have", "had", "not", "all", "can", "will",
    "do", "if", "my", "no", "so", "up", "he", "she", "we", "us", "me",
    "you", "your", "its", "his", "her", "our", "their", "them", "they",
    "been", "more", "also", "than", "each", "may", "into", "over",
    "such", "just", "about", "would", "could", "should", "which", "when",
    "how", "what", "where", "who", "there", "here", "out", "very", "most",
    "some", "any", "other", "new", "one", "two", "get", "use", "make",
}


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


def get_primary_keyword(text: str) -> str:
    """Extract the most frequent meaningful bigram from text."""
    words = re.findall(r'\b[a-zA-Z]{2,}\b', text.lower())
    meaningful = [w for w in words if w not in STOP_WORDS and len(w) > 2]

    if len(meaningful) < 2:
        return meaningful[0] if meaningful else ""

    bigrams = []
    for i in range(len(meaningful) - 1):
        bigrams.append(f"{meaningful[i]} {meaningful[i + 1]}")

    if not bigrams:
        return meaningful[0] if meaningful else ""

    counter = Counter(bigrams)
    return counter.most_common(1)[0][0]
