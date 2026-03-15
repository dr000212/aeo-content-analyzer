import re

from bs4 import BeautifulSoup

from app.analyzers.base import BaseAnalyzer
from app.models.response import (
    Category,
    Check,
    Effort,
    ModuleResult,
    Priority,
    Recommendation,
)
from app.utils.html_parser import extract_headings, extract_paragraphs
from app.utils.text_utils import count_words


QUESTION_STARTERS = re.compile(
    r"^(what|how|why|when|where|who|is|can|does|do|should|will|which)\b",
    re.IGNORECASE,
)


class StructureAnalyzer(BaseAnalyzer):
    async def analyze(self, soup: BeautifulSoup, text: str, html: str) -> ModuleResult:
        checks: list[Check] = []
        recommendations: list[Recommendation] = []
        score = 0

        headings = extract_headings(soup)
        paragraphs = extract_paragraphs(soup)
        word_count = count_words(text)
        h1_tags = [h for h in headings if h["level"] == 1]

        # str_01: Single H1 tag
        has_single_h1 = len(h1_tags) == 1
        checks.append(Check(
            id="str_01",
            passed=has_single_h1,
            text=f"Single H1 tag: {'found' if has_single_h1 else f'{len(h1_tags)} found'}",
            impact="High",
            category=Category.STRUCTURE,
        ))
        if has_single_h1:
            score += 15
        else:
            recommendations.append(Recommendation(
                title="Add a single H1 tag",
                description="AI engines expect exactly one H1 as the primary topic signal.",
                priority=Priority.HIGH,
                category=Category.STRUCTURE,
                impact_score=9,
                effort=Effort.LOW,
            ))

        # str_02: Heading hierarchy is correct
        hierarchy_ok = True
        bad_transition = ""
        prev_level = 0
        for h in headings:
            if prev_level > 0 and h["level"] > prev_level + 1:
                hierarchy_ok = False
                bad_transition = f"H{h['level']} after H{prev_level}"
                break
            prev_level = h["level"]

        checks.append(Check(
            id="str_02",
            passed=hierarchy_ok,
            text=f"Heading hierarchy: {'correct' if hierarchy_ok else bad_transition}",
            impact="High",
            category=Category.STRUCTURE,
        ))
        if hierarchy_ok:
            score += 15
        else:
            recommendations.append(Recommendation(
                title="Fix heading hierarchy",
                description=f"Found {bad_transition}. Use sequential heading levels for clear content structure.",
                priority=Priority.HIGH,
                category=Category.STRUCTURE,
                impact_score=8,
                effort=Effort.LOW,
            ))

        # str_03: Direct answer within first 100 words
        first_p = paragraphs[0] if paragraphs else ""
        first_p_words = count_words(first_p)
        has_direct_answer = 30 <= first_p_words <= 80
        checks.append(Check(
            id="str_03",
            passed=has_direct_answer,
            text=f"Direct answer in opening: {'yes' if has_direct_answer else 'no'} ({first_p_words} words)",
            impact="High",
            category=Category.STRUCTURE,
        ))
        if has_direct_answer:
            score += 20
        else:
            recommendations.append(Recommendation(
                title="Add a direct answer paragraph",
                description="Place a concise 40-60 word answer to the primary query in the opening paragraph.",
                priority=Priority.HIGH,
                category=Category.STRUCTURE,
                impact_score=9,
                effort=Effort.MEDIUM,
            ))

        # str_04: Paragraph length (majority 40-80 words)
        long_paragraphs = [p for p in paragraphs if count_words(p) > 80]
        total_p = len(paragraphs) if paragraphs else 1
        majority_ok = len(long_paragraphs) < total_p / 2
        checks.append(Check(
            id="str_04",
            passed=majority_ok,
            text=f"Paragraph length: {len(long_paragraphs)}/{total_p} exceed 80 words",
            impact="High",
            category=Category.STRUCTURE,
        ))
        if majority_ok:
            score += 15
        else:
            recommendations.append(Recommendation(
                title="Break long paragraphs",
                description=f"{len(long_paragraphs)} of {total_p} paragraphs exceed 80 words. AI engines prefer self-contained 40-60 word blocks.",
                priority=Priority.HIGH,
                category=Category.STRUCTURE,
                impact_score=7,
                effort=Effort.MEDIUM,
            ))

        # str_05: Question-format headings
        h2h3 = [h for h in headings if h["level"] in (2, 3)]
        question_headings = [h for h in h2h3 if QUESTION_STARTERS.match(h["text"])]
        has_question_headings = len(question_headings) >= 1
        checks.append(Check(
            id="str_05",
            passed=has_question_headings,
            text=f"Question-format headings: {len(question_headings)} found",
            impact="Medium",
            category=Category.STRUCTURE,
        ))
        if has_question_headings:
            score += 10
        else:
            non_q = len(h2h3) - len(question_headings)
            recommendations.append(Recommendation(
                title="Use question-format headings",
                description=f"Rephrase {non_q} headings as questions to match how users query AI engines.",
                priority=Priority.MEDIUM,
                category=Category.STRUCTURE,
                impact_score=6,
                effort=Effort.LOW,
            ))

        # str_06: Contains lists or tables
        has_lists = bool(soup.find("ul") or soup.find("ol"))
        has_tables = bool(soup.find("table"))
        has_structured = has_lists or has_tables
        checks.append(Check(
            id="str_06",
            passed=has_structured,
            text=f"Lists/tables: {'found' if has_structured else 'none found'}",
            impact="Medium",
            category=Category.STRUCTURE,
        ))
        if has_structured:
            score += 10
        else:
            recommendations.append(Recommendation(
                title="Add structured lists or tables",
                description="AI engines frequently cite tabular and list-format content.",
                priority=Priority.MEDIUM,
                category=Category.STRUCTURE,
                impact_score=6,
                effort=Effort.MEDIUM,
            ))

        # str_07: At least 3 headings for content > 500 words
        enough_headings = len(headings) >= 3 if word_count > 500 else True
        checks.append(Check(
            id="str_07",
            passed=enough_headings,
            text=f"Heading count: {len(headings)} headings for {word_count} words",
            impact="Medium",
            category=Category.STRUCTURE,
        ))
        if enough_headings:
            score += 10
        else:
            recommendations.append(Recommendation(
                title="Add more section headings",
                description="Long content needs clear segmentation for AI engines to extract relevant answers.",
                priority=Priority.MEDIUM,
                category=Category.STRUCTURE,
                impact_score=5,
                effort=Effort.LOW,
            ))

        # str_08: Content length adequate (> 300 words)
        adequate_length = word_count > 300
        checks.append(Check(
            id="str_08",
            passed=adequate_length,
            text=f"Content length: {word_count} words",
            impact="Low",
            category=Category.STRUCTURE,
        ))
        if adequate_length:
            score += 5
        else:
            recommendations.append(Recommendation(
                title="Expand content",
                description=f"Content is too thin ({word_count} words). Aim for 800+ words with comprehensive topic coverage.",
                priority=Priority.LOW,
                category=Category.STRUCTURE,
                impact_score=4,
                effort=Effort.HIGH,
            ))

        return ModuleResult(
            score=min(score, 100),
            checks=checks,
            recommendations=recommendations,
            details={
                "word_count": word_count,
                "heading_count": len(headings),
                "paragraph_count": len(paragraphs),
                "question_headings": len(question_headings),
            },
        )
