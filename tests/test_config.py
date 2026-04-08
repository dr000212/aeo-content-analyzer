from app.config import Settings


def test_normalize_plain_postgres_database_url():
    settings = Settings(database_url="postgresql://user:pass@db.example.com:5432/app")

    assert settings.database_url == "postgresql+asyncpg://user:pass@db.example.com:5432/app"


def test_normalize_postgres_scheme_alias():
    settings = Settings(database_url="postgres://user:pass@db.example.com:5432/app")

    assert settings.database_url == "postgresql+asyncpg://user:pass@db.example.com:5432/app"


def test_keep_existing_async_database_url():
    settings = Settings(database_url="postgresql+asyncpg://user:pass@db.example.com:5432/app")

    assert settings.database_url == "postgresql+asyncpg://user:pass@db.example.com:5432/app"


def test_convert_sslmode_to_asyncpg_ssl_param():
    settings = Settings(
        database_url="postgresql://user:pass@db.example.com:5432/app?sslmode=require"
    )

    assert settings.database_url == "postgresql+asyncpg://user:pass@db.example.com:5432/app?ssl=require"


def test_preserve_other_query_params_when_normalizing_database_url():
    settings = Settings(
        database_url="postgres://user:pass@db.example.com:5432/app?sslmode=require&application_name=aeo"
    )

    assert (
        settings.database_url
        == "postgresql+asyncpg://user:pass@db.example.com:5432/app?ssl=require&application_name=aeo"
    )
