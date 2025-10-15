// UI Management Module
// Contains all UI-related functions and DOM manipulation

import { calculateIpptResult } from './ippt-scoring.js';

export class UIManager {
    constructor() {
        this.attemptCount = 0;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // DOM Elements
        this.nameEl = document.getElementById('name');
        this.ageEl = document.getElementById('age');
        this.genderEl = document.getElementById('gender');
        this.workCycleEl = document.getElementById('work-cycle');
        this.medicalFitnessEl = document.getElementById('medical-fitness');
        this.addAttemptBtn = document.getElementById('add-attempt-btn');
        this.attemptsContainer = document.getElementById('attempts-container');
        this.generatePlanBtn = document.getElementById('generate-plan-btn');
        this.generationStatusEl = document.getElementById('generation-status');
        this.outputSectionEl = document.getElementById('output-section');
        this.planOutputEl = document.getElementById('plan-output');
        this.apiKeyEl = document.getElementById('api-key');
        this.clearAllBtn = document.getElementById('clear-all-btn');
        this.weaknessAnalysisSection = document.getElementById('weakness-analysis-section');
        this.analyzeWeaknessBtn = document.getElementById('analyze-weakness-btn');
        this.weaknessOutput = document.getElementById('weakness-output');
        this.dietaryBtn = document.getElementById('dietary-btn');
        this.dietaryOutput = document.getElementById('dietary-output');
        this.addAttemptBtnText = document.getElementById('add-attempt-btn-text');
        this.exportExcelBtn = document.getElementById('export-excel-btn');
        this.targetGoalEl = document.getElementById('target-goal');
        this.ageGroupDisplayEl = document.getElementById('age-group-display');
        this.themeToggle = document.getElementById('theme-toggle');
        this.lightIcon = document.getElementById('theme-toggle-light-icon');
        this.darkIcon = document.getElementById('theme-toggle-dark-icon');
        
        // Debug logging
        console.log('UIManager elements initialized:', {
            addAttemptBtn: !!this.addAttemptBtn,
            attemptsContainer: !!this.attemptsContainer,
            addAttemptBtnText: !!this.addAttemptBtnText,
            weaknessAnalysisSection: !!this.weaknessAnalysisSection
        });
    }

    attachEventListeners() {
        // Add attempt button
        if (this.addAttemptBtn) {
            // Remove any existing listeners first
            this.addAttemptBtn.removeEventListener('click', this.boundAddAttempt);
            // Create bound method for proper cleanup
            this.boundAddAttempt = () => this.addAttempt();
            this.addAttemptBtn.addEventListener('click', this.boundAddAttempt);
            console.log('✅ Add attempt button event listener attached');
        } else {
            console.error('❌ Add attempt button not found!');
            console.log('Available elements:', {
                addAttemptBtn: this.addAttemptBtn,
                attemptsContainer: this.attemptsContainer,
                addAttemptBtnText: this.addAttemptBtnText
            });
        }
        
        // Clear all button
        if (this.clearAllBtn) {
            this.clearAllBtn.addEventListener('click', () => this.clearAll());
        }
        
        // Age input for age group display and recalculation
        if (this.ageEl) {
            this.ageEl.addEventListener('input', () => {
                this.updateAgeGroupDisplay();
                this.fullRecalculateTrigger();
            });
        }
        
        // Gender change for recalculation
        if (this.genderEl) {
            this.genderEl.addEventListener('change', () => this.fullRecalculateTrigger());
        }
        
        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Initialize theme
        this.initializeTheme();
    }

