# 🤖 KAAMSAATHI-AI

### AI-Powered Workplace Instruction Assistant in Indian Languages

🌐 **Live Demo:** https://kaamsaathi-ai.netlify.app/

 **GitHub Repository:** https://github.com/Rutujamj1589/KAAMSAATHI-AI

---

##  Project Overview

**KAAMSAATHI-AI** is an AI-powered workplace instruction assistant designed to make workplace instructions easier to understand in **Indian languages**.

Many workplace and safety instructions are commonly provided in English, which can create a language barrier for workers who are more comfortable with Indian languages.

KAAMSAATHI-AI uses **Google Gemini AI** to explain workplace instructions in a selected Indian language in a simple and understandable way.

### How it works

1. Enter a workplace instruction.
2. Select an Indian language.
3. Click **Explain**.
4. KAAMSAATHI-AI generates an easy-to-understand explanation using AI.

### Example

**Instruction:**

> Always wear a helmet while operating the machine.

**Language:** Marathi

**AI Explanation:**

> मशीन चालवताना नेहमी हेल्मेट नक्की घाला.

This helps make important workplace information more accessible across language barriers.

---

##  Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Python
* FastAPI
* Uvicorn
* Pydantic

### AI

* Google Gemini API
* Google GenAI Python SDK

### Deployment & Tools

* Git & GitHub
* Netlify — Frontend Deployment
* Render — Backend Deployment
* VS Code

---

##  Project Structure

```text
KAAMSAATHI-AI/
│
├── backend/
│   └── main.py
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── requirements.txt
├── .gitignore
└── README.md
```

---

##  Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Rutujamj1589/KAAMSAATHI-AI.git
```

```bash
cd KAAMSAATHI-AI
```

### 2. Create a Virtual Environment

Make sure Python is installed.

```bash
python -m venv venv
```

For Windows:

```powershell
venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Add Gemini API Key

Create a `.env` file in the project root:

```text
GEMINI_API_KEY=your_gemini_api_key
```

**Do not upload the `.env` file or API key to GitHub.**

---

##  How to Run the Project

### Run the Backend

From the project root:

```powershell
.\venv\Scripts\python.exe -m uvicorn backend.main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

FastAPI API documentation:

```text
http://127.0.0.1:8000/docs
```

### Run the Frontend

Open:

```text
frontend/index.html
```

in your web browser.

The frontend communicates with the FastAPI backend through the `/explain` API.

---

##  Use the Live Website

You can use KAAMSAATHI-AI directly without installing anything.

 **Live Website:**
https://kaamsaathi-ai.netlify.app/

Simply:

**Enter instruction → Select language → Click Explain → Get AI explanation**

---

## Deployment

* **Frontend:** Netlify
* **Backend:** Render
* **AI:** Google Gemini API

---

## Problem Statement

**AI for Bharat in Indian Languages**

KAAMSAATHI-AI uses AI and Indian languages to make workplace instructions more accessible and understandable for people across India.

---

## Security

* API keys are stored using environment variables.
* `.env` is excluded using `.gitignore`.
* No API credentials are stored in the GitHub repository.

---

## Project

**KAAMSAATHI-AI**

Built for **Build Fast with AI: AI Build Challenge 2026**.
