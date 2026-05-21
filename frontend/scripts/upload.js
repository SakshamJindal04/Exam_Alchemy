document.addEventListener("DOMContentLoaded", function() {

    const fileUploadInput = document.getElementById('question-file-upload');
    const processButton = document.getElementById('process-button');
    const previewSection = document.getElementById('preview-section');
    const previewTableBody = document.getElementById('preview-table-body');
    
    // Metadata default selectors
    const defaultSubjectInput = document.getElementById('default-subject');
    const defaultDifficultyInput = document.getElementById('default-difficulty');
    const defaultMarksInput = document.getElementById('default-marks');

    let parsedQuestions = []; // Active list of questions in preview

    // Enable button and show preview when a file is selected
    fileUploadInput.addEventListener('change', () => {
        const fileSelected = fileUploadInput.files.length > 0;
        
        if (fileSelected) {
            const file = fileUploadInput.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                const text = e.target.result;
                const fileExtension = file.name.split('.').pop().toLowerCase();
                
                try {
                    if (fileExtension === 'json') {
                        parsedQuestions = parseJSON(text);
                    } else if (fileExtension === 'csv') {
                        parsedQuestions = parseCSV(text);
                    } else {
                        alert("Unsupported file format! Please upload a CSV or JSON file.");
                        fileUploadInput.value = '';
                        return;
                    }

                    if (parsedQuestions.length === 0) {
                        alert("No valid questions could be parsed from the file.");
                        fileUploadInput.value = '';
                        return;
                    }

                    // Apply default metadata if fields are empty
                    applyMetadataDefaults();

                    // Render questions to the table
                    renderPreviewTable();

                    previewSection.classList.remove('hidden');
                    processButton.disabled = false;

                } catch (err) {
                    console.error("Parsing error:", err);
                    alert("Error parsing file: " + err.message);
                    fileUploadInput.value = '';
                    previewSection.classList.add('hidden');
                    processButton.disabled = true;
                }
            };

            reader.onerror = function() {
                alert("Error reading file.");
                fileUploadInput.value = '';
                previewSection.classList.add('hidden');
                processButton.disabled = true;
            };

            reader.readAsText(file);
        } else {
            previewSection.classList.add('hidden');
            processButton.disabled = true;
        }
    });

    // Handle process upload action
    processButton.addEventListener('click', () => {
        if (parsedQuestions.length === 0) {
            alert("No questions to upload!");
            return;
        }

        // Validate that all questions have text
        const invalidQ = parsedQuestions.some(q => !q.questionText.trim());
        if (invalidQ) {
            alert("All questions must have question text. Please fill in any empty questions or delete them.");
            return;
        }

        try {
            // Load existing question bank
            const existingBank = JSON.parse(localStorage.getItem('questionBank') || "[]");
            
            // Format new questions with unique IDs and standard uppercase difficulty
            const formattedQuestions = parsedQuestions.map(q => ({
                id: 'q_' + Math.random().toString(36).substr(2, 9),
                questionText: q.questionText.trim(),
                difficulty: (q.difficulty || "MEDIUM").toUpperCase(),
                subject: q.subject.trim() || "General Studies",
                createdAt: new Date().toISOString()
            }));

            // Save back to localStorage
            const newBank = [...existingBank, ...formattedQuestions];
            localStorage.setItem('questionBank', JSON.stringify(newBank));

            // Notify user beautifully
            alert(`Success! Imported ${formattedQuestions.length} questions to your Question Bank.`);

            // Reset page state
            fileUploadInput.value = '';
            previewSection.classList.add('hidden');
            processButton.disabled = true;
            parsedQuestions = [];
            
            // Reset metadata fields
            if (defaultSubjectInput) defaultSubjectInput.value = "";
            if (defaultDifficultyInput) defaultDifficultyInput.value = "";
            if (defaultMarksInput) defaultMarksInput.value = "";

        } catch (err) {
            console.error("Save failed:", err);
            alert("Failed to commit questions to Question Bank: " + err.message);
        }
    });

    // Parse JSON into standard structure
    function parseJSON(text) {
        const data = JSON.parse(text);
        const list = Array.isArray(data) ? data : [data];
        return list.map(item => {
            const questionText = item.questionText || item.question || item.text || "";
            const difficulty = item.difficulty || item.level || "";
            const subject = item.subject || item.topic || "";
            return {
                questionText: questionText,
                difficulty: capitalizeWord(difficulty),
                subject: subject
            };
        }).filter(q => q.questionText);
    }

    // Parse CSV into standard structure
    function parseCSV(text) {
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) return [];
        
        // Parse headers
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const questions = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // CSV cell parser respecting quotes
            const cols = [];
            let inQuotes = false;
            let currentCol = "";
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    cols.push(currentCol.trim().replace(/^"|"$/g, ''));
                    currentCol = "";
                } else {
                    currentCol += char;
                }
            }
            cols.push(currentCol.trim().replace(/^"|"$/g, ''));
            
            let questionText = "";
            let difficulty = "";
            let subject = "";
            
            headers.forEach((header, idx) => {
                const val = cols[idx] || "";
                if (header.includes("question") || header.includes("text")) {
                    questionText = val;
                } else if (header.includes("diff")) {
                    difficulty = val;
                } else if (header.includes("sub")) {
                    subject = val;
                }
            });
            
            // Fallback to absolute column index if headers are weird
            if (!questionText && cols[0]) {
                questionText = cols[0];
                difficulty = cols[1] || "";
                subject = cols[2] || "";
            }
            
            if (questionText) {
                questions.push({
                    questionText: questionText,
                    difficulty: capitalizeWord(difficulty),
                    subject: subject
                });
            }
        }
        return questions;
    }

    // Apply metadata defaults to missing fields
    function applyMetadataDefaults() {
        const defSubject = defaultSubjectInput ? defaultSubjectInput.value : "";
        const defDifficulty = defaultDifficultyInput ? defaultDifficultyInput.value : "";

        parsedQuestions.forEach(q => {
            if (!q.subject && defSubject) {
                q.subject = defSubject;
            }
            if (!q.difficulty && defDifficulty) {
                q.difficulty = capitalizeWord(defDifficulty);
            }
        });
    }

    // Helper to format difficulty words (e.g. easy -> Easy, MEDIUM -> Medium)
    function capitalizeWord(word) {
        if (!word) return "";
        const w = word.trim().toLowerCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
    }

    // Render parsed questions in the table with inline editing controls
    function renderPreviewTable() {
        previewTableBody.innerHTML = "";
        
        parsedQuestions.forEach((q, index) => {
            const row = document.createElement("tr");
            
            // ID cell
            const idCell = document.createElement("td");
            idCell.textContent = index + 1;
            row.appendChild(idCell);
            
            // Question Text Input cell
            const questionCell = document.createElement("td");
            const qInput = document.createElement("textarea");
            qInput.className = "form-input";
            qInput.style.width = "100%";
            qInput.style.minHeight = "45px";
            qInput.style.resize = "vertical";
            qInput.value = q.questionText;
            qInput.addEventListener("input", (e) => {
                parsedQuestions[index].questionText = e.target.value;
            });
            questionCell.appendChild(qInput);
            row.appendChild(questionCell);
            
            // Difficulty cell (Select Dropdown)
            const difficultyCell = document.createElement("td");
            const diffSelect = document.createElement("select");
            diffSelect.className = "form-select";
            
            const diffs = ["Easy", "Medium", "Hard"];
            diffs.forEach(d => {
                const opt = document.createElement("option");
                opt.value = d;
                opt.textContent = d;
                if (q.difficulty === d) {
                    opt.selected = true;
                }
                diffSelect.appendChild(opt);
            });
            diffSelect.addEventListener("change", (e) => {
                parsedQuestions[index].difficulty = e.target.value;
            });
            difficultyCell.appendChild(diffSelect);
            row.appendChild(difficultyCell);
            
            // Subject Cell
            const subjectCell = document.createElement("td");
            const sInput = document.createElement("input");
            sInput.type = "text";
            sInput.className = "form-input";
            sInput.value = q.subject || "General Studies";
            sInput.addEventListener("input", (e) => {
                parsedQuestions[index].subject = e.target.value;
            });
            subjectCell.appendChild(sInput);
            row.appendChild(subjectCell);
            
            // Actions cell (Delete Button)
            const actionsCell = document.createElement("td");
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn btn-outline btn-sm";
            deleteBtn.innerHTML = "<i class='bx bx-trash'></i> Delete";
            deleteBtn.style.color = "var(--color-red, #dc2626)";
            deleteBtn.style.borderColor = "rgba(220, 38, 38, 0.2)";
            deleteBtn.addEventListener("click", () => {
                parsedQuestions.splice(index, 1);
                renderPreviewTable();
                if (parsedQuestions.length === 0) {
                    previewSection.classList.add('hidden');
                    processButton.disabled = true;
                }
            });
            actionsCell.appendChild(deleteBtn);
            row.appendChild(actionsCell);
            
            previewTableBody.appendChild(row);
        });
    }

    // Monitor metadata defaults, apply immediately to preview list if altered
    if (defaultSubjectInput) {
        defaultSubjectInput.addEventListener("change", () => {
            if (parsedQuestions.length > 0 && defaultSubjectInput.value) {
                parsedQuestions.forEach(q => {
                    if (!q.subject || q.subject === "General Studies" || q.subject === "") {
                        q.subject = defaultSubjectInput.value;
                    }
                });
                renderPreviewTable();
            }
        });
    }

    if (defaultDifficultyInput) {
        defaultDifficultyInput.addEventListener("change", () => {
            if (parsedQuestions.length > 0 && defaultDifficultyInput.value) {
                parsedQuestions.forEach(q => {
                    q.difficulty = defaultDifficultyInput.value;
                });
                renderPreviewTable();
            }
        });
    }

});
