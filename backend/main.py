# from fastapi import FastAPI

# app = FastAPI(title="KaamSaathi AI")


# @app.get("/")
# def home():
#     return {
#         "message": "KaamSaathi AI backend is running!"
#     }



import os
import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai


# Load variables from .env
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is missing from .env")

client = genai.Client(api_key=api_key)

app = FastAPI(title="KaamSaathi AI")


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
        max_retries = 3

        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=prompt
                )

                return {
                    "success": True,
                    "language": language_name,
                    "explanation": response.text
                }

            except Exception as error:
                error_message = str(error)

                if "503" in error_message and attempt < max_retries - 1:
                    wait_time = 3 * (2 ** attempt)
                    time.sleep(wait_time)
                    continue

                raise error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )