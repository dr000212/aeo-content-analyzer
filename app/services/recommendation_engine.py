from difflib import SequenceMatcher

from app.models.response import ModuleResult, Recommendation


def aggregate(modules: list[ModuleResult]) -> list[Recommendation]:
    all_recs: list[Recommendation] = []
    for module in modules:
        all_recs.extend(module.recommendations)

    # Sort by impact_score descending
    all_recs.sort(key=lambda r: r.impact_score, reverse=True)

    # Deduplicate by title similarity
    deduped: list[Recommendation] = []
    for rec in all_recs:
        is_dup = False
        for existing in deduped:
            similarity = SequenceMatcher(None, rec.title.lower(), existing.title.lower()).ratio()
            if similarity > 0.7:
                is_dup = True
                break
        if not is_dup:
            deduped.append(rec)

    # Cap at 10
    return deduped[:10]
