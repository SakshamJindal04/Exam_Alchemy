document.addEventListener("DOMContentLoaded", function() {

    // --- Configure PDF.js Worker ---
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    } else {
        console.error("PDF.js library was not loaded correctly.");
    }

    // --- Element Selectors ---
    const dropZone = document.getElementById('drop-zone');
    const pdfUploadInput = document.getElementById('pdf-upload');
    const fileDetailsPanel = document.getElementById('file-details-panel');
    const fileNameDisplay = document.getElementById('file-name');
    const fileSizeDisplay = document.getElementById('file-size');
    const removeFileBtn = document.getElementById('remove-file-btn');
    
    const apiKeyInput = document.getElementById('gemini-api-key');
    const toggleKeyVisibilityBtn = document.getElementById('toggle-key-visibility');

    const extractButton = document.getElementById('extract-button');
    const extractButtonContent = document.getElementById('extract-button-content');
    const extractingIndicator = document.getElementById('extracting-indicator');
    
    const resultsPlaceholder = document.getElementById('results-placeholder');
    const resultsLoadingState = document.getElementById('results-loading-state');
    const extractionStatusText = document.getElementById('extraction-status-text');
    const resultsContent = document.getElementById('results-content');
    
    const extractedQuestionsList = document.getElementById('extracted-questions-list');
    const extractionSummaryTitle = document.getElementById('extraction-summary-title');
    const extractionSummaryDesc = document.getElementById('extraction-summary-desc');
    const saveBankButton = document.getElementById('save-bank-button');

    // --- State Variables ---
    let selectedFile = null;
    let isExtracting = false;
    let currentQuestions = [];

    // Utility: Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- Initialize API Key from localStorage ---
    if (localStorage.getItem('gemini_api_key')) {
        apiKeyInput.value = localStorage.getItem('gemini_api_key');
        console.warn('⚠️ Gemini API key loaded from localStorage. Avoid storing API keys in the browser for production use.');
    }

    // Save API key when changed
    apiKeyInput.addEventListener('input', () => {
        localStorage.setItem('gemini_api_key', apiKeyInput.value.trim());
    });

    // Toggle API Key visibility
    toggleKeyVisibilityBtn.addEventListener('click', () => {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleKeyVisibilityBtn.innerHTML = "<i class='bx bx-hide'></i>";
        } else {
            apiKeyInput.type = 'password';
            toggleKeyVisibilityBtn.innerHTML = "<i class='bx bx-show'></i>";
        }
    });

    // --- Drag and Drop File Handlers ---
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    pdfUploadInput.addEventListener('change', () => {
        if (pdfUploadInput.files.length > 0) {
            handleFileSelect(pdfUploadInput.files[0]);
        }
    });

    removeFileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updateSelectedFile(null);
    });

    function handleFileSelect(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        if (extension !== 'pdf' && extension !== 'txt') {
            alert("Unsupported file format! Please upload a PDF or TXT file.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert("File is too large! Maximum limit is 10MB.");
            return;
        }
        updateSelectedFile(file);
    }

    function updateSelectedFile(file) {
        selectedFile = file;
        if (file) {
            fileNameDisplay.textContent = file.name;
            fileSizeDisplay.textContent = `${(file.size / 1024).toFixed(1)} KB`;
            fileDetailsPanel.classList.remove('hidden');
            dropZone.classList.add('hidden');
            extractButton.disabled = false;
        } else {
            pdfUploadInput.value = '';
            fileDetailsPanel.classList.add('hidden');
            dropZone.classList.remove('hidden');
            extractButton.disabled = true;
        }
    }

    // --- PDF/TXT Text Parsers ---
    async function parsePDF(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async function() {
                try {
                    const typedarray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let fullText = "";
                    const maxPages = Math.min(pdf.numPages, 10); // Parse up to 10 pages for speed/budget
                    
                    for (let i = 1; i <= maxPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(" ");
                        fullText += pageText + "\n";
                    }
                    resolve(fullText);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = err => reject(err);
            reader.readAsArrayBuffer(file);
        });
    }

    async function parseTXT(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.onerror = err => reject(err);
            reader.readAsText(file);
        });
    }

    // --- Fallback Text Analyzer (Emulator) ---
    function generateMockQuestions(text) {
        const words = text.toLowerCase().split(/\s+/);
        const stopWords = new Set(["the", "and", "a", "of", "to", "in", "is", "that", "it", "he", "was", "for", "on", "are", "as", "with", "his", "they", "i", "at", "be", "this", "have", "from", "or", "one", "had", "by", "but", "not", "what", "all", "were", "we", "when", "your", "can", "said", "there", "use", "an", "each", "which", "she", "do", "how", "their", "if", "will", "up", "other", "about", "out", "many", "then", "them", "these", "so", "some", "her", "would", "make", "like", "him", "into", "time", "has", "look", "two", "more", "write", "go", "see", "number", "no", "way", "could", "people", "my", "than", "first", "water", "been", "called", "who", "am", "its", "now", "find", "long", "down", "day", "did", "get", "come", "made", "may", "part", "would", "should", "could"]);
        
        const wordFreq = {};
        words.forEach(w => {
            const cleanW = w.replace(/[^a-z]/g, "");
            if (cleanW.length > 4 && !stopWords.has(cleanW)) {
                wordFreq[cleanW] = (wordFreq[cleanW] || 0) + 1;
            }
        });
        
        const sortedWords = Object.keys(wordFreq).sort((a, b) => wordFreq[b] - wordFreq[a]);
        const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
        
        const questions = [];
        const topTerms = sortedWords.slice(0, 5).map(capitalize);
        
        // Subject determination based on terms
        let subject = "General Studies";
        if (sortedWords.some(w => ["derivative", "integral", "limit", "equation", "matrix", "vector", "function", "theorem", "math"].includes(w))) {
            subject = "Mathematics";
        } else if (sortedWords.some(w => ["gravity", "force", "velocity", "acceleration", "motion", "atom", "molecule", "energy", "physics"].includes(w))) {
            subject = "Physics";
        } else if (sortedWords.some(w => ["react", "html", "javascript", "code", "programming", "software", "api", "database", "web"].includes(w))) {
            subject = "Computer Science";
        } else if (sortedWords.some(w => ["cell", "dna", "gene", "mitochondria", "protein", "organism", "biology", "evolution", "species"].includes(w))) {
            subject = "Biology";
        }
        
        if (topTerms.length >= 2) {
            questions.push({
                question: `Explain the fundamental concept of "${topTerms[0]}" and how it interacts with "${topTerms[1]}" based on the principles discussed in the text.`,
                difficulty: "Medium",
                subject: subject
            });
            questions.push({
                question: `What are the primary implications or consequences of "${topTerms[0]}" as outlined by the author in the document?`,
                difficulty: "Easy",
                subject: subject
            });
        } else if (topTerms.length === 1) {
            questions.push({
                question: `Define "${topTerms[0]}" and describe its main properties and active applications discussed in the text.`,
                difficulty: "Easy",
                subject: subject
            });
            questions.push({
                question: `Provide a detailed critical analysis of "${topTerms[0]}"'s significance to the overall context.`,
                difficulty: "Hard",
                subject: subject
            });
        } else {
            questions.push({
                question: "Summarize the core thesis and arguments presented in the uploaded document.",
                difficulty: "Medium",
                subject: "General Studies"
            });
            questions.push({
                question: "Identify three critical supporting details that validate the author's primary claims.",
                difficulty: "Easy",
                subject: "General Studies"
            });
        }
        
        if (topTerms.length >= 3) {
            questions.push({
                question: `Contrast the role of "${topTerms[2]}" against "${topTerms[0]}" in the structural framework of the system.`,
                difficulty: "Hard",
                subject: subject
            });
        }
        
        if (topTerms.length >= 4) {
            questions.push({
                question: `How does the document define the relation between "${topTerms[3]}" and the broader scope of ${subject}?`,
                difficulty: "Medium",
                subject: subject
            });
        }

        return questions;
    }

    // --- Gemini API Question Extractor ---
    async function generateQuestionsViaGemini(text, apiKey) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        // Truncate text to avoid exceeding token limit (approx 12k chars is safe)
        const textSample = text.substring(0, 15000);
        
        const prompt = `You are an expert exam generator. Analyze the following document text and extract exactly 4 to 7 high-quality, relevant exam or study questions based on the content.
Return ONLY a valid JSON array of objects. Do not include markdown code block syntax (like \`\`\`json) in your response, just the raw JSON text. Each object must have these exact keys:
- "question": the question text
- "difficulty": "Easy", "Medium", or "Hard"
- "subject": the subject or topic of the question

Document Text:
${textSample}`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json"
            }
        };
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status} Error`);
        }
        
        const result = await response.json();
        const resultText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!resultText) {
            throw new Error("Empty response received from Gemini API.");
        }
        
        try {
            return JSON.parse(resultText);
        } catch (e) {
            // Backup JSON parser in case it included markdown syntax
            const cleanedText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(cleanedText);
        }
    }

    // --- Extract Action ---
    extractButton.addEventListener('click', async () => {
        if (isExtracting || !selectedFile) return;

        isExtracting = true;
        
        // Show loading state
        extractButtonContent.classList.add('hidden');
        extractingIndicator.classList.remove('hidden');
        extractButton.disabled = true;

        // Display Loading Status overlay
        resultsPlaceholder.classList.add('hidden');
        resultsContent.classList.add('hidden');
        resultsLoadingState.classList.remove('hidden');

        try {
            // Phase 1: Parse local file
            extractionStatusText.textContent = "Parsing file text pages...";
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
            let documentText = "";

            if (fileExtension === 'pdf') {
                documentText = await parsePDF(selectedFile);
            } else if (fileExtension === 'txt') {
                documentText = await parseTXT(selectedFile);
            }

            if (!documentText || documentText.trim().length === 0) {
                throw new Error("No readable text was found in the uploaded document.");
            }

            // Phase 2: Call LLM or Fallback Emulator
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                extractionStatusText.textContent = "Connecting to Gemini 2.5 Flash API...";
                currentQuestions = await generateQuestionsViaGemini(documentText, apiKey);
            } else {
                extractionStatusText.textContent = "Analyzing text via local smart engine...";
                // Dramatic sleep for better UX flow
                await new Promise(resolve => setTimeout(resolve, 1800));
                currentQuestions = generateMockQuestions(documentText);
            }

            // Phase 3: Populate and render results
            if (!Array.isArray(currentQuestions) || currentQuestions.length === 0) {
                throw new Error("Failed to extract structured questions from the text.");
            }

            renderExtractedQuestions(currentQuestions);

            // Hide Loading & Show Content
            resultsLoadingState.classList.add('hidden');
            resultsContent.classList.remove('hidden');
            resultsContent.classList.add('animate-fade-in');

        } catch (error) {
            console.error("Extraction error:", error);
            alert(`Extraction failed: ${error.message}`);
            
            // Restore back to placeholder state
            resultsLoadingState.classList.add('hidden');
            resultsPlaceholder.classList.remove('hidden');
        } finally {
            // Reset Button states
            extractButtonContent.classList.remove('hidden');
            extractingIndicator.classList.add('hidden');
            extractButton.disabled = false;
            isExtracting = false;
        }
    });

    function renderExtractedQuestions(questions) {
        extractedQuestionsList.innerHTML = '';
        
        // Update summary cards
        extractionSummaryTitle.innerHTML = `<i class='bx bxs-check-circle'></i> Extraction Complete`;
        extractionSummaryDesc.textContent = `Successfully extracted ${questions.length} questions from ${selectedFile.name}`;

        questions.forEach((q, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item glass-card animate-fade-in';
            questionItem.style.padding = '1rem';
            questionItem.style.border = '1px solid rgba(10, 77, 156, 0.1)';
            questionItem.style.borderRadius = '10px';
            questionItem.style.background = 'rgba(255, 255, 255, 0.7)';
            
            // Determine difficulty badge color
            let diffTagClass = 'tag-secondary';
            if (q.difficulty === 'Easy') diffTagClass = 'badge-green';
            else if (q.difficulty === 'Medium') diffTagClass = 'badge-yellow';
            else if (q.difficulty === 'Hard') diffTagClass = 'badge-red';

            questionItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
                    <p class="text-sm font-semibold text-foreground" style="margin: 0; line-height: 1.4;">
                        ${index + 1}. ${escapeHtml(q.question)}
                    </p>
                </div>
                <div class="flex-gap mt-3" style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                    <span class="badge ${diffTagClass}">${q.difficulty}</span>
                    <span class="badge" style="background: rgba(10, 77, 156, 0.05); color: var(--color-primary); border: 1px solid rgba(10, 77, 156, 0.1);">${q.subject}</span>
                </div>
            `;
            extractedQuestionsList.appendChild(questionItem);
        });
    }

    // --- Save to Local Question Bank ---
    saveBankButton.addEventListener('click', () => {
        if (currentQuestions.length === 0) return;

        try {
            // Load existing question bank
            const existingBank = JSON.parse(localStorage.getItem('questionBank') || "[]");
            
            // Add unique ID and timestamp to each question
            const formattedQuestions = currentQuestions.map(q => ({
                id: 'q_' + Math.random().toString(36).substr(2, 9),
                questionText: q.question,
                difficulty: q.difficulty.toUpperCase(),
                subject: q.subject,
                createdAt: new Date().toISOString()
            }));

            // Save to localStorage
            const newBank = [...existingBank, ...formattedQuestions];
            localStorage.setItem('questionBank', JSON.stringify(newBank));

            alert(`Successfully saved ${formattedQuestions.length} questions to your Question Bank!`);
            
            // Reset page state
            updateSelectedFile(null);
            resultsPlaceholder.classList.remove('hidden');
            resultsContent.classList.add('hidden');
            currentQuestions = [];

        } catch (e) {
            console.error("Save failed:", e);
            alert("Failed to save questions to your question bank.");
        }
    });

});
