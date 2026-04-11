"""GPT-powered chat grounded in the user's analysis report.

The chatbot is locked to SEO/analysis topics. The system prompt instructs
GPT to politely refuse off-topic requests and only reference data from the
stored report.
"""
import json
import logging
from typing import Any

from openai import AsyncOpenAI

from app.config import settings

logger = logging.getLogger(__name__)


_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY not configured")
        _client = AsyncOpenAI(api_key=settings.openai_api_key)
    return _client


SYSTEM_PROMPT = """You are SearchEO's expert SEO assistant. You have access to the user's complete website analysis report. Your role is to help them understand and fix issues found on their analyzed page.

STRICT RULES:
1. ONLY answer questions about: this user's analyzed page, their score, the failed checks, the passed checks, recommendations, or how to fix specific SEO/AI-readiness issues.
2. If the user asks about ANYTHING else (general chat, other websites, weather, code unrelated to SEO, news, personal questions, jokes, math, etc.), politely redirect with: "I'm here to help with your SearchEO analysis. Want to know how to fix one of your issues, or have me explain your score?"
3. Use simple, friendly language. No jargon — if you must use a technical term, explain it.
4. When suggesting fixes, give numbered step-by-step instructions.
5. When showing code, include a "Before:" and "After:" example in fenced code blocks, and mention WHERE to paste it (e.g., "in the <head> section of your HTML").
6. Reference SPECIFIC findings from this user's report — don't give generic SEO advice.
7. Be encouraging. Celebrate things they got right before highlighting fixes.
8. Keep responses focused. 2-4 short paragraphs max unless they ask for full code.
9. When users ask "what content should I add" or similar, give SPECIFIC suggestions based on their page's topic, missing schema types, and failed checks. Suggest exact headings, FAQ sections, schema markup code, and meta description text tailored to their page.

REPORT CONTEXT FOR {url}:

OVERALL SCORE: {overall_score}/100 ({grade})

PILLAR SCORES:
- Site Foundation (Technical SEO): {tech}/100
- Content Optimization (On-Page SEO): {onpage}/100
- Link Health: {links}/100
- Page Speed: {perf}/100
- AI Readiness: {geo}/100
  - Content Structure: {structure}/100
  - Smart Tags (Schema): {schema}/100
  - Topic Depth (Entity): {entity}/100
  - Writing Quality (Readability): {readability}/100

FAILED CHECKS ({failed_count} total):
{failed_checks}

PASSED CHECKS ({passed_count} total):
{passed_checks}

PAGE METADATA:
- Title: {title}
- Word count: {word_count}
- Has meta description: {has_meta}
- HTTPS: {is_https}
- Mobile viewport: {has_viewport}
- Load time: {load_time_ms}ms
- HTML size: {html_size_kb}KB
- Schema types found: {schema_types}
"""


def build_system_prompt(report: dict[str, Any]) -> str:
    """Render the system prompt with the user's report data."""
    checks = report.get("checks", [])
    failed = [c for c in checks if not c.get("passed")]
    passed = [c for c in checks if c.get("passed")]

    failed_str = "\n".join(f"- [{c.get('category')}] {c.get('text')}" for c in failed) or "(none)"
    passed_str = "\n".join(f"- {c.get('text')}" for c in passed[:20]) or "(none)"
    if len(passed) > 20:
        passed_str += f"\n- ... and {len(passed) - 20} more"

    meta = report.get("meta", {}) or {}
    geo = report.get("geo_readiness", {}) or {}

    return SYSTEM_PROMPT.format(
        url=report.get("url", "the analyzed page"),
        overall_score=report.get("overall_score", 0),
        grade=report.get("grade", "Unknown"),
        tech=(report.get("technical_seo") or {}).get("score", 0),
        onpage=(report.get("onpage_seo") or {}).get("score", 0),
        links=(report.get("link_analysis") or {}).get("score", 0),
        perf=(report.get("performance") or {}).get("score", 0),
        geo=geo.get("score", 0),
        structure=(geo.get("structure") or {}).get("score", 0),
        schema=(geo.get("schema_markup") or {}).get("score", 0),
        entity=(geo.get("entity") or {}).get("score", 0),
        readability=(geo.get("readability") or {}).get("score", 0),
        failed_count=len(failed),
        passed_count=len(passed),
        failed_checks=failed_str,
        passed_checks=passed_str,
        title=meta.get("title") or "(none)",
        word_count=meta.get("word_count", 0),
        has_meta=meta.get("has_meta_description", False),
        is_https=meta.get("is_https", False),
        has_viewport=meta.get("has_viewport", False),
        load_time_ms=meta.get("load_time_ms", 0),
        html_size_kb=meta.get("html_size_kb", 0),
        schema_types=", ".join(meta.get("schema_types") or []) or "(none)",
    )


async def generate_chat_response(
    report: dict[str, Any],
    user_message: str,
    history: list[dict[str, str]],
) -> str:
    """Send the conversation to GPT and return the assistant reply.

    `history` is a list of prior messages: [{"role": "user"|"assistant", "content": "..."}].
    The current `user_message` is NOT included in history — we add it here.
    """
    client = _get_client()
    system = build_system_prompt(report)

    # Trim history to last 20 messages to control context size
    trimmed = history[-20:]

    messages = [{"role": "system", "content": system}]
    messages.extend(trimmed)
    messages.append({"role": "user", "content": user_message})

    try:
        response = await client.chat.completions.create(
            model=settings.ai_model,
            max_tokens=settings.ai_max_tokens,
            temperature=0.4,
            messages=messages,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        logger.exception("OpenAI chat call failed")
        raise RuntimeError(f"Chat service error: {e}") from e


def generate_suggested_questions(report: dict[str, Any]) -> list[str]:
    """Build context-aware suggested questions from the report's failed checks.

    Returns up to 5 chip suggestions:
    - "What should I fix first?"
    - "How do I fix: <top failed check 1>?"
    - "How do I fix: <top failed check 2>?"
    - "Explain my score in simple terms"
    - "What's my biggest weakness?"
    """
    failed = [c for c in report.get("checks", []) if not c.get("passed")]
    questions: list[str] = ["What should I fix first?"]

    for check in failed[:2]:
        text = (check.get("text") or "").strip()
        if text:
            # Truncate so chip stays compact
            short = text if len(text) <= 60 else text[:57] + "..."
            questions.append(f"How do I fix: {short}")

    questions.append("Explain my score in simple terms")
    questions.append("What's hurting my score the most?")

    return questions[:5]
