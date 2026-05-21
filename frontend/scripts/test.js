document.addEventListener("DOMContentLoaded", function() {

    // --- Interactive Test Questions ---
    const questions = [
        {
            id: 1,
            question: "What is the derivative of x² with respect to x?",
            options: ["x", "2x", "2x²", "x² / 2"],
            correct: "2x",
            selected: null
        },
        {
            id: 2,
            question: "Solve the linear equation for x: 2x + 5 = 15",
            options: ["2", "5", "10", "15"],
            correct: "5",
            selected: null
        },
        {
            id: 3,
            question: "Which data structure operates on a Last-In, First-Out (LIFO) basis?",
            options: ["Queue", "Stack", "Array", "Linked List"],
            correct: "Stack",
            selected: null
        },
        {
            id: 4,
            question: "What is the square root of 144?",
            options: ["10", "11", "12", "13"],
            correct: "12",
            selected: null
        },
        {
            id: 5,
            question: "Which pillar of Object-Oriented Programming handles hiding internal details and showing only essentials?",
            options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
            correct: "Encapsulation",
            selected: null
        },
    ];
    const totalQuestions = questions.length;

    // --- State Variables ---
    let currentQuestionIndex = 0; // 0-based index
    let submitted = false;
    let timeRemaining = 45 * 60; // 45 minutes in seconds
    let timerInterval = null;

    // --- DOM Elements ---
    const testView = document.getElementById('test-view');
    const resultsView = document.getElementById('results-view');
    
    const questionCounter = document.getElementById('question-counter');
    const progressBar = document.getElementById('progress-bar');
    const questionNumber = document.getElementById('question-number');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const timerDisplay = document.getElementById('timer-display');
    
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const submitButton = document.getElementById('submit-button');

    const correctCountDisplay = document.getElementById('correct-count');
    const incorrectCountDisplay = document.getElementById('incorrect-count');
    const scorePercentageDisplay = document.getElementById('score-percentage');

    // --- Active Timer Logic ---
    function startTimer() {
        timerInterval = setInterval(() => {
            timeRemaining--;
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timerDisplay.textContent = "00:00";
                alert("Time's up! Your test will be submitted automatically.");
                showResults();
            } else {
                const minutes = Math.floor(timeRemaining / 60);
                const seconds = timeRemaining % 60;
                timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }, 1000);
    }

    // --- Question Rendering Logic ---
    function displayQuestion(index) {
        if (index < 0 || index >= totalQuestions) return;

        const question = questions[index];
        currentQuestionIndex = index;

        // Update progress
        const progressPercent = ((index + 1) / totalQuestions) * 100;
        progressBar.style.width = `${progressPercent}%`;
        questionCounter.textContent = `Question ${index + 1} of ${totalQuestions}`;

        // Update question details
        questionNumber.textContent = `Question ${index + 1}`;
        questionText.textContent = question.question;

        // Update options
        optionsContainer.innerHTML = ''; // Clear options
        question.options.forEach((option, optionIndex) => {
            const optionId = `q${index}-option${optionIndex}`;
            
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item';
            
            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.id = optionId;
            radioInput.name = `question-${index}`;
            radioInput.value = option;
            radioInput.checked = (question.selected === option); // Restore user selection
            
            radioInput.addEventListener('change', () => {
                questions[currentQuestionIndex].selected = option; // Store user selection
                
                // Active style highlight on selection
                document.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
                optionDiv.classList.add('selected');
            });

            const label = document.createElement('label');
            label.htmlFor = optionId;
            label.textContent = option;
            
            if (question.selected === option) {
                optionDiv.classList.add('selected');
            }

            optionDiv.appendChild(radioInput);
            optionDiv.appendChild(label);
            optionsContainer.appendChild(optionDiv);
        });

        // Update button states
        prevButton.disabled = (index === 0);
        nextButton.style.display = (index === totalQuestions - 1) ? 'none' : 'block';
        submitButton.style.display = (index === totalQuestions - 1) ? 'block' : 'none';
    }

    // --- Submit and Results Calculator ---
    function showResults() {
        submitted = true;
        clearInterval(timerInterval); // Stop timer
        
        testView.style.display = 'none';
        resultsView.style.display = 'block';

        // Calculate score
        let correctCount = 0;
        questions.forEach(q => {
            if (q.selected === q.correct) {
                correctCount++;
            }
        });

        const incorrectCount = totalQuestions - correctCount;
        const scorePercent = Math.round((correctCount / totalQuestions) * 100);

        // Update results display
        correctCountDisplay.textContent = correctCount;
        incorrectCountDisplay.textContent = incorrectCount;
        scorePercentageDisplay.textContent = `${scorePercent}%`;

        // Render beautiful Review Section
        renderAnswersReview();
    }

    // --- Render Review Answers Section ---
    function renderAnswersReview() {
        // If already exists, remove it
        const existingReview = document.getElementById('answers-review-container');
        if (existingReview) existingReview.remove();

        const reviewContainer = document.createElement('div');
        reviewContainer.id = 'answers-review-container';
        reviewContainer.className = 'card mt-8 animate-fade-up';
        reviewContainer.style.animationDelay = '200ms';
        reviewContainer.style.background = 'rgba(255, 255, 255, 0.8)';
        reviewContainer.style.backdropFilter = 'blur(10px)';
        reviewContainer.style.padding = '2rem';
        reviewContainer.style.borderRadius = '16px';
        reviewContainer.style.border = '1px solid rgba(10, 77, 156, 0.15)';

        let reviewMarkup = `
            <div class="card-header" style="border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 1rem; margin-bottom: 1.5rem;">
                <h2 class="card-title text-xl"><i class='bx bx-edit'></i> Detailed Answers Review</h2>
                <p class="text-muted text-sm">Review green correct markers and your selected choices</p>
            </div>
            <div class="space-y-6">
        `;

        questions.forEach((q, idx) => {
            const isCorrect = q.selected === q.correct;
            
            reviewMarkup += `
                <div style="padding: 1.25rem; border-radius: 12px; border: 1px solid ${isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; background: ${isCorrect ? 'rgba(34, 197, 94, 0.03)' : 'rgba(239, 68, 68, 0.03)'}; position: relative; margin-bottom: 1.5rem;">
                    <div style="position: absolute; top: 1.25rem; right: 1.25rem;">
                        <span class="badge ${isCorrect ? 'badge-green' : 'badge-red'}">
                            ${isCorrect ? "<i class='bx bx-check'></i> Correct" : "<i class='bx bx-x'></i> Incorrect"}
                        </span>
                    </div>
                    <h4 style="margin: 0 0 0.75rem 0; font-weight: 600; padding-right: 6rem; line-height: 1.4;">Q${idx + 1}. ${q.question}</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; padding-left: 0.75rem;">
            `;

            q.options.forEach(opt => {
                let badgeStyle = "color: var(--color-text);";
                let icon = "<i class='bx bx-radio-circle' style='font-size: 1.1rem; vertical-align: middle; margin-right: 0.25rem;'></i>";

                if (opt === q.correct) {
                    badgeStyle = "color: #15803d; font-weight: 600; background: rgba(34, 197, 94, 0.1); padding: 0.25rem 0.5rem; border-radius: 6px; border: 1px dashed rgba(34, 197, 94, 0.3);";
                    icon = "<i class='bx bxs-check-circle' style='font-size: 1.1rem; vertical-align: middle; margin-right: 0.25rem; color: #22c55e;'></i>";
                } else if (opt === q.selected) {
                    badgeStyle = "color: #b91c1c; font-weight: 600; background: rgba(239, 68, 68, 0.1); padding: 0.25rem 0.5rem; border-radius: 6px; border: 1px dashed rgba(239, 68, 68, 0.3);";
                    icon = "<i class='bx bxs-x-circle' style='font-size: 1.1rem; vertical-align: middle; margin-right: 0.25rem; color: #ef4444;'></i>";
                }

                reviewMarkup += `
                    <div style="font-size: 0.9rem; display: flex; align-items: center; ${badgeStyle}">
                        ${icon}
                        <span>${opt}</span>
                    </div>
                `;
            });

            reviewMarkup += `
                    </div>
                </div>
            `;
        });

        reviewMarkup += `</div>`;
        reviewContainer.innerHTML = reviewMarkup;
        resultsView.appendChild(reviewContainer);
    }

    // --- Wire up Review Button ---
    const reviewBtn = document.querySelector("#results-view .btn-outline");
    if (reviewBtn) {
        reviewBtn.addEventListener('click', () => {
            const container = document.getElementById('answers-review-container');
            if (container) {
                container.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // --- Navigation Buttons Listeners ---
    prevButton.addEventListener('click', () => {
        displayQuestion(currentQuestionIndex - 1);
    });

    nextButton.addEventListener('click', () => {
        displayQuestion(currentQuestionIndex + 1);
    });

    submitButton.addEventListener('click', () => {
        if (confirm("Are you sure you want to submit and complete the test?")) {
            showResults();
        }
    });

    // --- Initial Load ---
    displayQuestion(0);
    startTimer();

});
