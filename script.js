let surveyData = [];
let currentQuestionIndex = parseInt(sessionStorage.getItem('currentIndex')) || 0;
let scoreHistory = JSON.parse(sessionStorage.getItem('scoreHistory')) || [];

async function initSurvey() {
    try {
        const response = await fetch('questions.json');
        surveyData = await response.json();
        if (document.getElementById('question-container')) {
            loadQuestion();
        }
    } catch (error) {
        console.error("Fehler beim Laden:", error);
    }
}

function loadQuestion() {
    const title = document.getElementById('question-title');
    const optionsDiv = document.getElementById('options-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const backBtn = document.getElementById('back-btn');

    if (currentQuestionIndex >= surveyData.length) {
        window.location.href = 'result.html';
        return;
    }

    backBtn.style.visibility = (currentQuestionIndex === 0) ? "hidden" : "visible";

    const currentData = surveyData[currentQuestionIndex];
    const totalQuestions = surveyData.length;
    const progressPercent = (currentQuestionIndex / totalQuestions) * 100;

    progressBar.style.width = `${progressPercent}%`;
    progressText.innerText = `Frage ${currentQuestionIndex + 1} von ${totalQuestions}`;

    title.innerText = currentData.q;
    optionsDiv.innerHTML = "";

    currentData.options.forEach((opt) => {
        const label = document.createElement('label');
        label.className = "option";
        label.innerHTML = `<input type="radio" name="answer" value="${opt.weight}"> ${opt.text}`;
        optionsDiv.appendChild(label);
    });
}

function handleNext() {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) {
        alert("Bitte wähle eine Antwort aus!");
        return;
    }

    const weight = parseFloat(selected.value);

    scoreHistory[currentQuestionIndex] = weight;
    sessionStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));

    currentQuestionIndex++;
    sessionStorage.setItem('currentIndex', currentQuestionIndex);
    loadQuestion();
}

function handleBack() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;

        scoreHistory.pop();
        sessionStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));

        sessionStorage.setItem('currentIndex', currentQuestionIndex);
        loadQuestion();
    }
}

initSurvey();

if (window.location.pathname.includes('result.html')) {
    const history = JSON.parse(sessionStorage.getItem('scoreHistory')) || [];
    const totalScore = history.reduce((a, b) => a + b, 0);
    document.getElementById('score-display').innerText = totalScore.toFixed(2);
    sessionStorage.clear();
}