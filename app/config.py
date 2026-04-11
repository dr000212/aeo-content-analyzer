from typing import Optional
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "AEO Content Analyzer"
    app_version: str = "1.0.0"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database (SQLite by default — single file in project root)
    database_url: str = "sqlite+aiosqlite:///./aeo.db"

    # Redis (empty string = disabled)
    redis_url: str = ""
    cache_ttl_seconds: int = 3600  # 1 hour

    # Crawler
    crawler_timeout: int = 15
    crawler_user_agent: str = "AEOBot/1.0 (+https://aeosuite.com/bot)"
    crawler_max_content_length: int = 5_000_000  # 5 MB

    # ── Scoring Weights (5 pillars, must sum to 1.0) ──
    weight_technical_seo: float = 0.15
    weight_onpage_seo: float = 0.20
    weight_links: float = 0.10
    weight_performance: float = 0.20
    weight_geo: float = 0.35

    # ── GEO Sub-Weights (must sum to 1.0) ──
    weight_geo_structure: float = 0.30
    weight_geo_schema: float = 0.25
    weight_geo_entity: float = 0.25
    weight_geo_readability: float = 0.20

    # AI / LLM (OpenAI GPT)
    openai_api_key: Optional[str] = None
    ai_model: str = "gpt-4o-mini"
    ai_max_tokens: int = 2000
    ai_enabled: bool = True

    # Rate limiting
    rate_limit_per_minute: int = 20

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        """Ensure Postgres URLs use an async driver for SQLAlchemy async engines."""
        if not isinstance(value, str):
            return value

        database_url = value

        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)

        if database_url.startswith("postgresql://"):
            database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

        if database_url.startswith("postgresql+psycopg2://"):
            database_url = database_url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)

        if database_url.startswith("postgresql+psycopg://"):
            database_url = database_url.replace("postgresql+psycopg://", "postgresql+asyncpg://", 1)

        if not database_url.startswith("postgresql+asyncpg://"):
            return database_url

        parts = urlsplit(database_url)
        query_params = parse_qsl(parts.query, keep_blank_values=True)

        normalized_query_params = []
        for key, param_value in query_params:
            if key == "sslmode":
                normalized_query_params.append(("ssl", param_value))
                continue

            normalized_query_params.append((key, param_value))

        return urlunsplit(parts._replace(query=urlencode(normalized_query_params)))


settings = Settings()
