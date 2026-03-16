from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Priority(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class Category(str, Enum):
    # SEO (Traditional)
    TECHNICAL_SEO = "Technical SEO"
    ONPAGE_SEO = "On-Page SEO"
    LINKS = "Links"
    PERFORMANCE = "Performance"
    # GEO (AI Readiness)
    STRUCTURE = "Structure"
    SCHEMA = "Schema"
    ENTITY = "Entity"
    READABILITY = "Readability"


class Effort(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class Check(BaseModel):
    id: str
    passed: bool
    text: str
    impact: str  # "High" / "Medium" / "Low"
    category: Category


class Recommendation(BaseModel):
    title: str
    description: str
    priority: Priority
    category: Category
    impact_score: int  # 1-10
    effort: Effort


class AIRecommendation(BaseModel):
    title: str
    description: str
    category: Category
    suggested_rewrite: Optional[str] = None
    code_snippet: Optional[str] = None


class ModuleResult(BaseModel):
    score: int  # 0-100
    checks: list[Check]
    recommendations: list[Recommendation]
    details: dict = {}


class GEOResult(BaseModel):
    """GEO Readiness pillar — contains 4 sub-modules."""
    score: int  # 0-100 composite GEO score
    structure: ModuleResult
    schema_markup: ModuleResult
    entity: ModuleResult
    readability: ModuleResult
    checks: list[Check] = []
    recommendations: list[Recommendation] = []


class PageMeta(BaseModel):
    url: str
    title: Optional[str] = None
    title_length: int = 0
    word_count: int = 0
    heading_count: int = 0
    image_count: int = 0
    images_without_alt: int = 0
    link_count: int = 0
    internal_link_count: int = 0
    external_link_count: int = 0
    broken_link_count: int = 0
    schema_types: list[str] = []
    has_meta_description: bool = False
    meta_description_length: int = 0
    is_https: bool = False
    has_viewport: bool = False
    has_canonical: bool = False
    has_robots_txt: bool = False
    html_size_kb: float = 0
    load_time_ms: int = 0
    has_compression: bool = False
    render_blocking_scripts: int = 0
    render_blocking_styles: int = 0


class AnalyzeResponse(BaseModel):
    url: str

    # One overall SEO score (GEO is a pillar inside this)
    overall_score: int = Field(ge=0, le=100)
    grade: str  # "Excellent" / "Good" / "Needs Improvement" / "Poor"

    # 5 pillars
    technical_seo: ModuleResult       # Pillar 1 — 15%
    onpage_seo: ModuleResult          # Pillar 2 — 20%
    link_analysis: ModuleResult       # Pillar 3 — 10%
    performance: ModuleResult         # Pillar 4 — 20%
    geo_readiness: GEOResult          # Pillar 5 — 35% (expandable)

    # Aggregated from all 8 modules
    checks: list[Check]
    recommendations: list[Recommendation]

    # AI-enhanced
    ai_recommendations: list[AIRecommendation] = []
    ai_enhanced: bool = False

    # Metadata
    meta: PageMeta
    analysis_time_ms: int
    cached: bool = False
