// ==========================================
// PHOTO UPLOAD PREVIEW
// ==========================================

const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");

const voiceInputButton =
    document.getElementById("voiceInputButton");

const speakResultButton =
    document.getElementById("speakResultButton");

const analyzeImageButton =
    document.getElementById("analyzeImageButton");

imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    if (!file) {
        imagePreview.style.display = "none";
        return;
    }

    const imageURL = URL.createObjectURL(file);

    imagePreview.src = imageURL;
    imagePreview.style.display = "block";
});

// ==========================================
// ANALYZE SAFETY POSTER
// ==========================================

analyzeImageButton.addEventListener("click", async function () {

    const file = imageInput.files[0];
    const selectedLanguage = language.value;

    if (!file) {

        resultText.textContent =
            "📸 Please upload a safety poster first.";

        return;
    }

    resultText.textContent =
        "🤖 KaamSaathi AI is reading the safety poster...";

    analyzeImageButton.disabled = true;

    try {

        const base64Image = await new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onload = function () {

                const base64String =
                    reader.result.split(",")[1];

                resolve(base64String);
            };

            reader.onerror = reject;

            reader.readAsDataURL(file);
        });


        const response = await fetch(
            "http://127.0.0.1:8000/analyze-image",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    image_base64: base64Image,
                    mime_type: file.type,
                    language: selectedLanguage
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail || "Image analysis failed."
            );
        }


        resultText.textContent =
            data.explanation;


    } catch (error) {

        console.error(error);

        resultText.textContent =
            "⚠️ Unable to analyze the safety poster. Please try again.";

    } finally {

        analyzeImageButton.disabled = false;
    }

});


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



// ==========================================
// VOICE INPUT
// ==========================================

voiceInputButton.addEventListener("click", function () {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert(
            "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge."
        );

        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang =
        language.value === "marathi"
            ? "mr-IN"
            : "hi-IN";

    recognition.continuous = false;
    recognition.interimResults = false;

    voiceInputButton.textContent =
        "🎙️ Listening...";

    recognition.start();

    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript;

        instructionInput.value =
            transcript;

        voiceInputButton.textContent =
            "🎤 Speak Instruction";
    };

    recognition.onerror = function (event) {

        console.error(
            "Voice recognition error:",
            event.error
        );

        voiceInputButton.textContent =
            "🎤 Speak Instruction";

        alert(
            "Unable to hear your voice. Please try again."
        );
    };

    recognition.onend = function () {

        voiceInputButton.textContent =
            "🎤 Speak Instruction";
    };

});


// ==========================================
// VOICE OUTPUT
// ==========================================

speakResultButton.addEventListener("click", function () {

    const explanation = resultText.textContent.trim();

    if (
        explanation === "" ||
        explanation === "Your simple safety explanation will appear here."
    ) {
        alert("Please generate a safety explanation first.");
        return;
    }

    if (!("speechSynthesis" in window)) {
        alert(
            "Voice output is not supported in this browser."
        );
        return;
    }

    // Remove Markdown symbols
    const cleanExplanation = explanation
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/#/g, "")
        .replace(/`/g, "")
        .replace(/\n+/g, " ")
        .trim();

    // Stop any previous speech
    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(cleanExplanation);

    const selectedLanguage = language.value;

    if (selectedLanguage === "marathi") {
        speech.lang = "mr-IN";
    } else {
        speech.lang = "hi-IN";
    }

    speech.rate = 0.8;
    speech.pitch = 1;
    speech.volume = 1;

    // Get available browser voices
    const voices = window.speechSynthesis.getVoices();

    let selectedVoice = null;

    if (selectedLanguage === "marathi") {

        selectedVoice = voices.find(
            voice =>
                voice.lang.toLowerCase().startsWith("mr")
        );

    } else {

        selectedVoice = voices.find(
            voice =>
                voice.lang.toLowerCase().startsWith("hi")
        );
    }

    // If Marathi/Hindi voice isn't available,
    // use the browser's default voice.
    if (selectedVoice) {
        speech.voice = selectedVoice;
    }

    speech.onstart = function () {
        speakResultButton.textContent =
            "🔊 Speaking...";
    };

    speech.onend = function () {
        speakResultButton.textContent =
            "🔊 Listen to Explanation";
    };

    speech.onerror = function (event) {

        console.error(
            "Speech synthesis error:",
            event.error
        );

        speakResultButton.textContent =
            "🔊 Listen to Explanation";

        alert(
            "The browser could not play the voice. Please try again or use Chrome/Edge."
        );
    };

    window.speechSynthesis.speak(speech);

});
