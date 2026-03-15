import json
import logging

from app.config import settings
from app.models.response import AIRecommendation, Category, Check, PageMeta

logger = logging.getLogger(__name__)


async def enhance(
    text: str,
    checks: list[Check],
    scores: dict,
    meta: PageMeta,
) -> list[AIRecommendation]:
    if not settings.ai_enabled or not settings.openai_api_key:
        return []

    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.openai_api_key)

        failed_checks = [c.text for c in checks if not c.passed]

        prompt = f"""Analyze this web page content and provide specific, actionable AEO recommendations.

PAGE CONTENT (first 3000 chars):
{text[:3000]}

FAILED CHECKS:
{json.dumps(failed_checks, indent=2)}

CURRENT SCORES:
- Structure: {scores.get('structure', 0)}/100
- Schema: {scores.get('schema', 0)}/100
- Entity: {scores.get('entity', 0)}/100
- Readability: {scores.get('readability', 0)}/100
- Overall: {scores.get('overall', 0)}/100

PAGE METADATA:
- Word count: {meta.word_count}
- Headings: {meta.heading_count}
- Schema types found: {meta.schema_types}

Generate exactly 3-5 smart recommendations. Return a JSON object like:
{{
  "recommendations": [
    {{
      "title": "short action title",
      "description": "detailed explanation (2-3 sentences)",
      "category": "Structure|Schema|Entity|Readability",
      "suggested_rewrite": "improved version of relevant content if applicable, else null",
      "code_snippet": "ready-to-paste code if applicable (e.g., FAQ schema JSON-LD), else null"
    }}
  ]
}}

Focus on the HIGHEST IMPACT changes. Be specific to THIS page's content, not generic advice."""

        response = await client.chat.completions.create(
            model=settings.ai_model,
            max_tokens=settings.ai_max_tokens,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": "You are an AEO (Answer Engine Optimization) expert. Return ONLY a JSON object with a key 'recommendations' containing an array.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
        )

        result = json.loads(response.choices[0].message.content)
        recs = result.get("recommendations", [])

        ai_recs = []
        for r in recs:
            cat_str = r.get("category", "Structure")
            try:
                category = Category(cat_str)
            except ValueError:
                category = Category.STRUCTURE

            ai_recs.append(AIRecommendation(
                title=r.get("title", ""),
                description=r.get("description", ""),
                category=category,
                suggested_rewrite=r.get("suggested_rewrite"),
                code_snippet=r.get("code_snippet"),
            ))

        return ai_recs

    except Exception as e:
        logger.warning(f"AI enhancement failed: {e}")
        return []
