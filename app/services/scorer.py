from app.config import settings
from app.models.response import ModuleResult


def calculate_overall(
    structure: ModuleResult,
    schema: ModuleResult,
    entity: ModuleResult,
    readability: ModuleResult,
) -> tuple[int, str]:
    overall = round(
        structure.score * settings.weight_structure
        + schema.score * settings.weight_schema
        + entity.score * settings.weight_entity
        + readability.score * settings.weight_readability
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
