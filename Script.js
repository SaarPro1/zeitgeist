// Wartet, bis die HTML-Seite vollständig geladen ist 
document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById('timesheet-body');
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', ];
    let rowsHtml = '';

    // Wochentage generieren
    days.forEach(day => {
        rowsHtml += `
            <tr class="time-row">
                <td><strong>${day}</strong></td>
                <td><input type="date"></td>
                <td>
                    <input type="time" class="time-start" style="width: 45%;">
                    <input type="time" class="time-end" style="width: 45%;">
                </td>
                <td><input type="number" class="pause" min="0" placeholder="0"></td>
                <td><input type="text" class="prod-hours" readonly style="background-color: #eee;"></td>
                <td class="center"><input type="checkbox"></td>
                <td class="center"><input type="checkbox"></td>
                <td class="center"><input type="checkbox"></td>
            </tr>
        `;
    });
    
    // Generierte Zeilen in die Tabelle einfügen
    tbody.innerHTML = rowsHtml;

    // Event-Listener an alle neuen Eingabefelder anhängen
    const inputs = document.querySelectorAll('.time-start, .time-end, .pause');
    inputs.forEach(input => {
        input.addEventListener('input', calculateTimes);
    });
});

// Funktion zur Berechnung der Zeiten
function calculateTimes() {
    let totalDecHours = 0;
    const rows = document.querySelectorAll('.time-row');

    rows.forEach(row => {
        const startInput = row.querySelector('.time-start').value;
        const endInput = row.querySelector('.time-end').value;
        const pauseInput = row.querySelector('.pause').value;
        const prodOutput = row.querySelector('.prod-hours');

        if (startInput && endInput) {
            // Erstelle ein fixes Datumsobjekt für die Berechnung
            const startTime = new Date(`1970-01-01T${startInput}:00`);
            let endTime = new Date(`1970-01-01T${endInput}:00`);

            // Falls über Mitternacht gearbeitet wurde
            if (endTime < startTime) {
                endTime.setDate(endTime.getDate() + 1);
            }

            // Differenz berechnen
            let diffMs = endTime - startTime;
            let diffMins = diffMs / (1000 * 60);

            // Pause abziehen
            const pauseMins = pauseInput ? parseInt(pauseInput) : 0;
            diffMins -= pauseMins;

            if (diffMins > 0) {
                // In Dezimalstunden umwandeln
                let hours = diffMins / 60;
                prodOutput.value = hours.toFixed(2);
                totalDecHours += hours;
            } else {
                prodOutput.value = "";
            }
        } else {
            prodOutput.value = "";
        }
    });

    // Gesamtsumme aktualisieren
    document.getElementById('total-hours').value = totalDecHours > 0 ? totalDecHours.toFixed(2) : "";
}

