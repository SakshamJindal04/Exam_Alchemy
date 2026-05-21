document.addEventListener("DOMContentLoaded", function() {

    // --- Element Selectors ---
    const easySlider = document.getElementById('easy-slider');
    const easyValueDisplay = document.getElementById('easy-value');
    const mediumSlider = document.getElementById('medium-slider');
    const mediumValueDisplay = document.getElementById('medium-value');
    const hardSlider = document.getElementById('hard-slider');
    const hardValueDisplay = document.getElementById('hard-value');

    const examTitleInput = document.getElementById('generate-title');
    const subjectSelect = document.getElementById('generate-subject');
    const totalMarksInput = document.getElementById('generate-total-marks');

    const generateButton = document.getElementById('generate-button');
    const generateButtonContent = document.getElementById('generate-button-content');
    const generatingIndicator = document.getElementById('generating-indicator');
    
    const previewPlaceholder = document.getElementById('preview-placeholder');
    const previewContent = document.getElementById('preview-content');
    const paperPreviewBox = document.getElementById('paper-preview-box');

    const viewRawBtn = document.getElementById('view-raw-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');

    let isLoading = false;
    let generatedPaperData = null; // Holds active generated paper markup & data

    // --- Slider Value Balancing Logic ---
    easySlider.addEventListener('input', () => balanceSliders('easy'));
    mediumSlider.addEventListener('input', () => balanceSliders('medium'));
    hardSlider.addEventListener('input', () => balanceSliders('hard'));

    function balanceSliders(changedSlider) {
        let easy = parseInt(easySlider.value);
        let medium = parseInt(mediumSlider.value);
        let hard = parseInt(hardSlider.value);
        
        let sum = easy + medium + hard;
        
        if (sum !== 100) {
            if (changedSlider === 'easy') {
                let remaining = 100 - easy;
                if (medium + hard > 0) {
                    let ratio = medium / (medium + hard);
                    medium = Math.round(remaining * ratio);
                    hard = 100 - easy - medium;
                } else {
                    medium = Math.round(remaining / 2);
                    hard = 100 - easy - medium;
                }
            } else if (changedSlider === 'medium') {
                let remaining = 100 - medium;
                if (easy + hard > 0) {
                    let ratio = easy / (easy + hard);
                    easy = Math.round(remaining * ratio);
                    hard = 100 - easy - medium;
                } else {
                    easy = Math.round(remaining / 2);
                    hard = 100 - easy - medium;
                }
            } else {
                let remaining = 100 - hard;
                if (easy + medium > 0) {
                    let ratio = easy / (easy + medium);
                    easy = Math.round(remaining * ratio);
                    medium = 100 - easy - hard;
                } else {
                    easy = Math.round(remaining / 2);
                    medium = 100 - easy - hard;
                }
            }
            
            easySlider.value = easy;
            mediumSlider.value = medium;
            hardSlider.value = hard;
        }
        
        easyValueDisplay.textContent = `${easy}%`;
        mediumValueDisplay.textContent = `${medium}%`;
        hardValueDisplay.textContent = `${hard}%`;
    }

    // --- High-Quality Seeded Fallback Questions ---
    const fallbackQuestions = [
        // Mathematics
        { questionText: "Prove that the sum of the angles of a triangle is 180 degrees.", difficulty: "EASY", subject: "Mathematics" },
        { questionText: "Solve the quadratic equation: x^2 - 5x + 6 = 0.", difficulty: "EASY", subject: "Mathematics" },
        { questionText: "Find the derivative of f(x) = sin(x) * e^x with respect to x.", difficulty: "MEDIUM", subject: "Mathematics" },
        { questionText: "Evaluate the integral: ∫ (3x^2 + 2x + 1) dx from 0 to 2.", difficulty: "MEDIUM", subject: "Mathematics" },
        { questionText: "State and prove the Mean Value Theorem for derivatives.", difficulty: "HARD", subject: "Mathematics" },
        { questionText: "Solve the system of equations using Cramer's Rule: 2x+3y=8, 3x-y=1.", difficulty: "MEDIUM", subject: "Mathematics" },
        { questionText: "Explain the divergence theorem and its physical significance in vector calculus.", difficulty: "HARD", subject: "Mathematics" },
        
        // Physics
        { questionText: "Define speed, velocity, and acceleration. State their SI units.", difficulty: "EASY", subject: "Physics" },
        { questionText: "State Newton's three laws of motion with simple real-world examples.", difficulty: "EASY", subject: "Physics" },
        { questionText: "Derive the expression for the kinetic energy of an object of mass 'm' moving with velocity 'v'.", difficulty: "MEDIUM", subject: "Physics" },
        { questionText: "Explain the working principle of a nuclear reactor with a neat diagram.", difficulty: "HARD", subject: "Physics" },
        { questionText: "What is electromagnetic induction? State Faraday's laws of induction.", difficulty: "MEDIUM", subject: "Physics" },
        { questionText: "Derive Maxwell's equations in vacuum and explain their physical interpretations.", difficulty: "HARD", subject: "Physics" },
        
        // Chemistry
        { questionText: "What is the difference between a covalent bond and an ionic bond?", difficulty: "EASY", subject: "Chemistry" },
        { questionText: "Balance the chemical equation: Fe + O2 -> Fe2O3.", difficulty: "EASY", subject: "Chemistry" },
        { questionText: "State Le Chatelier's principle and explain its applications in industrial chemistry.", difficulty: "MEDIUM", subject: "Chemistry" },
        { questionText: "Explain the Bohr model of the hydrogen atom and list its limitations.", difficulty: "MEDIUM", subject: "Chemistry" },
        { questionText: "Describe the reaction mechanism of nucleophilic substitution reactions (SN1 vs SN2) in detail.", difficulty: "HARD", subject: "Chemistry" },
        { questionText: "Derive the rate law for a first-order chemical reaction and define its half-life.", difficulty: "HARD", subject: "Chemistry" },

        // CS
        { questionText: "What is a pointer in C++? Explain with a short code snippet.", difficulty: "EASY", subject: "Computer Science" },
        { questionText: "Explain the difference between stack and queue data structures.", difficulty: "EASY", subject: "Computer Science" },
        { questionText: "Describe the concept of Object-Oriented Programming (OOP) and its four core pillars.", difficulty: "MEDIUM", subject: "Computer Science" },
        { questionText: "Write an algorithm for Binary Search and analyze its time complexity in best, average, and worst cases.", difficulty: "MEDIUM", subject: "Computer Science" },
        { questionText: "Explain the concept of Normalization in DBMS. Describe 1NF, 2NF, and 3NF with examples.", difficulty: "HARD", subject: "Computer Science" },
        { questionText: "Discuss the Dijkstra's shortest path algorithm. Provide its pseudocode and analyze its complexity.", difficulty: "HARD", subject: "Computer Science" }
    ];

    // --- Paper Generator Logic ---
    generateButton.addEventListener('click', () => {
        const subject = subjectSelect.value;
        if (!subject) {
            alert("Please select a subject first!");
            return;
        }

        if (isLoading) return;
        isLoading = true;

        // Show loading state
        generateButtonContent.classList.add('hidden');
        generatingIndicator.classList.remove('hidden');
        generateButton.disabled = true;

        // Reset display
        previewPlaceholder.classList.add('hidden');
        previewContent.classList.add('hidden');

        setTimeout(() => {
            try {
                generatePaper(subject);
            } catch (err) {
                console.error(err);
                alert("An error occurred during generation: " + err.message);
                previewPlaceholder.classList.remove('hidden');
            } finally {
                generateButtonContent.classList.remove('hidden');
                generatingIndicator.classList.add('hidden');
                generateButton.disabled = false;
                isLoading = false;
            }
        }, 1500); // Elegant 1.5s delay to simulate smart generator
    });

    function generatePaper(subject) {
        // Load bank
        let qBank = JSON.parse(localStorage.getItem('questionBank') || "[]");
        
        // Filter by subject
        let matchingQuestions = qBank.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
        let usingFallback = false;

        // If not enough questions in bank, merge fallback seed questions
        if (matchingQuestions.length < 5) {
            usingFallback = true;
            const seeded = fallbackQuestions.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
            matchingQuestions = [...matchingQuestions, ...seeded];
        }

        // Get sliders percentages
        const easyPct = parseInt(easySlider.value);
        const mediumPct = parseInt(mediumSlider.value);
        const hardPct = parseInt(hardSlider.value);

        // Group matching questions by difficulty
        const easyPool = matchingQuestions.filter(q => q.difficulty.toUpperCase() === 'EASY');
        const mediumPool = matchingQuestions.filter(q => q.difficulty.toUpperCase() === 'MEDIUM');
        const hardPool = matchingQuestions.filter(q => q.difficulty.toUpperCase() === 'HARD');

        // Total questions target: let's target 10 questions for a standard exam paper representation
        const targetCount = 10;
        const easyTarget = Math.max(1, Math.round((easyPct / 100) * targetCount));
        const mediumTarget = Math.max(1, Math.round((mediumPct / 100) * targetCount));
        const hardTarget = Math.max(1, targetCount - easyTarget - mediumTarget);

        // Pick questions randomly from pools
        const selectedQuestions = [
            ...getRandomSubset(easyPool, easyTarget, fallbackQuestions.filter(q => q.difficulty === 'EASY' && q.subject === subject)),
            ...getRandomSubset(mediumPool, mediumTarget, fallbackQuestions.filter(q => q.difficulty === 'MEDIUM' && q.subject === subject)),
            ...getRandomSubset(hardPool, hardTarget, fallbackQuestions.filter(q => q.difficulty === 'HARD' && q.subject === subject))
        ];

        // Format paper
        const examTitle = examTitleInput.value.trim() || "Semester Final Examination";
        const maxMarks = parseInt(totalMarksInput.value) || 100;
        const pattern = document.querySelector('input[name="pattern"]:checked').value;

        // Render preview markup
        buildPaperHTML(examTitle, subject, maxMarks, selectedQuestions, pattern, usingFallback);

        // Show content
        previewContent.classList.remove('hidden');
        previewContent.classList.add('animate-fade-in');
    }

    function getRandomSubset(pool, count, fallbackPool) {
        const subset = [];
        const activePool = pool.length > 0 ? pool : fallbackPool;
        
        if (activePool.length === 0) return [];

        const temp = [...activePool];
        for (let i = 0; i < count; i++) {
            if (temp.length === 0) break;
            const randIdx = Math.floor(Math.random() * temp.length);
            subset.push(temp.splice(randIdx, 1)[0]);
        }
        return subset;
    }

    function buildPaperHTML(title, subject, maxMarks, questions, pattern, isFallbackUsed) {
        // Divide questions into Sections
        let mcqs = [];
        let descriptives = [];

        if (pattern === 'mcq') {
            mcqs = questions;
        } else if (pattern === 'mixed') {
            const splitIdx = Math.ceil(questions.length / 2);
            mcqs = questions.slice(0, splitIdx);
            descriptives = questions.slice(splitIdx);
        } else {
            // Custom Mix: 30% MCQ, 70% Descriptive
            const splitIdx = Math.round(questions.length * 0.3);
            mcqs = questions.slice(0, splitIdx);
            descriptives = questions.slice(splitIdx);
        }

        // Construct mock multiple-choice options for MCQs
        const mcqMarkup = mcqs.map((q, idx) => {
            const options = generateOptionsForQuestion(q.questionText);
            return `
                <div style="margin-bottom: 1.25rem; font-size: 0.95rem; line-height: 1.5;">
                    <p style="margin: 0 0 0.5rem 0; font-weight: 500;">Q${idx + 1}. ${q.questionText} <span style="float: right; font-weight: 400; font-size: 0.85rem; color: #64748b;">[${q.difficulty} | 2 Marks]</span></p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; padding-left: 1.25rem;">
                        <div>A) ${options[0]}</div>
                        <div>B) ${options[1]}</div>
                        <div>C) ${options[2]}</div>
                        <div>D) ${options[3]}</div>
                    </div>
                </div>
            `;
        }).join('');

        const descMarkup = descriptives.map((q, idx) => {
            const marks = q.difficulty === 'HARD' ? 12 : 6;
            return `
                <div style="margin-bottom: 1.25rem; font-size: 0.95rem; line-height: 1.5;">
                    <p style="margin: 0 0 0.25rem 0; font-weight: 500;">Q${mcqs.length + idx + 1}. ${q.questionText} <span style="float: right; font-weight: 400; font-size: 0.85rem; color: #64748b;">[${q.difficulty} | ${marks} Marks]</span></p>
                    <p style="margin: 0 0 0.5rem 0; color: #64748b; font-size: 0.85rem; padding-left: 1.25rem; font-style: italic;">Explain your reasoning and show intermediate calculations where applicable.</p>
                </div>
            `;
        }).join('');

        const headerMarkup = `
            ${isFallbackUsed ? `
                <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.25); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; color: #854d0e; font-size: 0.85rem;">
                    <i class='bx bx-info-circle' style="font-size: 1.1rem; color: #ca8a04;"></i>
                    <span><strong>Note:</strong> Used smart pre-seeded question database to augment your Question Bank as it currently contains limited questions for <strong>${subject}</strong>.</span>
                </div>
            ` : ''}

            <!-- SRM & Exam Header -->
            <div style="text-align: center; border-bottom: 2px double #1e293b; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                <h2 style="margin: 0 0 0.25rem 0; font-weight: 700; font-size: 1.4rem; letter-spacing: 0.5px; color: #0b3a75;">SRM INSTITUTE OF SCIENCE AND TECHNOLOGY</h2>
                <h4 style="margin: 0 0 0.5rem 0; font-weight: 500; font-size: 0.95rem; color: #475569; text-transform: uppercase;">KATTANKULATHUR, KANCHIPURAM DISTRICT - 603203</h4>
                <h3 style="margin: 0 0 0.75rem 0; font-weight: 600; font-size: 1.15rem; color: #1e293b; letter-spacing: 0.25px;">${title.toUpperCase()}</h3>
                
                <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse; margin-top: 0.5rem; text-align: left;">
                    <tr>
                        <td style="padding: 0.25rem 0; font-weight: 600; width: 50%;">Course / Subject: <span style="font-weight: 400; color: #475569;">${subject}</span></td>
                        <td style="padding: 0.25rem 0; font-weight: 600; width: 50%; text-align: right;">Max. Marks: <span style="font-weight: 400; color: #475569;">${maxMarks}</span></td>
                    </tr>
                    <tr>
                        <td style="padding: 0.25rem 0; font-weight: 600;">Year / Semester: <span style="font-weight: 400; color: #475569;">2026 / Odd Semester</span></td>
                        <td style="padding: 0.25rem 0; font-weight: 600; text-align: right;">Duration: <span style="font-weight: 400; color: #475569;">3 Hours</span></td>
                    </tr>
                </table>
            </div>

            <!-- Sections Container -->
            <div style="text-align: left; color: #1e293b;">
                ${mcqMarkup ? `
                    <div style="margin-top: 1.5rem; margin-bottom: 2rem;">
                        <h4 style="border-bottom: 1px solid #cbd5e1; padding-bottom: 0.25rem; font-weight: 600; color: #0b3a75; font-size: 1.05rem; margin-bottom: 0.75rem;">SECTION A - MULTIPLE CHOICE QUESTIONS (MCQs)</h4>
                        ${mcqMarkup}
                    </div>
                ` : ''}

                ${descMarkup ? `
                    <div style="margin-top: 1.5rem;">
                        <h4 style="border-bottom: 1px solid #cbd5e1; padding-bottom: 0.25rem; font-weight: 600; color: #0b3a75; font-size: 1.05rem; margin-bottom: 0.75rem;">SECTION B - DESCRIPTIVE THEORY</h4>
                        ${descMarkup}
                    </div>
                ` : ''}
            </div>
        `;

        paperPreviewBox.innerHTML = headerMarkup;
        generatedPaperData = {
            title: title,
            subject: subject,
            maxMarks: maxMarks,
            markup: headerMarkup
        };
    }

    // Helper to generate context-aware multiple choice options
    function generateOptionsForQuestion(questionText) {
        const q = questionText.toLowerCase();
        if (q.includes("derivative") || q.includes("x^2") || q.includes("x²")) {
            return ["x", "2x", "2x + C", "x^3 / 3"];
        }
        if (q.includes("equation") || q.includes("5x")) {
            return ["x = 2, 3", "x = -2, -3", "x = 1, 5", "x = 0, 6"];
        }
        if (q.includes("newton")) {
            return ["Force = Mass * Acceleration", "Action and Reaction are equal", "Inertia of rest", "Universal gravitation"];
        }
        if (q.includes("covalent") || q.includes("ionic")) {
            return ["Sharing of electrons", "Transfer of electrons", "Van der Waals forces", "Metallic bonding"];
        }
        if (q.includes("pointer")) {
            return ["Stores memory address", "Stores integer values", "Points to dynamic loops", "Forces memory release"];
        }
        if (q.includes("binary search") || q.includes("complexity")) {
            return ["O(log n)", "O(n)", "O(n log n)", "O(n^2)"];
        }
        
        return ["None of the options", "All of the mentioned", "Both A and B", "None of the above"];
    }

    // --- Action Button 1: View Raw / Full Screen ---
    viewRawBtn.addEventListener('click', () => {
        if (!generatedPaperData) return;

        const printWindow = window.open('', '_blank', 'width=900,height=900');
        printWindow.document.write(`
            <html>
            <head>
                <title>${generatedPaperData.title} - Full Screen</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                <style>
                    body {
                        font-family: 'Poppins', sans-serif;
                        padding: 3rem;
                        background-color: #f8fafc;
                        color: #1e293b;
                    }
                    .paper-container {
                        max-width: 800px;
                        margin: 0 auto;
                        background: #ffffff;
                        padding: 3.5rem;
                        border-radius: 12px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.06);
                        border: 1px solid #e2e8f0;
                    }
                    @media print {
                        body { background-color: #ffffff; padding: 0; }
                        .paper-container { box-shadow: none; border: none; padding: 0; max-width: 100%; }
                    }
                </style>
            </head>
            <body>
                <div class="paper-container">
                    ${generatedPaperData.markup}
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    });

    // --- Action Button 2: Download PDF / Print ---
    downloadPdfBtn.addEventListener('click', () => {
        if (!generatedPaperData) return;

        const printWindow = window.open('', '_blank', 'width=900,height=900');
        printWindow.document.write(`
            <html>
            <head>
                <title>${generatedPaperData.title} - Download / Print</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Poppins', sans-serif;
                        padding: 2rem;
                        color: #1e293b;
                    }
                    .paper-container {
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    @media print {
                        body { padding: 0; }
                        .paper-container { max-width: 100%; }
                    }
                </style>
            </head>
            <body>
                <div class="paper-container">
                    ${generatedPaperData.markup}
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    });

});
