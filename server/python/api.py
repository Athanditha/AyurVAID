from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from catboost_model import predict_dict
import sys
import os

app = FastAPI(
    title="AyurVAID ML API",
    description="FastAPI service for AyurVAID dosha prediction and xAI",
    version="1.0.0"
)

# Configure CORS so Node.js can call it if needed directly, though Node.js will likely call it server-to-server
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    # We accept arbitrary key-value pairs representing the user's responses
    data: Dict[str, Any]

@app.post("/predict")
async def predict_dosha(request: PredictRequest):
    try:
        result = predict_dict(request.data)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Unknown error in prediction"))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AyurVAID ML API"}

if __name__ == "__main__":
    import uvicorn
    # When run directly, start the server
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
