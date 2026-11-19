from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import Settings


def test_cors_allowed_origin():
    """Verify that an explicitly allowed local origin receives correct CORS headers."""
    client = TestClient(app)
    response = client.options(
        "/api/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    # Credentials should be disabled (allow_credentials=False)
    assert response.headers.get("access-control-allow-credentials") is None or response.headers.get("access-control-allow-credentials") == "false"


def test_cors_disallowed_origin():
    """Verify that an unauthorized origin does not receive access-control-allow-origin."""
    client = TestClient(app)
    response = client.options(
        "/api/health",
        headers={
            "Origin": "https://unauthorized-attacker.com",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert response.headers.get("access-control-allow-origin") is None


def test_cors_disallowed_arbitrary_vercel_subdomain():
    """Verify that arbitrary Vercel subdomains are NOT allowed without explicit configuration."""
    client = TestClient(app)
    response = client.options(
        "/api/health",
        headers={
            "Origin": "https://random-unconfigured-app.vercel.app",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert response.headers.get("access-control-allow-origin") is None


def test_cors_origins_list_parsing():
    """Verify that comma-separated CORS_ORIGINS is parsed and wildcard is stripped."""
    s = Settings(CORS_ORIGINS="https://roadguard-ai.vercel.app, http://localhost:3000, *")
    origins = s.cors_origins_list
    assert "https://roadguard-ai.vercel.app" in origins
    assert "http://localhost:3000" in origins
    assert "http://localhost:5173" in origins
    assert "*" not in origins

