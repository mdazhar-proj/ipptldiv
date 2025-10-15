import { calculateIpptResult } from './charts.js';
import { callGemini, simpleMarkdownToHtml } from './api.js';

// Lazy DOM mapping. Call initDOM() after DOMContentLoaded to populate.
let DOM = {};
export function initDOM() {
    DOM = {
        nameEl: document.getElementById('name'),
        ageEl: document.getElementById('age'),
        genderEl: document.getElementById('gender'),
        workCycleEl: document.getElementById('work-cycle'),
        medicalFitnessEl: document.getElementById('medical-fitness'),
        addAttemptBtn: document.getElementById('add-attempt-btn'),
        attemptsContainer: document.getElementById('attempts-container'),
        generatePlanBtn: document.getElementById('generate-plan-btn'),
        generationStatusEl: document.getElementById('generation-status'),
        outputSectionEl: document.getElementById('output-section'),
        planOutputEl: document.getElementById('plan-output'),
        apiKeyEl: document.getElementById('api-key'),
        clearAllBtn: document.getElementById('clear-all-btn'),
        weaknessAnalysisSection: document.getElementById('weakness-analysis-section'),
        analyzeWeaknessBtn: document.getElementById('analyze-weakness-btn'),
        weaknessOutput: document.getElementById('weakness-output'),
        dietaryBtn: document.getElementById('dietary-btn'),
        dietaryOutput: document.getElementById('dietary-output'),
        addAttemptBtnText: document.getElementById('add-attempt-btn-text'),
        exportExcelBtn: document.getElementById('export-excel-btn'),
        targetGoalEl: document.getElementById('target-goal'),
        ageGroupDisplayEl: document.getElementById('age-group-display'),
        themeToggle: document.getElementById('theme-toggle'),
        lightIcon: document.getElementById('theme-toggle-light-icon'),
        darkIcon: document.getElementById('theme-toggle-dark-icon')
    };
    return DOM;
}

export function createAttemptRow(id) {
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

    const updateTrigger = () => updateResult(attemptDiv);
    attemptDiv.querySelectorAll('input').forEach(input => input.addEventListener('input', updateTrigger));

    const deleteBtn = attemptDiv.querySelector('.delete-attempt-btn');
    deleteBtn.addEventListener('click', () => {
        attemptDiv.remove();
        if (DOM.attemptsContainer.children.length === 0) {
            DOM.weaknessAnalysisSection.classList.add('hidden');
        }
    });

    return attemptDiv;
}

