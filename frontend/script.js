const explainButton = document.getElementById("explainButton");

const instructionInput = document.getElementById("instructionInput");

const language = document.getElementById("language");

const resultText = document.getElementById("resultText");


explainButton.addEventListener("click", function () {

    const instruction = instructionInput.value.trim();

    const selectedLanguage = language.value;


    if (instruction === "") {

        resultText.textContent =
            "Please enter a safety instruction first.";

        return;
    }


    if (selectedLanguage === "marathi") {

        resultText.textContent =
            "तुमची सुरक्षा सूचना AI द्वारे सोप्या मराठी भाषेत समजावून सांगितली जाईल.";

    } else {

        resultText.textContent =
            "आपके सुरक्षा निर्देश को AI सरल हिंदी भाषा में समझाएगा।";
    }

});