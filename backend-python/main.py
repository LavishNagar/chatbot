# backend-python/main.py
import os
import re
import pickle
from typing import Any, Dict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, RootModel
from dotenv import load_dotenv

from model_defs import ComplexTrapModelRenamed  # Make sure this file exists
from fastapi.middleware.cors import CORSMiddleware

from schemas import PropertyPayload

class RenameUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if module == "__main__" and name == "ComplexTrapModelRenamed":
            module = "model_defs"
        return super().find_class(module, name)

with open(r"C:\Users\lavis\OneDrive\Documents\Desktop\chatbot\Real estate chatbot\backend-python\complex_price_model_v2.pkl", "rb") as f:
    model = RenameUnpickler(f).load()

print(model.predict([[450000, 3, 2]]))


# Optional OpenAI usage
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

load_dotenv()
app = FastAPI(title="ML + NLP Service")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


MODEL_PATH = os.environ.get('MODEL_PATH', 'complex_price_model_v2.pkl')
OPENAI_KEY = os.environ.get('OPENAI_API_KEY')

# ---- Custom unpickler to handle renamed modules/classes ----
class RenameUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        # Remap the class location if it was saved from __main__
        if module == "__main__" and name == "ComplexTrapModelRenamed":
            module = "model_defs"
        return super().find_class(module, name)

def load_model(path):
    with open(path, "rb") as f:
        return RenameUnpickler(f).load()

# ---- Load model ----
model = None
if os.path.exists(MODEL_PATH):
    try:
        model = load_model(MODEL_PATH)
        print(f"✅ Loaded model: {MODEL_PATH}")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
else:
    print(f"⚠️ No model file found at {MODEL_PATH}")

# ---- Request models ----
class PredictRequest(RootModel[Any]):
    """Accepts a dict of features OR a list of values"""
    pass

class NLPRequest(BaseModel):
    text: str

# ---- Helpers ----
def simple_nlp_parse(text: str) -> Dict[str, Any]:
    text = text.lower()
    parsed = {}

    # budget
    m = (
        re.search(r'under\s*\$?([\d,]+)', text) or
        re.search(r'\$([\d,]+)', text) or
        re.search(r'below\s*\$?([\d,]+)', text)
    )
    if m:
        parsed['budget'] = int(m.group(1).replace(',', ''))

    # bedrooms
    m = re.search(r'(\d+)\s*(bhk|bedroom|bedrooms)', text)
    if m:
        parsed['bedrooms'] = int(m.group(1))

    # location
    m = re.search(r'\b(?:in|at)\s+([A-Za-z ]{2,30})', text)
    if m:
        parsed['location'] = m.group(1).strip().title()

    return parsed

# ---- Endpoints ----

@app.post("/predict")
async def predict(payload: PropertyPayload):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded.")

    try:
        features = [
            payload.price,
            payload.bedrooms,
            payload.bathrooms
        ]
        pred = model.predict([features])
        return {"predicted_price": float(pred[0]), "saved": payload.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {e}")

@app.post("/nlp")
async def nlp_parse(req: NLPRequest):
    text = req.text

    if OPENAI_KEY and OPENAI_AVAILABLE:
        try:
            openai.api_key = OPENAI_KEY
            prompt = f"Extract location, budget, and bedrooms as JSON: location, budget, bedrooms. Query: \"{text}\""
            completion = openai.Completion.create(
                engine="text-davinci-003",
                prompt=prompt,
                max_tokens=100,
                temperature=0
            )
            raw = completion.choices[0].text.strip()
            import json
            try:
                return json.loads(raw)
            except:
                return simple_nlp_parse(text)
        except Exception as e:
            print("OpenAI error:", e)
            return simple_nlp_parse(text)
    else:
        return simple_nlp_parse(text)

@app.get("/")
async def root():
    return {"status": "ok"}