export function updateResult(attemptDiv) {
    const pushups = parseInt(attemptDiv.querySelector('.pushups-input').value) || 0;
    const situps = parseInt(attemptDiv.querySelector('.situps-input').value) || 0;
    const runTime = attemptDiv.querySelector('.run-input').value;
    const age = parseInt(DOM.ageEl.value);
    const gender = DOM.genderEl.value;
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

export function getOfficerData() {
    const officerData = {
        name: DOM.nameEl.value,
        age: DOM.ageEl.value,
        gender: DOM.genderEl.value,
        workCycle: DOM.workCycleEl.value,
        medicalStatus: DOM.medicalFitnessEl.value,
        targetGoal: DOM.targetGoalEl.value,
        attempts: []
    };
    document.querySelectorAll('.attempt-row').forEach((row, index) => {
        officerData.attempts.push({
            attempt: index + 1,
            pushups: row.querySelector('.pushups-input').value,
            situps: row.querySelector('.situps-input').value,
            runTime: row.querySelector('.run-input').value,
            result: row.querySelector('.result-span').textContent
        });
    });
    return officerData;
}

export function exportToExcel() {
    const officerData = getOfficerData();
    if (officerData.attempts.length === 0) return;

    const ws_data = [
        ["Officer's Details"],
        ["Name", officerData.name],
        ["Age", officerData.age],
        ["Gender", officerData.gender],
        ["Medical Status", officerData.medicalStatus],
        [],
        ["IPPT Attempts"]
    ];

    const headers = ["Attempt #", "Push-ups", "Sit-ups", "2.4km Run", "Result"];
    ws_data.push(headers);

    officerData.attempts.forEach(attempt => {
        ws_data.push([
            attempt.attempt,
            attempt.pushups,
            attempt.situps,
            attempt.runTime,
            attempt.result
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = [ {wch:15}, {wch:15}, {wch:15}, {wch:15}, {wch:30} ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "IPPT Attempts");
    const fileName = `${officerData.name.replace(/\s+/g, '_') || 'Officer'}_IPPT_Attempts.xlsx`;
    XLSX.writeFile(wb, fileName);
}

export async function analyzeWeakness() {
    const officerData = getOfficerData();
    if (officerData.attempts.length === 0) return;

    let prompt = `You are a friendly and encouraging fitness buddy! 🤸‍♂️ Analyze the following IPPT results for an officer named ${officerData.name}. In simple terms, point out their weakest station based on the points. Use emoticons to make your one-paragraph explanation fun and motivating.

Results:
${officerData.attempts.map(att => `- Push-ups: ${att.pushups}, Sit-ups: ${att.situps}, 2.4km Run: ${att.runTime} (Result: ${att.result})`).join('\n')}

Keep the analysis concise and encouraging.`;

    await callGemini({ apiKey: DOM.apiKeyEl.value, prompt, outputEl: DOM.weaknessOutput, buttonEl: DOM.analyzeWeaknessBtn });
}

export async function generatePlan() {
    if (!DOM.nameEl.value || !DOM.ageEl.value || !DOM.medicalFitnessEl.value || !DOM.targetGoalEl.value || DOM.attemptsContainer.children.length === 0) {
        DOM.generationStatusEl.innerHTML = `<span class="text-red-500 font-semibold">Please fill in all details including Name, Age, Target Goal, Medical Status, and add at least one IPPT attempt.</span>`;
        return;
    }
    if (parseInt(DOM.ageEl.value) <= 0) {
        DOM.generationStatusEl.innerHTML = `<span class="text-red-500 font-semibold">Please enter a valid age.</span>`;
        return;
    }

    DOM.outputSectionEl.classList.add('hidden');
    DOM.dietaryOutput.classList.add('hidden');

    const officerData = getOfficerData();
    let prompt = `You are a super motivating and friendly fitness buddy! 💪 Your goal is to create a simple and fun 4-week IPPT training plan for an officer. Use simple language and lots of encouraging emoticons (like 👍, 🎉, 🔥). Make the plan easy to understand and follow.

Officer's Details:
- Name: ${officerData.name}, Age: ${officerData.age}, Gender: ${officerData.gender}
- Work Cycle: ${officerData.workCycle}. This is very important. For 'GRF Officer', their schedule is a 4-day cycle: Morning shift (8am-7:30pm), Night shift (7:30pm-8am), Off-day, Off-day. For 'Office Hours', they work Monday to Friday 9am-6pm. The training plan MUST be tailored to this work schedule realistically.
- Medical Status: ${officerData.medicalStatus}
- TARGET GOAL: Achieve IPPT ${officerData.targetGoal}

Past IPPT Attempts:
${officerData.attempts.map(att => `- Push-ups: ${att.pushups}, Sit-ups: ${att.situps}, 2.4km Run: ${att.runTime} (${att.result})`).join('\n')}

Your response must be a detailed, encouraging, and actionable 4-week plan focused on bridging the gap from their current results to their ${officerData.targetGoal} target. Include:
1. A brief, encouraging opening statement acknowledging their goal.
2. An analysis of their weakest stations in the context of their goal.
3. A week-by-week schedule (Week 1-4) with specific, progressively challenging exercises (sets, reps, distances) and 2-3 rest days per week, planned around their specific work cycle.
4. Tips on proper form.
5. If medical status indicates limitations (e.g., 'excused running'), suggest alternatives.
6. Format using Markdown (headings, bold, bullets).`;

    const loadingMessages = [
        "Hold on... 🏃‍♂️",
        "Millions of computers are working on this... 💻",
        "We're almost there, but not yet... 🤔",
        "Almost... ✨"
    ];

    const planText = await callGemini({ apiKey: DOM.apiKeyEl.value, prompt, outputEl: DOM.generationStatusEl, buttonEl: DOM.generatePlanBtn, loadingMessages });

    if (planText) {
        DOM.planOutputEl.innerHTML = simpleMarkdownToHtml(planText);
        DOM.outputSectionEl.classList.remove('hidden');
        DOM.generationStatusEl.innerHTML = '<span class="text-green-500 font-semibold">Your plan is ready! ✅</span>';
    }
}

export async function getDietaryAdvice() {
    DOM.dietaryOutput.classList.remove('hidden');
    const officerData = getOfficerData();
    let prompt = `You are a friendly food coach! 🥑 Your goal is to give 5 simple and easy-to-follow dietary tips for an officer in Singapore who wants to improve their IPPT score. Use simple words and fun emoticons (like 🍎, 🥦, 💧). Make the advice practical and mention some yummy local food choices.

Officer's Details:
- Age: ${officerData.age}

Generate 5 simple, actionable dietary tips to support their training. Do not create a full meal plan. Format as a bulleted list using Markdown.`;

    await callGemini({ apiKey: DOM.apiKeyEl.value, prompt, outputEl: DOM.dietaryOutput, buttonEl: DOM.dietaryBtn });
}

export function fullRecalculateTrigger() {
    document.querySelectorAll('.attempt-row').forEach(row => updateResult(row));
}

export function updateAgeGroupDisplay(getAgeGroupIndex) {
    const age = parseInt(DOM.ageEl.value);
    if (age > 0) {
        DOM.ageGroupDisplayEl.textContent = `Age Group: ${getAgeGroupIndex(age) + 1}`;
    } else {
        DOM.ageGroupDisplayEl.textContent = 'Age Group: --';
    }
}

export function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        DOM.lightIcon.classList.remove('hidden');
        DOM.darkIcon.classList.add('hidden');
    } else {
        document.body.classList.remove('dark-mode');
        DOM.lightIcon.classList.add('hidden');
        DOM.darkIcon.classList.remove('hidden');
    }
}

export function attachEventListeners(getAgeGroupIndex) {
    let attemptCount = 0;
    DOM.addAttemptBtn.addEventListener('click', () => {
        attemptCount++;
        const newRow = createAttemptRow(attemptCount);
        DOM.attemptsContainer.appendChild(newRow);
        DOM.weaknessAnalysisSection.classList.remove('hidden');
        DOM.addAttemptBtnText.textContent = 'Add Another Attempt';
    });

    DOM.clearAllBtn.addEventListener('click', () => {
        DOM.nameEl.value = '';
        DOM.ageEl.value = '';
        DOM.genderEl.value = 'male';
        DOM.workCycleEl.value = 'GRF Officer';
        DOM.medicalFitnessEl.value = 'None';
        DOM.targetGoalEl.value = '';

        DOM.attemptsContainer.innerHTML = '';
        attemptCount = 0;
        DOM.outputSectionEl.classList.add('hidden');
        DOM.weaknessAnalysisSection.classList.add('hidden');
        DOM.weaknessOutput.innerHTML = '';
        DOM.dietaryOutput.innerHTML = '';
        DOM.generationStatusEl.innerHTML = '';
        DOM.addAttemptBtnText.textContent = 'Add First Attempt';
        updateAgeGroupDisplay(getAgeGroupIndex);
    });

    DOM.generatePlanBtn.addEventListener('click', generatePlan);
    DOM.analyzeWeaknessBtn.addEventListener('click', analyzeWeakness);
    DOM.dietaryBtn.addEventListener('click', getDietaryAdvice);
    DOM.exportExcelBtn.addEventListener('click', exportToExcel);

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    DOM.themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    DOM.ageEl.addEventListener('input', () => {
        updateAgeGroupDisplay(getAgeGroupIndex);
        fullRecalculateTrigger();
    });
    DOM.genderEl.addEventListener('change', fullRecalculateTrigger);
}
