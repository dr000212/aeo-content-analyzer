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


SYSTEM_PROMPT = """You are SearchEO's expert SEO assistant. You have COMPLETE access to this user's website analysis report below. Your job is to help them understand their results and fix every issue — with specific, actionable advice tied to THEIR page.

STRICT RULES:
1. ONLY answer questions about: this user's analyzed page, their score, the failed checks, the passed checks, recommendations, or how to fix specific SEO/AI-readiness issues.
2. If the user asks about ANYTHING else (general chat, other websites, weather, code unrelated to SEO, news, personal questions, jokes, math, etc.), politely redirect with: "I'm here to help with your SearchEO analysis! Want me to walk you through your top issues or explain your score?"
3. Use simple, friendly language. No jargon — if you must use a technical term, explain it in parentheses.
4. When suggesting fixes, give numbered step-by-step instructions.
5. When showing code, ALWAYS include:
   - A "Before:" example showing what they currently have (or what's missing)
   - An "After:" example with the exact code to use
   - WHERE to paste it (e.g., "Add this inside the <head> tag of your HTML")
   - Use fenced code blocks with the language specified (```html, ```json, etc.)
6. Reference SPECIFIC findings from this user's report — don't give generic SEO advice. Mention their actual scores, their actual failed checks, their actual page title/URL.
7. Be encouraging. Start by celebrating what they got right, then transition to fixes.
8. Keep responses focused. 2-4 short paragraphs max unless they ask for detailed code or a full walkthrough.
9. When asked "What should I fix first?" — prioritize by impact level (Critical > High > Medium > Low) and reference the specific recommendations below.
10. When asked about a specific issue, provide the EXACT fix with code if applicable, not just a description.

CRITICAL — CONTENT GENERATION RULES:
When users ask for titles, descriptions, headings, content suggestions, or any text to add to their page:
- NEVER give generic filler text like "Discover the Essence of Our Offerings" or "Your Gateway to Quality Services". These are useless.
- ALWAYS analyze the page's actual URL ({url}), title ({title}), H1 ({h1}), and meta description to understand what the page is about.
- If the page topic is unclear from the data, ASK the user: "What is the main topic or service of this page? I want to give you something you can actually use."
- Titles MUST: include the likely primary keyword, be under 60 characters, and describe what the page actually offers.
- Meta descriptions MUST: include a clear value proposition, a call-to-action, be 150-160 characters, and mention the specific service/product.
- Give 3 options ranked from best to good, and explain WHY each one works for SEO.
- If suggesting headings or FAQ sections, base them on what search users would actually look for related to the page's topic.
- Always explain the SEO reasoning: "This title works because it puts your keyword first and tells Google exactly what this page is about."

RESPONSE FORMATTING:
- Use **bold** for key points and important values
- Use bullet points for lists of issues or steps
- Use > blockquotes for important warnings or tips
- Structure long responses with ### subheadings
- When showing scores, format them clearly: "Your **Site Foundation** score is **85/100** — that's great!"

═══════════════════════════════════════
REPORT CONTEXT FOR: {url}
═══════════════════════════════════════

OVERALL SCORE: {overall_score}/100 (Grade: {grade})

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

FAILED CHECKS — SORTED BY IMPACT ({failed_count} total):
{failed_checks}

PASSED CHECKS ({passed_count} total):
{passed_checks}

PAGE METADATA:
- URL: {url}
- Title: {title}
- Meta description: {meta_desc}
- H1: {h1}
- Word count: {word_count}
- Has meta description: {has_meta}
- HTTPS: {is_https}
- Mobile viewport: {has_viewport}
- Load time: {load_time_ms}ms
- HTML size: {html_size_kb}KB
- Schema types found: {schema_types}
- Internal links: {internal_links}
- External links: {external_links}
- Images: {image_count}

TOP RECOMMENDATIONS (sorted by priority and impact):
{recommendations}

AI-GENERATED INSIGHTS:
{ai_recommendations}

IMPORTANT REMINDERS:
- When the user clicks a suggested question, answer it FULLY with specific data from above.
- When asked "What should I fix first?" — look at the FAILED CHECKS sorted by impact and the TOP RECOMMENDATIONS. Give them the #1 highest-impact fix with exact code/steps.
- When asked about speed — reference their actual load time ({load_time_ms}ms) and page size ({html_size_kb}KB).
- When asked about AI readiness — reference their AI Readiness sub-scores and specific failed checks in Structure/Schema/Entity/Readability categories.
- When asked about content — reference their actual title, meta description, H1, word count, and content-related failed checks.
- Always tie your advice back to their specific numbers and findings. Never be vague.
"""


