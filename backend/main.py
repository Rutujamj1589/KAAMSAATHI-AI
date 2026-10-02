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
from google.genai import types


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

class QuestionRequest(BaseModel):
    instruction: str
    language: str

class AnswerRequest(BaseModel):
    instruction: str
    question: str
    answer: str
    language: str

class ImageRequest(BaseModel):
    image_base64: str
    mime_type: str
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

@app.post("/question")
def generate_question(request: QuestionRequest):

    language_name = {
        "marathi": "Marathi",
        "hindi": "Hindi"
    }.get(request.language.lower(), "Marathi")

    # Safe fallback question for demo reliability
    fallback_questions = {
        "Marathi": "मशीन चालवताना तुम्ही कोणती सुरक्षा साधने वापरली पाहिजेत?",
        "Hindi": "मशीन चलाते समय आपको कौन से सुरक्षा उपकरण पहनने चाहिए?"
    }

    try:
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=f"""
You are KaamSaathi AI, a workplace safety coach.

Create ONE very simple teach-back question in {language_name}.

The question must check whether the worker understood
the most important safety action.

Do not ask a multiple-choice question.
Ask the worker to explain in their own words.

Safety instruction:
{request.instruction}

Return only the question.
"""
        )

        return {
            "success": True,
            "source": "ai",
            "question": response.text
        }

    except Exception:
        # Gemini temporarily unavailable → safe fallback
        return {
            "success": True,
            "source": "fallback",
            "question": fallback_questions[language_name]
        }


@app.post("/verify-answer")
def verify_answer(request: AnswerRequest):

    language_name = {
        "marathi": "Marathi",
        "hindi": "Hindi"
    }.get(request.language.lower(), "Marathi")

    prompt = f"""
You are KaamSaathi AI, a workplace safety coach.

Evaluate whether the worker understood the safety instruction.

Safety instruction:
{request.instruction}

Question asked:
{request.question}

Worker's answer:
{request.answer}

Respond ONLY in this format:

STATUS: UNDERSTOOD
FEEDBACK: <short feedback in {language_name}>

OR

STATUS: NEEDS_RETRAINING
FEEDBACK: <short explanation of what the worker missed in {language_name}>

Rules:
- Focus only on the important safety action.
- Accept answers that express the correct meaning even if wording is different.
- Do not invent additional safety rules.
- Keep feedback simple.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt
        )

        result = response.text

        if "STATUS: UNDERSTOOD" in result:
            status = "understood"
        else:
            status = "needs_retraining"

        return {
            "success": True,
            "status": status,
            "feedback": result
        }

    except Exception:
        return {
            "success": True,
            "status": "needs_retraining",
            "feedback": "कृपया सुरक्षा सूचना पुन्हा समजून घ्या आणि पुन्हा उत्तर द्या."
        }



@app.post("/retrain")
def retrain_safety(request: SafetyRequest):

    language_name = {
        "marathi": "Marathi",
        "hindi": "Hindi"
    }.get(request.language.lower(), "Marathi")

    fallback_explanations = {
        "Marathi": "मशीन चालवताना नेहमी हेल्मेट आणि सेफ्टी हातमोजे घाला. ही सुरक्षा साधने वापरणे महत्त्वाचे आहे.",
        "Hindi": "मशीन चलाते समय हमेशा हेलमेट और सेफ्टी दस्ताने पहनें। इन सुरक्षा उपकरणों का उपयोग करना जरूरी है."
    }

    prompt = f"""
You are KaamSaathi AI, a workplace safety coach.

The worker did not fully understand the safety instruction.

Explain the instruction again in very simple {language_name}.

Safety instruction:
{request.instruction}

Rules:
- Use simpler words than before.
- Focus only on the most important safety action.
- Do not add new safety rules.
- Keep the explanation short.
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt
        )

        return {
            "success": True,
            "source": "ai",
            "explanation": response.text
        }

    except Exception:

        return {
            "success": True,
            "source": "fallback",
            "explanation": fallback_explanations[language_name]
        }


# ==========================================
# 6. ANALYZE SAFETY POSTER IMAGE
# ==========================================

@app.post("/analyze-image")
def analyze_image(request: ImageRequest):

    language_name = {
        "marathi": "Marathi",
        "hindi": "Hindi"
    }.get(request.language.lower(), "Marathi")

    fallback_explanations = {
        "Marathi": (
            "या सुरक्षा पोस्टरमध्ये मशीन चालवताना "
            "हेल्मेट आणि सेफ्टी हातमोजे वापरण्याची सूचना आहे."
        ),
        "Hindi": (
            "इस सुरक्षा पोस्टर में मशीन चलाते समय "
            "हेलमेट और सेफ्टी दस्ताने पहनने की सलाह दी गई है।"
        )
    }

    prompt = f"""
You are KaamSaathi AI, a workplace safety coach.

Analyze this workplace safety poster or instruction image.

Explain the important safety instruction in very simple
{language_name} for an Indian worker.

Rules:
- Read the visible text and safety symbols carefully.
- Explain only what is clearly present in the image.
- Do not invent additional safety rules.
- Clearly mention the main action the worker should take.
- Use simple everyday language.
- Keep the explanation short and easy to understand.

Return only the explanation in {language_name}.
"""

    try:

        image_bytes = __import__("base64").b64decode(
            request.image_base64
        )

        max_retries = 3

        for attempt in range(max_retries):

            try:

                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=[
                        prompt,
                        types.Part.from_bytes(
                            data=image_bytes,
                            mime_type=request.mime_type
                        )
                    ]
                )

                return {
                    "success": True,
                    "source": "ai",
                    "language": language_name,
                    "explanation": response.text
                }

            except Exception as error:

                error_message = str(error)

                print(
                    f"Image analysis attempt {attempt + 1} failed: "
                    f"{error_message}"
                )

                if (
                    "503" in error_message
                    and attempt < max_retries - 1
                ):
                    wait_time = 3 * (2 ** attempt)

                    print(
                        f"Gemini is busy. Retrying in "
                        f"{wait_time} seconds..."
                    )

                    time.sleep(wait_time)

                    continue

                raise error

    except Exception as error:

        print("Image analysis final error:", error)

        return {
            "success": True,
            "source": "fallback",
            "language": language_name,
            "explanation": fallback_explanations[language_name]
        }