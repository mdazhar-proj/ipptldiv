// API Client Module
// Contains all API communication functions

export class APIClient {
    constructor(apiKeyElement) {
        this.apiKeyElement = apiKeyElement;
    }

    async callGemini(prompt, outputEl, buttonEl, loadingMessages = []) {
        const apiKey = this.apiKeyElement.value;
        if (!apiKey) {
            const target = buttonEl.id === 'generate-plan-btn' ? 
                document.getElementById('generation-status') : outputEl;
            target.innerHTML = `<span class="text-red-500 font-semibold">Please enter your Google AI API Key to proceed.</span>`;
            this.apiKeyElement.focus();
            return null;
        }
        
        let messageInterval;
        if (buttonEl) {
            buttonEl.disabled = true;
            buttonEl.classList.add('opacity-50', 'cursor-not-allowed');
        }
        
        if (loadingMessages.length > 0) {
            let messageIndex = 0;
            const updateMessage = () => {
                outputEl.innerHTML = `<div class="flex flex-col justify-center items-center"><div class="loader"></div><p class="mt-2 text-sky-600">${loadingMessages[messageIndex]}</p></div>`;
                messageIndex = (messageIndex + 1) % loadingMessages.length;
            };
            updateMessage();
            messageInterval = setInterval(updateMessage, 2500);
        } else {
            outputEl.innerHTML = '<div class="flex justify-center items-center"><div class="loader"></div></div>';
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.error?.message || `API Error: ${response.status}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('No content received from AI.');

            return text;

        } catch (error) {
            console.error("Gemini API Error:", error);
            outputEl.innerHTML = `<span class="text-red-500 font-semibold">Error: ${error.message}</span>`;
            return null;
        } finally {
            if(messageInterval) clearInterval(messageInterval);
            if (buttonEl) {
                buttonEl.disabled = false;
                buttonEl.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }

    async generateTrainingPlan(officerData, outputEl, buttonEl) {
        const prompt = `You are a super motivating and friendly fitness buddy! 💪 Your goal is to create a simple and fun 4-week IPPT training plan for an officer. Use simple language and lots of encouraging emoticons (like 👍, 🎉, 🔥). Make the plan easy to understand and follow.
            
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

        return await this.callGemini(prompt, outputEl, buttonEl, loadingMessages);
    }

    async analyzeWeakness(officerData, outputEl, buttonEl) {
        const prompt = `You are a friendly and encouraging fitness buddy! 🤸‍♂️ Analyze the following IPPT results for an officer named ${officerData.name}. In simple terms, point out their weakest station based on the points. Use emoticons to make your one-paragraph explanation fun and motivating.
        
        Results:
        ${officerData.attempts.map(att => `- Push-ups: ${att.pushups}, Sit-ups: ${att.situps}, 2.4km Run: ${att.runTime} (Result: ${att.result})`).join('\n')}
        
        Keep the analysis concise and encouraging.`;

        return await this.callGemini(prompt, outputEl, buttonEl);
    }

    async getDietaryAdvice(officerData, outputEl, buttonEl) {
        const prompt = `You are a friendly food coach! 🥑 Your goal is to give 5 simple and easy-to-follow dietary tips for an officer in Singapore who wants to improve their IPPT score. Use simple words and fun emoticons (like 🍎, 🥦, 💧). Make the advice practical and mention some yummy local food choices.
        
        Officer's Details:
        - Age: ${officerData.age}
        
        Generate 5 simple, actionable dietary tips to support their training. Do not create a full meal plan. Format as a bulleted list using Markdown.`;

        return await this.callGemini(prompt, outputEl, buttonEl);
    }
}