def build_system_prompt(report: dict[str, Any]) -> str:
    """Render the system prompt with the user's report data."""
    checks = report.get("checks", [])
    failed = [c for c in checks if not c.get("passed")]
    passed = [c for c in checks if c.get("passed")]

    # Sort failed checks by impact: Critical/High first
    impact_order = {"High": 0, "Medium": 1, "Low": 2}
    failed_sorted = sorted(failed, key=lambda c: impact_order.get(c.get("impact", "Low"), 3))

    failed_str = "\n".join(
        f"- [{c.get('impact', 'Low')} impact] [{c.get('category')}] {c.get('text')}"
        for c in failed_sorted
    ) or "(none — all checks passed!)"

    passed_str = "\n".join(f"- {c.get('text')}" for c in passed[:25]) or "(none)"
    if len(passed) > 25:
        passed_str += f"\n- ... and {len(passed) - 25} more passed checks"

    meta = report.get("meta", {}) or {}
    geo = report.get("geo_readiness", {}) or {}

    # Build recommendations string with full detail
    recs = report.get("recommendations", []) or []
    recs_sorted = sorted(recs, key=lambda r: (
        {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}.get(r.get("priority", "Low"), 4),
        -r.get("impact_score", 0)
    ))
    recs_parts = []
    for i, r in enumerate(recs_sorted[:15], 1):
        parts = f"{i}. [{r.get('priority', 'Medium')} priority] {r.get('title', '')}"
        if r.get("description"):
            parts += f"\n   → {r['description']}"
        if r.get("impact_score"):
            parts += f"\n   → Impact: +{r['impact_score']} score points | Effort: {r.get('effort', 'Unknown')}"
        recs_parts.append(parts)
    recs_str = "\n".join(recs_parts) or "(none)"

    # Build AI recommendations string with code snippets
    ai_recs = report.get("ai_recommendations", []) or []
    ai_parts = []
    for r in ai_recs:
        part = f"- [{r.get('category', '')}] {r.get('title', '')}: {r.get('description', '')}"
        if r.get("suggested_rewrite"):
            part += f"\n  Suggested rewrite: {r['suggested_rewrite']}"
        if r.get("code_snippet"):
            part += f"\n  Code snippet:\n  ```\n  {r['code_snippet']}\n  ```"
        ai_parts.append(part)
    ai_str = "\n".join(ai_parts) or "(none available)"

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
        title=meta.get("title") or "(none set)",
        meta_desc=meta.get("meta_description") or "(none set)",
        h1=meta.get("h1") or "(none found)",
        word_count=meta.get("word_count", 0),
        has_meta=meta.get("has_meta_description", False),
        is_https=meta.get("is_https", False),
        has_viewport=meta.get("has_viewport", False),
        load_time_ms=meta.get("load_time_ms", 0),
        html_size_kb=meta.get("html_size_kb", 0),
        schema_types=", ".join(meta.get("schema_types") or []) or "(none found)",
        internal_links=meta.get("internal_link_count", 0),
        external_links=meta.get("external_link_count", 0),
        image_count=meta.get("image_count", 0),
        recommendations=recs_str,
        ai_recommendations=ai_str,
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
            temperature=0.3,
            messages=messages,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        logger.exception("OpenAI chat call failed")
        raise RuntimeError(f"Chat service error: {e}") from e


def generate_suggested_questions(report: dict[str, Any]) -> list[str]:
    """Build context-aware suggested questions from the report's failed checks.

    Returns up to 5 chip suggestions that are specific to the user's actual issues.
    """
    failed = [c for c in report.get("checks", []) if not c.get("passed")]
    meta = report.get("meta", {}) or {}
    overall = report.get("overall_score", 0)

    # Sort by impact
    impact_order = {"High": 0, "Medium": 1, "Low": 2}
    failed_sorted = sorted(failed, key=lambda c: impact_order.get(c.get("impact", "Low"), 3))

    questions: list[str] = []

    # Always start with the most actionable question
    questions.append("What should I fix first?")

    # Add specific fix questions based on top failed checks
    for check in failed_sorted[:2]:
        text = (check.get("text") or "").strip()
        if text:
            short = text if len(text) <= 50 else text[:47] + "..."
            questions.append(f"How do I fix: {short}")

    # Add score-specific question
    if overall < 50:
        questions.append("How can I quickly improve my score?")
    elif overall < 75:
        questions.append("What's keeping my score from being excellent?")
    else:
        questions.append("How do I get a perfect score?")

    # Add category-specific question based on weakest pillar
    pillars = {
        "Site speed": (report.get("performance") or {}).get("score", 100),
        "AI readiness": (report.get("geo_readiness") or {}).get("score", 100),
        "content SEO": (report.get("onpage_seo") or {}).get("score", 100),
        "link health": (report.get("link_analysis") or {}).get("score", 100),
        "site foundation": (report.get("technical_seo") or {}).get("score", 100),
    }
    weakest = min(pillars, key=pillars.get)
    if pillars[weakest] < 80:
        questions.append(f"How do I improve my {weakest}?")
    else:
        questions.append("Is my site ready for AI search engines?")

    return questions[:5]
