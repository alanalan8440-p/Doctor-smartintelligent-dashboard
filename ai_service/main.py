from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class RiskInput(BaseModel):
    bp: float
    sugar: float
    age: float
    diseaseFactor: float

class SurgeryInput(BaseModel):
    age: float
    bp: float
    sugar: float
    disease: str
    history: List[str]

@app.get("/")
def read_root():
    return {"status": "AI Service Running"}

@app.post("/analyze-risk")
def analyze_risk(data: RiskInput):
    # riskScore = (bp * 0.3) + (sugar * 0.3) + (age * 0.2) + (diseaseFactor * 0.2)
    # Using normalized estimates to keep score 0-100 logic simpler:
    # Let's say bp > 140 is high risk, sugar > 150 is high risk
    bp_factor = min((data.bp / 200.0) * 100, 100)
    sugar_factor = min((data.sugar / 250.0) * 100, 100)
    
    score = (bp_factor * 0.3) + (sugar_factor * 0.3) + (data.age * 0.2) + (data.diseaseFactor * 20.0)
    score = min(score, 100)

    if score > 75:
        level = "High"
    elif score > 50:
        level = "Medium"
    else:
        level = "Low"

    return {
        "score": round(score, 2),
        "level": level
    }

@app.post("/surgery-analyzer")
def surgery_analyzer(data: SurgeryInput):
    base_success = 95.0
    risk_factors = []
    
    if data.age > 70:
        base_success -= 15.0
        risk_factors.append("Advanced age complicates recovery")
    elif data.age > 50:
        base_success -= 5.0

    if data.bp > 150:
        base_success -= 10.0
        risk_factors.append("High BP increases complication risk")
        
    if data.sugar > 180:
        base_success -= 10.0
        risk_factors.append("High Sugar slows healing")

    level = "Low"
    if base_success < 70:
        level = "High"
    elif base_success < 85:
        level = "Medium"

    return {
        "successRate": max(0.0, round(base_success, 1)),
        "riskLevel": level,
        "keyRiskFactors": risk_factors or ["No significant risks identified"]
    }