    createAttemptRow(id) {
        const attemptDiv = document.createElement('div');
        attemptDiv.className = 'attempt-row grid grid-cols-1 md:grid-cols-10 gap-4 items-start bg-slate-100 p-3 rounded-lg';
        attemptDiv.dataset.id = id;
        attemptDiv.innerHTML = `
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-600">Push-ups</label>
                <input type="number" class="mt-1 pushups-input w-full rounded-md bg-white border-slate-300 shadow-sm text-sm p-2.5" placeholder="Reps">
                <span class="text-xs text-sky-600 points-span pushup-points">Points: --</span>
            </div>
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-600">Sit-ups</label>
                <input type="number" class="mt-1 situps-input w-full rounded-md bg-white border-slate-300 shadow-sm text-sm p-2.5" placeholder="Reps">
                <span class="text-xs text-sky-600 points-span situp-points">Points: --</span>
            </div>
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-600">2.4km Run</label>
                <input type="text" class="mt-1 run-input w-full rounded-md bg-white border-slate-300 shadow-sm text-sm p-2.5" placeholder="mm:ss">
                <span class="text-xs text-sky-600 points-span run-points">Points: --</span>
            </div>
            <div class="md:col-span-3 flex flex-col items-center justify-center text-center h-full pt-4 md:pt-0">
                <span class="block text-xs font-medium text-slate-500 mb-1">Result</span>
                <span class="result-span inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold">---</span>
            </div>
            <div class="md:col-span-1 flex items-center justify-center h-full">
                <button class="delete-attempt-btn text-slate-400 hover:text-red-600 transition-colors p-2 rounded-full mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>`;
        
        const updateTrigger = () => this.updateResult(attemptDiv);
        attemptDiv.querySelectorAll('input').forEach(input => input.addEventListener('input', updateTrigger));
        
        const deleteBtn = attemptDiv.querySelector('.delete-attempt-btn');
        deleteBtn.addEventListener('click', () => {
            attemptDiv.remove();
            if (this.attemptsContainer.children.length === 0) {
                this.weaknessAnalysisSection.classList.add('hidden');
            }
        });

        return attemptDiv;
    }

    updateResult(attemptDiv) {
        const pushups = parseInt(attemptDiv.querySelector('.pushups-input').value) || 0;
        const situps = parseInt(attemptDiv.querySelector('.situps-input').value) || 0;
        const runTime = attemptDiv.querySelector('.run-input').value;
        const age = parseInt(this.ageEl.value);
        const gender = this.genderEl.value;
        const resultSpan = attemptDiv.querySelector('.result-span');
        
        const pushupPointsSpan = attemptDiv.querySelector('.pushup-points');
        const situpPointsSpan = attemptDiv.querySelector('.situp-points');
        const runPointsSpan = attemptDiv.querySelector('.run-points');

        const resetPoints = () => {
            pushupPointsSpan.textContent = 'Points: --';
            situpPointsSpan.textContent = 'Points: --';
            runPointsSpan.textContent = 'Points: --';
        };

        if (!age || age <= 0) {
            resultSpan.textContent = `Enter Age`;
            resultSpan.className = `result-span inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-gray-200 text-gray-700`;
            resetPoints();
            return;
        }

        const { award, awardClass, totalPoints, pushupPoints, situpPoints, runPoints } = calculateIpptResult(pushups, situps, runTime, age, gender);
        
        pushupPointsSpan.textContent = `Points: ${pushupPoints}`;
        situpPointsSpan.textContent = `Points: ${situpPoints}`;
        runPointsSpan.textContent = `Points: ${runPoints}`;

        if (/^\d{1,2}:\d{2}$/.test(runTime) && pushups >= 0 && situps >= 0) {
            resultSpan.textContent = `${award} (${totalPoints} pts)`;
            resultSpan.className = `result-span inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${awardClass}`;
        } else {
            resultSpan.textContent = '---';
            resultSpan.className = 'result-span inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold';
        }
    }

    addAttempt() {
        console.log('addAttempt() method called, current count:', this.attemptCount);
        this.attemptCount++;
        const newRow = this.createAttemptRow(this.attemptCount);
        this.attemptsContainer.appendChild(newRow);
        this.weaknessAnalysisSection.classList.remove('hidden');
        this.addAttemptBtnText.textContent = 'Add Another Attempt';
        console.log('✅ New attempt added, count now:', this.attemptCount);
    }

    clearAll() {
        this.nameEl.value = '';
        this.ageEl.value = '';
        this.genderEl.value = 'male';
        this.workCycleEl.value = 'GRF Officer';
        this.medicalFitnessEl.value = 'None';
        this.targetGoalEl.value = '';
        
        this.attemptsContainer.innerHTML = '';
        this.attemptCount = 0;
        this.outputSectionEl.classList.add('hidden');
        this.weaknessAnalysisSection.classList.add('hidden');
        this.weaknessOutput.innerHTML = '';
        this.dietaryOutput.innerHTML = '';
        this.generationStatusEl.innerHTML = '';
        this.addAttemptBtnText.textContent = 'Add First Attempt';
        this.updateAgeGroupDisplay();
    }

