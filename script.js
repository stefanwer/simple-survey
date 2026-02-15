let surveyData = [];
let currentQuestionIndex = parseInt(sessionStorage.getItem('currentIndex')) || 0;
let scoreHistory = JSON.parse(sessionStorage.getItem('scoreHistory')) || [];

async function initSurvey() {
    try {
        const response = await fetch('questions.json');
        const modules = await response.json();

        let moduleCounter = 1;
        modules.forEach(module => {
            module.questions.forEach(question => {
                surveyData.push({
                    ...question,
                    displayTitle: `Modul ${moduleCounter}: ${module.moduleTitle}`
                });
            });
            moduleCounter++;
        });

        if (document.getElementById('question-container')) {
            loadQuestion();
        }
    } catch (error) {
        console.error("Fehler beim Laden:", error);
    }
}

function loadQuestion() {
    const moduleHeader = document.getElementById('module-header');
    const title = document.getElementById('question-title');
    const optionsDiv = document.getElementById('options-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const backBtn = document.getElementById('back-btn');

    if (currentQuestionIndex >= surveyData.length) {
        window.location.href = 'result.html';
        return;
    }

    const currentData = surveyData[currentQuestionIndex];
    backBtn.style.visibility = (currentQuestionIndex === 0) ? "hidden" : "visible";

    const totalQuestions = surveyData.length;
    const progressPercent = (currentQuestionIndex / totalQuestions) * 100;
    progressBar.style.width = `${progressPercent}%`;
    progressText.innerText = `Frage ${currentQuestionIndex + 1} von ${totalQuestions}`;

    moduleHeader.innerText = currentData.displayTitle;
    title.innerText = currentData.q;
    optionsDiv.innerHTML = "";

    const standardOptions = [
        { text: "Ja", weight: currentData.score },
        { text: "Nein", weight: 0 },
        { text: "Unbekannt", weight: 0 }
    ];

    standardOptions.forEach((opt) => {
        const label = document.createElement('label');
        label.className = "option";
        label.innerHTML = `
            <input type="radio" name="answer" value="${opt.weight}"> ${opt.text}
        `;
        optionsDiv.appendChild(label);
    });
}

function handleNext() {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) {
        alert("Bitte wähle eine Antwort aus!");
        return;
    }

    const currentData = surveyData[currentQuestionIndex];
    const weight = parseFloat(selected.value);
    const text = selected.parentElement.innerText.trim();

    scoreHistory[currentQuestionIndex] = {
        module: currentData.displayTitle,
        question: currentData.q,
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
    const totalScore = history.reduce((sum, item) => sum + (item.points || 0), 0).toFixed(2);

    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Ergebnisse", 20, 20);

    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gesamt-Score: ${totalScore}`, 20, 30);

    doc.setDrawColor(40, 167, 69);
    doc.setLineWidth(1);
    doc.line(20, 35, 190, 35);

    let y = 45;
    let lastModule = "";

    history.forEach((item, index) => {
        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        if (item.module !== lastModule) {
            y += 5;
            doc.setFillColor(232, 245, 233);
            doc.rect(20, y - 5, 170, 8, 'F');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(40, 167, 69);
            doc.text(item.module.toUpperCase(), 25, y);

            lastModule = item.module;
            y += 12;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        const splitQuestion = doc.splitTextToSize(`${index + 1}. ${item.question}`, 160);
        doc.text(splitQuestion, 20, y);
        y += (splitQuestion.length * 6);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`Antwort: ${item.answer}`, 25, y);

        doc.setFontSize(9);
        doc.text(`(${item.points} Pkt.)`, 170, y);

        y += 12;
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Seite ${i} von ${pageCount} - Generiert am ${new Date().toLocaleDateString()}`, 20, 285);
    }

    doc.save("Umfrage_Ergebnis.pdf");
}

initSurvey();

if (window.location.pathname.includes('result.html')) {
    const history = JSON.parse(sessionStorage.getItem('scoreHistory')) || [];
    const totalScore = history.reduce((a, b) => a + (b.points || 0), 0);
    document.getElementById('score-display').innerText = totalScore.toFixed(2);
}