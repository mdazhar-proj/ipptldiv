// Data Management Module
// Contains all data collection and export functions

export class DataManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
    }

    getOfficerData() {
        const officerData = {
            name: this.uiManager.nameEl.value,
            age: this.uiManager.ageEl.value,
            gender: this.uiManager.genderEl.value,
            workCycle: this.uiManager.workCycleEl.value,
            medicalStatus: this.uiManager.medicalFitnessEl.value,
            targetGoal: this.uiManager.targetGoalEl.value,
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

    exportToExcel() {
        const officerData = this.getOfficerData();
        if (officerData.attempts.length === 0) {
            return;
        }

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

    validateOfficerData() {
        const officerData = this.getOfficerData();
        
        if (!officerData.name || !officerData.age || !officerData.medicalStatus || !officerData.targetGoal) {
            return { valid: false, message: "Please fill in all details including Name, Age, Target Goal, and Medical Status." };
        }
        
        if (parseInt(officerData.age) <= 0) {
            return { valid: false, message: "Please enter a valid age." };
        }
        
        if (officerData.attempts.length === 0) {
            return { valid: false, message: "Please add at least one IPPT attempt." };
        }
        
        return { valid: true, data: officerData };
    }
}
