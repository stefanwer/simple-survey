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
    const text = selected.parentElement.innerText.trim();
    const questionText = document.getElementById('question-title').innerText;

    scoreHistory[currentQuestionIndex] = {
        question: questionText,
        answer: text,
        points: weight
    };

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

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const history = JSON.parse(sessionStorage.getItem('scoreHistory')) || [];
    const finalScore = history.reduce((sum, item) => sum + item.points, 0).toFixed(2);

    doc.setFontSize(22);
    doc.text("Deine Umfrage-Ergebnisse", 20, 20);

    doc.setFontSize(16);
    doc.text(`Gesamt-Score: ${finalScore}`, 20, 35);

    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);

    doc.setFontSize(12);
    let y = 50;

    history.forEach((item, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${item.question}`, 20, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.text(`   Deine Antwort: ${item.answer} (${item.points} Pkt.)`, 20, y);
        y += 15;
    });

    doc.save("Umfrage_Ergebnis.pdf");
}

initSurvey();

if (window.location.pathname.includes('result.html')) {
    const history = JSON.parse(sessionStorage.getItem('scoreHistory')) || [];
    const totalScore = history.reduce((a, b) => a + (b.points || 0), 0);
    document.getElementById('score-display').innerText = totalScore.toFixed(2);
}