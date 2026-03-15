from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "AEO Content Analyzer"
    app_version: str = "1.0.0"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/aeo"

    # Redis
    redis_url: str = "redis://localhost:6379/0"
    cache_ttl_seconds: int = 3600  # 1 hour

    # Crawler
    crawler_timeout: int = 15
    crawler_user_agent: str = "AEOBot/1.0 (+https://aeosuite.com/bot)"
    crawler_max_content_length: int = 5_000_000  # 5 MB

    # Analyzer weights (must sum to 1.0)
    weight_structure: float = 0.30
    weight_schema: float = 0.25
    weight_entity: float = 0.25
    weight_readability: float = 0.20

    # AI / LLM (OpenAI GPT)
    openai_api_key: Optional[str] = None
    ai_model: str = "gpt-4o-mini"
    ai_max_tokens: int = 2000
    ai_enabled: bool = True

    # Rate limiting
    rate_limit_per_minute: int = 20

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
