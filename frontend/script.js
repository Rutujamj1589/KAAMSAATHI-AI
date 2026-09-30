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