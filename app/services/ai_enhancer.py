import json
import logging

from app.config import settings
from app.models.response import AIRecommendation, Category, Check, PageMeta

logger = logging.getLogger(__name__)

# Map string categories from GPT to Category enum
CATEGORY_MAP = {
    "Technical SEO": Category.TECHNICAL_SEO,
    "On-Page SEO": Category.ONPAGE_SEO,
    "Links": Category.LINKS,
    "Performance": Category.PERFORMANCE,
    "Structure": Category.STRUCTURE,
    "Schema": Category.SCHEMA,
    "Entity": Category.ENTITY,
    "Readability": Category.READABILITY,
}


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

        prompt = f"""Analyze this web page and provide specific, actionable SEO and GEO recommendations.

PAGE CONTENT (first 3000 chars):
{text[:3000]}

FAILED CHECKS:
{json.dumps(failed_checks, indent=2)}

CURRENT SCORES:
- Overall SEO Score: {scores.get('overall', 0)}/100
- Technical SEO: {scores.get('technical_seo', 0)}/100 (weight: 15%)
- On-Page SEO: {scores.get('onpage_seo', 0)}/100 (weight: 20%)
- Links: {scores.get('links', 0)}/100 (weight: 10%)
- Performance: {scores.get('performance', 0)}/100 (weight: 20%)
- GEO Readiness: {scores.get('geo', 0)}/100 (weight: 35%)
  - Structure: {scores.get('structure', 0)}/100
  - Schema: {scores.get('schema', 0)}/100
  - Entity: {scores.get('entity', 0)}/100
  - Readability: {scores.get('readability', 0)}/100

PAGE METADATA:
- Word count: {meta.word_count}
- Headings: {meta.heading_count}
- Images: {meta.image_count} ({meta.images_without_alt} missing alt)
- Internal links: {meta.internal_link_count}
- External links: {meta.external_link_count}
- Schema types: {meta.schema_types}
- Page load time: {meta.load_time_ms}ms
- Page size: {meta.html_size_kb}KB

Generate 3-5 smart recommendations. Return JSON:
{{
  "recommendations": [
    {{
      "title": "short action title",
      "description": "detailed explanation (2-3 sentences)",
      "category": "Technical SEO|On-Page SEO|Links|Performance|Structure|Schema|Entity|Readability",
      "suggested_rewrite": "improved content if applicable, else null",
      "code_snippet": "ready-to-paste code if applicable, else null"
    }}
  ]
}}

Focus on HIGHEST IMPACT changes. Be specific to THIS page."""

        response = await client.chat.completions.create(
            model=settings.ai_model,
            max_tokens=settings.ai_max_tokens,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": "You are an SEO and GEO expert. Return ONLY a JSON object with key 'recommendations' containing an array.",
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
            category = CATEGORY_MAP.get(cat_str, Category.STRUCTURE)

            # GPT sometimes returns code_snippet as a dict (e.g. JSON-LD object)
            snippet = r.get("code_snippet")
            if isinstance(snippet, (dict, list)):
                snippet = json.dumps(snippet, indent=2)

            rewrite = r.get("suggested_rewrite")
            if isinstance(rewrite, (dict, list)):
                rewrite = json.dumps(rewrite, indent=2)

            ai_recs.append(AIRecommendation(
                title=r.get("title", ""),
                description=r.get("description", ""),
                category=category,
                suggested_rewrite=rewrite,
                code_snippet=snippet,
            ))

        return ai_recs

    except Exception as e:
        logger.warning(f"AI enhancement failed: {e}")
        return []
