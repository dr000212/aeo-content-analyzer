from pydantic import BaseModel, HttpUrl


class AnalyzeOptions(BaseModel):
    deep_entity_analysis: bool = False
    include_ai_recommendations: bool = True


class AnalyzeRequest(BaseModel):
    url: HttpUrl
    options: AnalyzeOptions = AnalyzeOptions()
