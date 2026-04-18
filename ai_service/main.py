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

class ChatInput(BaseModel):
    message: str
    context: dict

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
@app.post("/api/chat")
def chat_assistant(data: ChatInput):
    msg = data.message.lower()
    ctx = data.context
    vitals = ctx.get('vitals', {})
    score = ctx.get('healthScore', 0)
    
    response = "I'm not sure about that. Please consult your doctor for medical advice."
    
    if "bp" in msg or "blood pressure" in msg:
        val = vitals.get('bpSystolic', 120)
        if val > 140:
            response = f"Your BP is currently {val}mmHg, which is high. You should rest, avoid salt, and monitor it closely. If it stays above 160, contact us immediately."
        else:
            response = f"Your current BP is {val}mmHg, which is within a relatively safe range."
            
    elif "sugar" in msg or "diabetes" in msg:
        val = vitals.get('sugar', 100)
        if val > 150:
            response = f"Your blood sugar is {val}mg/dL. This is elevated. Have you taken your medication? Avoid sugary foods and drink water."
        else:
            response = f"Your sugar is {val}mg/dL, which is normal. Keep up the good diet!"
            
    elif "metformin" in msg:
        response = "Metformin is typically taken with meals to reduce stomach side effects. Do not skip doses."
        
    elif "health score" in msg:
        response = f"Your current Health Score is {score}/100. { 'You are doing great!' if score > 80 else 'We should work on improving some vitals.' }"

    elif "hello" in msg or "hi" in msg:
        response = "Hello! I am your clinical assistant. You can ask me about your vitals, medications, or health score."

    return {"response": response}
