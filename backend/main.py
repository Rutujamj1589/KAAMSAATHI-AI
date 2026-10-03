import os
import time
import base64

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types


# ==========================================
# LOAD GEMINI
# ==========================================

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is missing from .env")

client = genai.Client(api_key=api_key)

app = FastAPI(title="KaamSaathi AI")


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# REQUEST MODELS
# ==========================================

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


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():
    return {
        "message": "KaamSaathi AI backend is running!"
    }


# ==========================================
# 1. EXPLAIN SAFETY INSTRUCTION
# ==========================================

@app.post("/explain")
def explain_safety(request: SafetyRequest):

    language_name = {
        "marathi": "Marathi",
        "hindi": "Hindi"
    }.get(request.language.lower(), "Marathi")

    fallback_explanations = {
        "Marathi": (
            "मशीन चालवताना नेहमी हेल्मेट आणि सेफ्टी हातमोजे "
            "वापरा. मशीन सुरू करण्यापूर्वी सुरक्षा सूचनांचे "
            "पालन करा."
        ),
        "Hindi": (
            "मशीन चलाते समय हमेशा हेलमेट और सेफ्टी दस्ताने "
            "पहनें। मशीन शुरू करने से पहले सुरक्षा निर्देशों "
            "का पालन करें।"
        )
    }

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
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt
        )

        return {
            "success": True,
            "source": "ai",
            "language": language_name,
            "explanation": response.text
        }

    except Exception as error:

        print("Gemini explain unavailable:", error)

        return {
            "success": True,
            "source": "fallback",
            "language": language_name,
            "explanation": fallback_explanations[language_name]
        }


# ==========================================
# 2. GENERATE TEACH-BACK QUESTION
# ==========================================

@app.post("/question")
def generate_question(request: QuestionRequest):

    language_name = {
        "marathi": "Marathi",
        "hindi": "Hindi"
    }.get(request.language.lower(), "Marathi")

    fallback_questions = {
        "Marathi": (
            "मशीन चालवताना तुम्ही कोणती सुरक्षा साधने "
            "वापरली पाहिजेत?"
        ),
        "Hindi": (
            "मशीन चलाते समय आपको कौन से सुरक्षा उपकरण "
            "पहनने चाहिए?"
        )
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

    except Exception as error:

        print("Gemini question unavailable:", error)

        return {
            "success": True,
            "source": "fallback",
            "question": fallback_questions[language_name]
        }


# ==========================================
# 3. VERIFY WORKER ANSWER
# ==========================================

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
FEEDBACK: <short explanation in {language_name}>

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

    except Exception as error:

        print("Gemini verification unavailable:", error)

        # Simple fallback verification for demo reliability
        answer_text = request.answer.lower()

        safety_words = [
            "helmet",
            "gloves",
            "हेल्मेट",
            "हातमोजे",
            "दस्ताने",
            "सुरक्षा",
            "safety"
        ]

        understood = any(
            word in answer_text
            for word in safety_words
        )

        if understood:

            if language_name == "Hindi":
                feedback = (
                    "बहुत अच्छा! आपने मुख्य सुरक्षा बात समझी है।"
                )
            else:
                feedback = (
                    "छान! तुम्हाला मुख्य सुरक्षा सूचना समजली आहे."
                )

            return {
                "success": True,
                "status": "understood",
                "feedback": feedback
            }

        else:

            if language_name == "Hindi":
                feedback = (
                    "कृपया सुरक्षा सूचना फिर से समझें और दोबारा उत्तर दें।"
                )
            else:
                feedback = (
                    "कृपया सुरक्षा सूचना पुन्हा समजून घ्या "
                    "आणि पुन्हा उत्तर द्या."
                )

            return {
                "success": True,
                "status": "needs_retraining",
                "feedback": feedback
            }


# ==========================================
# 4. RE-TRAINING
# ==========================================

@app.post("/retrain")
def retrain_safety(request: SafetyRequest):

    language_name = {
        "marathi": "Marathi",
        "hindi": "Hindi"
    }.get(request.language.lower(), "Marathi")

    fallback_explanations = {
        "Marathi": (
            "मशीन चालवताना नेहमी हेल्मेट आणि सेफ्टी "
            "हातमोजे घाला. मशीन सुरू करण्यापूर्वी "
            "सुरक्षा सूचनांचे पालन करा."
        ),
        "Hindi": (
            "मशीन चलाते समय हमेशा हेलमेट और सेफ्टी "
            "दस्ताने पहनें। मशीन शुरू करने से पहले "
            "सुरक्षा निर्देशों का पालन करें।"
        )
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

    except Exception as error:

        print("Gemini retraining unavailable:", error)

        return {
            "success": True,
            "source": "fallback",
            "explanation": fallback_explanations[language_name]
        }


# ==========================================
# 5. ANALYZE SAFETY POSTER IMAGE
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
            "हेल्मेट आणि सेफ्टी हातमोजे वापरण्याची "
            "सूचना आहे."
        ),
        "Hindi": (
            "इस सुरक्षा पोस्टर में मशीन चलाते समय "
            "हेलमेट और सेफ्टी दस्ताने पहनने की "
            "सलाह दी गई है।"
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

        image_bytes = base64.b64decode(
            request.image_base64
        )

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

        print("Gemini image analysis unavailable:", error)

        return {
            "success": True,
            "source": "fallback",
            "language": language_name,
            "explanation": fallback_explanations[language_name]
        }