    updateAgeGroupDisplay() {
        const age = parseInt(this.ageEl.value);
        if(age > 0) {
            this.ageGroupDisplayEl.textContent = `Age Group: ${this.getAgeGroupIndex(age) + 1}`;
        } else {
            this.ageGroupDisplayEl.textContent = 'Age Group: --';
        }
    }

    getAgeGroupIndex(age) {
        if (age <= 21) return 0;
        if (age >= 22 && age <= 24) return 1;
        if (age >= 25 && age <= 27) return 2;
        if (age >= 28 && age <= 30) return 3;
        if (age >= 31 && age <= 33) return 4;
        if (age >= 34 && age <= 36) return 5;
        if (age >= 37 && age <= 39) return 6;
        if (age >= 40 && age <= 42) return 7;
        if (age >= 43 && age <= 45) return 8;
        if (age >= 46 && age <= 48) return 9;
        if (age >= 49 && age <= 51) return 10;
        if (age >= 52 && age <= 54) return 11;
        if (age >= 55 && age <= 57) return 12;
        if (age >= 58 && age <= 60) return 13;
        return 13; 
    }

    fullRecalculateTrigger() {
        document.querySelectorAll('.attempt-row').forEach(row => this.updateResult(row));
    }

    simpleMarkdownToHtml(md) {
        return md.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                 .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 border-b pb-1 border-slate-300">$1</h2>')
                 .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
                 .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                 .replace(/\*(.*?)\*/g, '<em>$1</em>')
                 .replace(/^\s*-\s(.*$)/gim, '<li class="ml-4">$1</li>')
                 .replace(/<\/li>\n<li/g, '</li><li')
                 .replace(/(<li.*?>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
                 .replace(/<\/ul>\s*<ul>/g, '')
                 .replace(/\n/g, '<br>');
    }

    // Theme management
    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(savedTheme);
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            if (this.lightIcon) this.lightIcon.classList.remove('hidden');
            if (this.darkIcon) this.darkIcon.classList.add('hidden');
        } else {
            document.body.classList.remove('dark-mode');
            if (this.lightIcon) this.lightIcon.classList.add('hidden');
            if (this.darkIcon) this.darkIcon.classList.remove('hidden');
        }
    }

    toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        this.applyTheme(newTheme);
    }

    // Validation methods
    validateForm() {
        if (!this.nameEl.value || !this.ageEl.value || !this.medicalFitnessEl.value || !this.targetGoalEl.value || this.attemptsContainer.children.length === 0) {
            this.generationStatusEl.innerHTML = `<span class="text-red-500 font-semibold">Please fill in all details including Name, Age, Target Goal, Medical Status, and add at least one IPPT attempt.</span>`;
            return false;
        }
        if (parseInt(this.ageEl.value) <= 0) {
            this.generationStatusEl.innerHTML = `<span class="text-red-500 font-semibold">Please enter a valid age.</span>`;
            return false;
        }
        return true;
    }

    // Display methods
    showLoading(outputEl, loadingMessages = []) {
        if (loadingMessages.length > 0) {
            let messageIndex = 0;
            const updateMessage = () => {
                outputEl.innerHTML = `<div class="flex flex-col justify-center items-center"><div class="loader"></div><p class="mt-2 text-sky-600">${loadingMessages[messageIndex]}</p></div>`;
                messageIndex = (messageIndex + 1) % loadingMessages.length;
            };
            updateMessage();
            return setInterval(updateMessage, 2500);
        } else {
            outputEl.innerHTML = '<div class="flex justify-center items-center"><div class="loader"></div></div>';
            return null;
        }
    }

    showError(outputEl, message) {
        outputEl.innerHTML = `<span class="text-red-500 font-semibold">${message}</span>`;
    }

    showSuccess(outputEl, message) {
        outputEl.innerHTML = `<span class="text-green-500 font-semibold">${message}</span>`;
    }

    setButtonLoading(button, loading = true) {
        if (loading) {
            button.disabled = true;
            button.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            button.disabled = false;
            button.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
}
