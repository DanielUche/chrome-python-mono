"""Tests for router endpoints."""

import pytest


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_home(client):
    """Test home endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "Welcome" in response.text
