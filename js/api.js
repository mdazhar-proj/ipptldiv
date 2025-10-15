// API helpers: Gemini call and markdown-to-html converter
export function simpleMarkdownToHtml(md) {
    return md
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
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

export async function callGemini({ apiKey, prompt, outputEl = null, buttonEl = null, loadingMessages = [] } = {}) {
    if (!apiKey) {
        const target = outputEl || document.getElementById('generation-status');
        if (target) target.innerHTML = `<span class="text-red-500 font-semibold">Please enter your Google AI API Key to proceed.</span>`;
        return null;
    }

    let messageInterval;
    if (buttonEl) {
        buttonEl.disabled = true;
        buttonEl.classList.add('opacity-50', 'cursor-not-allowed');
    }

    if (loadingMessages.length > 0 && outputEl) {
        let messageIndex = 0;
        const updateMessage = () => {
            outputEl.innerHTML = `<div class="flex flex-col justify-center items-center"><div class="loader"></div><p class="mt-2 text-sky-600">${loadingMessages[messageIndex]}</p></div>`;
            messageIndex = (messageIndex + 1) % loadingMessages.length;
        };
        updateMessage();
        messageInterval = setInterval(updateMessage, 2500);
    } else if (outputEl) {
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

        if (outputEl) outputEl.innerHTML = simpleMarkdownToHtml(text);
        return text;

    } catch (error) {
        console.error('Gemini API Error:', error);
        if (outputEl) outputEl.innerHTML = `<span class="text-red-500 font-semibold">Error: ${error.message}</span>`;
        return null;
    } finally {
        if (messageInterval) clearInterval(messageInterval);
        if (buttonEl) {
            buttonEl.disabled = false;
            buttonEl.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
}
