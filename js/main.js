import * as Charts from './charts.js';
import * as UI from './ui.js';

// Initialize listeners and expose some helpers for debugging
document.addEventListener('DOMContentLoaded', () => {
    UI.initDOM();
    UI.attachEventListeners(Charts.getAgeGroupIndex);
    // expose for console debugging
    window.__IPPT = { charts: Charts, ui: UI };
});
