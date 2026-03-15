import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_analyze_invalid_url():
    response = client.post("/api/v1/analyze", json={"url": "not-a-url"})
    assert response.status_code == 422


def test_analyze_missing_url():
    response = client.post("/api/v1/analyze", json={})
    assert response.status_code == 422
