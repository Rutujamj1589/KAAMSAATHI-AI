# from fastapi import FastAPI

# app = FastAPI(title="KaamSaathi AI")


# @app.get("/")
# def home():
#     return {
#         "message": "KaamSaathi AI backend is running!"
#     }



import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI


# Load variables from .env
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise RuntimeError("OPENAI_API_KEY is missing from .env")

client = OpenAI(api_key=api_key)

app = FastAPI(title="KaamSaathi AI")


class SafetyRequest(BaseModel):
    instruction: str
    language: str


@app.get("/")
def home():
    return {
        "message": "KaamSaathi AI backend is running!"
    }


@app.post("/explain")
def explain_safety(request: SafetyRequest):

    language_name = {
        "marathi": "Marathi",
        "hindi": "Hindi"
    }.get(request.language.lower(), "Marathi")

    prompt = f"""
You are KaamSaathi AI, a workplace safety coach for
Indian migrant and informal workers.

Explain the following workplace safety instruction in very
simple {language_name}.

Rules:
- Use simple everyday language.
- Do not change the safety meaning.
- Clearly mention the important action the worker must take.
- Do not invent additional safety rules.
- Keep the explanation short and easy to understand.

Safety instruction:
{request.instruction}
"""

    try:
        response = client.responses.create(
            model="gpt-5.6-luna",
            input=prompt
        )

        return {
            "success": True,
            "language": language_name,
            "explanation": response.output_text
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )