// Main Application Module
// Coordinates all modules and handles the main application logic

import { UIManager } from './ui-manager.js';
import { APIClient } from './api-client.js';
import { DataManager } from './data-manager.js';
import { simpleMarkdownToHtml } from './utils.js';

export class IPPTApp {
    constructor() {
        // Don't initialize UIManager here - wait for DOM to be ready
        this.uiManager = null;
        this.apiClient = null;
        this.dataManager = null;
    }

    initializeApp() {
        // Create UIManager after DOM is ready
        this.uiManager = new UIManager();
        this.apiClient = new APIClient(this.uiManager.apiKeyEl);
        this.dataManager = new DataManager(this.uiManager);
        
        // Attach event listeners for main functionality
        if (this.uiManager.generatePlanBtn) {
            this.uiManager.generatePlanBtn.addEventListener('click', () => this.generatePlan());
        }
        if (this.uiManager.analyzeWeaknessBtn) {
            this.uiManager.analyzeWeaknessBtn.addEventListener('click', () => this.analyzeWeakness());
        }
        if (this.uiManager.dietaryBtn) {
            this.uiManager.dietaryBtn.addEventListener('click', () => this.getDietaryAdvice());
        }
        if (this.uiManager.exportExcelBtn) {
            this.uiManager.exportExcelBtn.addEventListener('click', () => this.exportToExcel());
        }
    }

    async generatePlan() {
        const validation = this.dataManager.validateOfficerData();
        if (!validation.valid) {
            this.uiManager.generationStatusEl.innerHTML = `<span class="text-red-500 font-semibold">${validation.message}</span>`;
            return;
        }

        this.uiManager.outputSectionEl.classList.add('hidden');
        this.uiManager.dietaryOutput.classList.add('hidden');

        const planText = await this.apiClient.generateTrainingPlan(
            validation.data, 
            this.uiManager.generationStatusEl, 
            this.uiManager.generatePlanBtn
        );
        
        if (planText) {
            this.uiManager.planOutputEl.innerHTML = simpleMarkdownToHtml(planText);
            this.uiManager.outputSectionEl.classList.remove('hidden');
            this.uiManager.generationStatusEl.innerHTML = '<span class="text-green-500 font-semibold">Your plan is ready! ✅</span>';
        }
    }

    async analyzeWeakness() {
        const officerData = this.dataManager.getOfficerData();
        if (officerData.attempts.length === 0) return;

        await this.apiClient.analyzeWeakness(
            officerData, 
            this.uiManager.weaknessOutput, 
            this.uiManager.analyzeWeaknessBtn
        );
    }

    async getDietaryAdvice() {
        this.uiManager.dietaryOutput.classList.remove('hidden');
        const officerData = this.dataManager.getOfficerData();
        
        const adviceText = await this.apiClient.getDietaryAdvice(
            officerData, 
            this.uiManager.dietaryOutput, 
            this.uiManager.dietaryBtn
        );
        
        if (adviceText) {
            this.uiManager.dietaryOutput.innerHTML = simpleMarkdownToHtml(adviceText);
        }
    }

    exportToExcel() {
        this.dataManager.exportToExcel();
    }
}

// Initialize the application when the DOM is loaded
function initializeApp() {
    try {
        const app = new IPPTApp();
        app.initializeApp(); // Initialize immediately since DOM is ready
        console.log('IPPT App initialized successfully');
    } catch (error) {
        console.error('Error initializing IPPT App:', error);
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already ready
    initializeApp();
}
