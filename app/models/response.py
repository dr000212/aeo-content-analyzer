from enum import Enum
from typing import Optional

from pydantic import BaseModel


class Priority(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class Category(str, Enum):
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


class PageMeta(BaseModel):
    url: str
    title: Optional[str] = None
    word_count: int = 0
    heading_count: int = 0
    image_count: int = 0
    link_count: int = 0
    schema_types: list[str] = []
    has_meta_description: bool = False
    meta_description_length: int = 0


class AnalyzeResponse(BaseModel):
    url: str
    overall_score: int  # 0-100
    grade: str  # "Excellent" / "Good" / "Needs Improvement" / "Poor"
    structure: ModuleResult
    schema_markup: ModuleResult
    entity: ModuleResult
    readability: ModuleResult
    checks: list[Check]
    recommendations: list[Recommendation]
    ai_recommendations: list[AIRecommendation] = []
    ai_enhanced: bool = False
    meta: PageMeta
    analysis_time_ms: int
    cached: bool = False
