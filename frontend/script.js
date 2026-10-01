const explainButton = document.getElementById("explainButton");
const instructionInput = document.getElementById("instructionInput");
const language = document.getElementById("language");
const resultText = document.getElementById("resultText");

const checkButton = document.getElementById("checkButton");
const questionBox = document.getElementById("questionBox");
const questionText = document.getElementById("questionText");

const answerInput = document.getElementById("answerInput");
const submitAnswerButton = document.getElementById("submitAnswerButton");

const verificationBox = document.getElementById("verificationBox");
const verificationText = document.getElementById("verificationText");

const retrainingBox = document.getElementById("retrainingBox");
const retrainingText = document.getElementById("retrainingText");
const retrainButton = document.getElementById("retrainButton");
const retryButton = document.getElementById("retryButton");



// ==========================================
// DASHBOARD DATA
// ==========================================

let topicsChecked = 0;
let retrainingCount = 0;
let verifiedCount = 0;

const topicsCheckedElement =
    document.getElementById("topicsChecked");

const retrainingCountElement =
    document.getElementById("retrainingCount");

const verifiedCountElement =
    document.getElementById("verifiedCount");

const currentStatusElement =
    document.getElementById("currentStatus");

const dashboardMessage =
    document.getElementById("dashboardMessage");


// ==========================================
// 1. EXPLAIN SAFETY INSTRUCTION
// ==========================================

explainButton.addEventListener("click", async function () {

    const instruction = instructionInput.value.trim();
    const selectedLanguage = language.value;

    if (instruction === "") {
        resultText.textContent =
            "Please enter a safety instruction first.";
        return;
    }

    resultText.textContent =
        "🤖 KaamSaathi AI is thinking...";

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/explain",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    instruction: instruction,
                    language: selectedLanguage
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Something went wrong."
            );
        }

        resultText.textContent = data.explanation;

    } catch (error) {

        console.error(error);

        resultText.textContent =
            "⚠️ AI service is temporarily unavailable. Please try again.";
    }
});


// ==========================================
// 2. GENERATE UNDERSTANDING QUESTION
// ==========================================

checkButton.addEventListener("click", async function () {

    const instruction = instructionInput.value.trim();
    const selectedLanguage = language.value;

    if (instruction === "") {

        questionBox.style.display = "block";

        questionText.textContent =
            "Please enter a safety instruction first.";

        return;
    }

    questionBox.style.display = "block";

    questionText.textContent =
        "🤖 KaamSaathi AI is preparing a question...";

    verificationBox.style.display = "none";
    retrainingBox.style.display = "none";
    retryButton.style.display = "none";

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/question",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    instruction: instruction,
                    language: selectedLanguage
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Question generation failed."
            );
        }

        questionText.textContent = data.question;

    } catch (error) {

        console.error(error);

        questionText.textContent =
            "⚠️ Unable to generate the question. Please try again.";
    }
});


// ==========================================
// 3. VERIFY WORKER'S ANSWER
// ==========================================

submitAnswerButton.addEventListener("click", async function () {

    const instruction = instructionInput.value.trim();
    const selectedLanguage = language.value;
    const question = questionText.textContent;
    const answer = answerInput.value.trim();

    if (answer === "") {

        verificationBox.style.display = "block";

        verificationText.textContent =
            "Please enter your answer first.";

        return;
    }

    verificationBox.style.display = "block";
    retrainingBox.style.display = "none";

    verificationText.textContent =
        "🤖 KaamSaathi AI is checking your understanding...";

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/verify-answer",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    instruction: instruction,
                    question: question,
                    answer: answer,
                    language: selectedLanguage
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Verification failed."
            );
        }


        // ==================================
        // WORKER UNDERSTOOD
        // ==================================

        if (data.status === "understood") {

            verificationText.textContent =
                "✅ " + data.feedback;

            retrainingBox.style.display = "none";

                        topicsChecked++;
            verifiedCount++;

            topicsCheckedElement.textContent =
                topicsChecked;

            verifiedCountElement.textContent =
                verifiedCount;

            currentStatusElement.textContent =
                "✅ Understanding Verified";

            dashboardMessage.textContent =
                "Great! The worker successfully understood the safety instruction.";

        }


        // ==================================
        // WORKER NEEDS RETRAINING
        // ==================================

        else {

            verificationText.textContent =
                "🔄 " + data.feedback;

            retrainingBox.style.display = "block";

            retrainingText.textContent =
                "Let's explain the safety instruction again in a simpler way.";

            retryButton.style.display = "none";

                        retrainingCount++;

            retrainingCountElement.textContent =
                retrainingCount;

            currentStatusElement.textContent =
                "🔄 Needs Re-training";

            dashboardMessage.textContent =
                "The worker needs additional explanation before understanding can be verified.";
        }

    } catch (error) {

        console.error(error);

        verificationText.textContent =
            "⚠️ Unable to verify your answer. Please try again.";
    }
});


// ==========================================
// 4. ADAPTIVE RE-TRAINING
// ==========================================

retrainButton.addEventListener("click", async function () {

    const instruction = instructionInput.value.trim();
    const selectedLanguage = language.value;

    if (instruction === "") {
        return;
    }

    retrainingText.textContent =
        "🤖 KaamSaathi AI is explaining it again...";

    retrainButton.disabled = true;

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/retrain",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    instruction: instruction,
                    language: selectedLanguage
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Retraining failed."
            );
        }

        retrainingText.textContent =
            "📚 " + data.explanation;

        retryButton.style.display = "inline-block";

    } catch (error) {

        console.error(error);

        retrainingText.textContent =
            "⚠️ Unable to explain again. Please try again.";
    }

    retrainButton.disabled = false;
});


// ==========================================
// 5. RETEST AFTER RE-TRAINING
// ==========================================

retryButton.addEventListener("click", async function () {

    const instruction = instructionInput.value.trim();
    const selectedLanguage = language.value;

    answerInput.value = "";

    retryButton.style.display = "none";

    questionBox.style.display = "block";

    questionText.textContent =
        "🤖 KaamSaathi AI is preparing a new question...";

    verificationBox.style.display = "none";

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/question",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    instruction: instruction,
                    language: selectedLanguage
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Retest question failed."
            );
        }

        questionText.textContent = data.question;

    } catch (error) {

        console.error(error);

        questionText.textContent =
            "⚠️ Unable to prepare the retest question. Please try again.";
    }
});