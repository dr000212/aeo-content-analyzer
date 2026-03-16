from app.config import settings
from app.models.response import ModuleResult


def calculate_geo_score(
    structure: ModuleResult,
    schema: ModuleResult,
    entity: ModuleResult,
    readability: ModuleResult,
) -> int:
    """Calculate the composite GEO sub-score from 4 GEO modules."""
    geo = round(
        structure.score * settings.weight_geo_structure
        + schema.score * settings.weight_geo_schema
        + entity.score * settings.weight_geo_entity
        + readability.score * settings.weight_geo_readability
    )
    return max(0, min(100, geo))


def calculate_overall(
    technical_seo: ModuleResult,
    onpage_seo: ModuleResult,
    link_analysis: ModuleResult,
    performance: ModuleResult,
    geo_score: int,
) -> tuple[int, str]:
    """Calculate the overall SEO score from 5 pillars."""
    overall = round(
        technical_seo.score * settings.weight_technical_seo
        + onpage_seo.score * settings.weight_onpage_seo
        + link_analysis.score * settings.weight_links
        + performance.score * settings.weight_performance
        + geo_score * settings.weight_geo
    )
    overall = max(0, min(100, overall))

    if overall >= 75:
        grade = "Excellent"
    elif overall >= 50:
        grade = "Good"
    elif overall >= 25:
        grade = "Needs Improvement"
    else:
        grade = "Poor"

    return overall, grade
