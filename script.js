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
    const totalScore = history.reduce((sum, item) => sum + (item.points || 0), 0);

    // 1. Header & Gesamtscore
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("ATTR-Screening-Score Ergebnis", 20, 20);
    
    doc.setFontSize(16);
    doc.text(`Gesamtscore: ${totalScore.toFixed(0)} Punkte`, 20, 30);

    // 2. Risikoklassifikation (Ampel)
    let riskColor = [40, 167, 69]; 
    let riskTitle = "";
    let recommendations = [];

    if (totalScore <= 5) {
        riskColor = [40, 167, 69]; 
        riskTitle = "Niedriges Risiko (0-5 Punkte)";
        recommendations = ["Aktuell kein starker ATTR-Verdacht", "Re-Evaluation bei neuen Red Flags", "Ggf. Basisdiagnostik HF üblich"];
    } else if (totalScore <= 11) {
        riskColor = [255, 152, 0]; 
        riskTitle = "Mittleres Risiko (6-11 Punkte)";
        recommendations = ["EKG + Echokardiographie", "NT-proBNP/Troponin", "Serum-/Urin-Immunfixation + freie Leichtketten", "Ggf. Zuweisung spezialisierte Kardiologie"];
    } else {
        riskColor = [220, 53, 69]; 
        riskTitle = "Hohes Risiko (>=12 Punkte)";
        recommendations = ["Ausschluss AL-Amyloidose obligat", "Knochenszintigrafie (DPD/PYP/HMDP) + SPECT", "Zentrum für Amyloidose einbinden", "Ggf. genetische Abklärung"];
    }

    doc.setFillColor(...riskColor);
    doc.rect(20, 35, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(riskTitle, 25, 42);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let recY = 52;
    doc.text("Empfohlene Schritte:", 20, recY);
    recommendations.forEach(rec => {
        recY += 6;
        doc.text(`- ${rec}`, 25, recY);
    });

    doc.setDrawColor(200, 200, 200);
    doc.line(20, recY + 5, 190, recY + 5);

    const gammopathiePositiv = history.some(item => 
        item.question.includes("Monoklonale Gammopathie") && item.answer === "Ja"
    );

    if (gammopathiePositiv) {
        doc.setFillColor(255, 241, 118); // Gelb
        doc.rect(20, recY + 10, 170, 10, 'F');
        doc.setDrawColor(251, 192, 45); // Rand
        doc.rect(20, recY + 10, 170, 10, 'S');
        
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("ACHTUNG: AL-Amyloidose ausschließen!", 105, recY + 16.5, { align: "center" });
        recY += 18;
    }

    // 3. Einzelergebnisse
    let y = recY + 15;
    let lastModule = "";

    history.forEach((item, index) => {
        if (y > 270) { doc.addPage(); y = 20; }

        // Modul-Header
        if (item.module !== lastModule) {
            y += 5;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(100, 100, 100);
            doc.text(item.module, 20, y);
            lastModule = item.module;
            y += 8;
        }

        // Frage (wieder in normaler Schrift)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        const questionText = `${index + 1}. ${item.question}`;
        const splitQuestion = doc.splitTextToSize(questionText, 160);
        doc.text(splitQuestion, 20, y);
        y += (splitQuestion.length * 6);

        // Antwortzeile mit gelber Markierung bei "Ja"
        doc.setFontSize(9);
        if (item.answer === "Ja") {
            // Gelber Hintergrund für "Antwort: Ja"
            doc.setFillColor(255, 255, 0); 
            doc.rect(24, y - 3.5, 20, 4.5, 'F'); 
            doc.setTextColor(0, 0, 0); // Text bei Markierung schwarz
        } else {
            doc.setTextColor(80, 80, 80);
        }

        doc.text(`Antwort: ${item.answer}`, 25, y);
        
        // Punkte (immer grau und rechtsbündig)
        doc.setTextColor(120, 120, 120);
        doc.text(`(${item.points} Pkt.)`, 170, y);

        y += 10;
    });

    // Fußzeile
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Seite ${i} von ${pageCount} - Generiert am ${new Date().toLocaleDateString()}`, 20, 285);
    }

    doc.save("ATTR_Screening_Ergebnis.pdf");
}

initSurvey();

if (window.location.pathname.includes('result.html')) {
    const history = JSON.parse(sessionStorage.getItem('scoreHistory')) || [];
    const totalScore = history.reduce((a, b) => a + (b.points || 0), 0);

    const scoreDisplay = document.getElementById('score-display');
    const riskContainer = document.getElementById('risk-evaluation');
    const gammopathiePositiv = history.some(item => 
        item.question.includes("Monoklonale Gammopathie") && item.answer === "Ja"
    );

    scoreDisplay.innerText = totalScore.toFixed(0);

    let riskHTML = "";

    if (totalScore <= 5) {
        // Niedriges Risiko
        riskHTML = `
            <div class="risk-card low-risk">
                <h3>Niedriges Risiko (0-5 Punkte)</h3>
                <p>Aktuell kein starker ATTR-Verdacht.</p>
                <ul class="recommendations">
                    <li>Re-Evaluation bei neuen Red Flags</li>
                    <li>ggf. Basisdiagnostik HF üblich</li>
                </ul>
            </div>`;
    } else if (totalScore <= 11) {
        // Mittleres Risiko
        riskHTML = `
            <div class="risk-card medium-risk">
                <h3>Mittleres Risiko (6-11 Punkte)</h3>
                <p>Empfohlene Schritte:</p>
                <ul class="recommendations">
                    <li>EKG + Echokardiographie</li>
                    <li>NT-proBNP/Troponin</li>
                    <li>Serum-/Urin-Immunfixation + freie Leichtketten</li>
                    <li>ggf. Zuweisung spezialisierte Kardiologie</li>
                </ul>
            </div>`;
    } else {
        // Hohes Risiko
        riskHTML = `
            <div class="risk-card high-risk">
                <h3>Hohes Risiko (≥12 Punkte)</h3>
                <p>Klare Empfehlung:</p>
                <ul class="recommendations">
                    <li>Ausschluss AL-Amyloidose obligat</li>
                    <li>Knochenszintigrafie (DPD/PYP/HMDP) + SPECT</li>
                    <li>Zentrum für Amyloidose einbinden</li>
                    <li>ggf. genetische Abklärung</li>
                </ul>
            </div>`;
    }

    if (gammopathiePositiv) {
        const warningHTML = `
            <div style="background-color: #fff176; border: 2px solid #fbc02d; padding: 15px; border-radius: 8px; margin-top: 15px; font-weight: bold; color: #000; text-align: center;">
                ⚠️ WICHTIGER HINWEIS: AL-Amyloidose ausschließen!
            </div>`;
        riskContainer.innerHTML += warningHTML;
    }
    
    riskContainer.innerHTML = riskHTML;
}