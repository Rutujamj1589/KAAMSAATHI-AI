const explainButton = document.getElementById("explainButton");
const instructionInput = document.getElementById("instructionInput");
const language = document.getElementById("language");
const resultText = document.getElementById("resultText");

explainButton.addEventListener("click", async function () {
    const instruction = instructionInput.value.trim();
    const selectedLanguage = language.value;

    if (instruction === "") {
        resultText.textContent = "Please enter a safety instruction first.";
        return;
    }

    // Show loading message
    resultText.textContent = "🤖 KaamSaathi AI is thinking...";

    try {
        const response = await fetch("http://127.0.0.1:8000/explain", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                instruction: instruction,
                language: selectedLanguage
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Something went wrong.");
        }

        resultText.textContent = data.explanation;

    } catch (error) {
        console.error(error);

        resultText.textContent =
            "❌ Unable to get explanation. Please try again.";
    }
});


const questionButton = document.getElementById("questionButton");
const questionArea = document.getElementById("questionArea");
const questionText = document.getElementById("questionText");

questionButton.addEventListener("click", async function () {

    const instruction = instructionInput.value.trim();
    const selectedLanguage = language.value;

    if (instruction === "") {
        questionText.textContent =
            "Please enter a safety instruction first.";
        questionArea.style.display = "block";
        return;
    }

    questionArea.style.display = "block";
    questionText.textContent =
        "🤖 KaamSaathi AI is preparing a question...";

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

        questionText.textContent = data.question;

    } catch (error) {

        console.error(error);

        questionText.textContent =
            "❌ Unable to generate question. Please try again.";
    }
});


const verifyButton = document.getElementById("verifyButton");
const answerInput = document.getElementById("answerInput");
const verificationResult = document.getElementById("verificationResult");

verifyButton.addEventListener("click", async function () {

    const instruction = instructionInput.value.trim();
    const selectedLanguage = language.value;
    const question = questionText.textContent;
    const answer = answerInput.value.trim();

    if (answer === "") {
        verificationResult.textContent =
            "Please enter your answer first.";
        return;
    }

    verificationResult.textContent =
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
            throw new Error(data.detail || "Verification failed.");
        }

        if (data.status === "understood") {

            verificationResult.textContent =
                "✅ " + data.feedback;

        } else {

            verificationResult.textContent =
                "🔄 " + data.feedback;
        }

    } catch (error) {

        console.error(error);

        verificationResult.textContent =
            "❌ Unable to verify your answer. Please try again.";
    }
});