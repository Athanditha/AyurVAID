import pytest
from fastapi.testclient import TestClient
from api import app
from unittest.mock import patch

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "AyurVAID ML API"}

@patch("api.predict_dict")
def test_predict_endpoint_success(mock_predict_dict):
    # Mock the return value of predict_dict (the CatBoost model function)
    mock_predict_dict.return_value = {
        "success": True,
        "primary": "vata",
        "scores": {"vata": 60, "pitta": 30, "kapha": 10},
        "xai_insights": [{"feature": "Body Frame", "importance": 0.5}],
        "probabilities": [0.6, 0.3, 0.1]
    }
    
    payload = {
        "data": {
            "Body Frame": "Thin and Lean",
            "Sleep": "Less (Insomnia)"
        }
    }
    
    response = client.post("/predict", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["primary"] == "vata"
    assert "xai_insights" in data
    mock_predict_dict.assert_called_once_with(payload["data"])

@patch("api.predict_dict")
def test_predict_endpoint_failure(mock_predict_dict):
    mock_predict_dict.return_value = {
        "success": False,
        "error": "Missing mapping file"
    }
    
    response = client.post("/predict", json={"data": {}})
    
    assert response.status_code == 500
    assert "Missing mapping file" in response.json()["detail"]
