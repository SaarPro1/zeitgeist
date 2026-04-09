// ✅ WARTET BIS SEITE GELADEN IST
document.addEventListener("DOMContentLoaded", () => {

    const tbody = document.getElementById('timesheet-body');
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
    let rowsHtml = '';

    // ✅ Tabellenzeilen generieren
    days.forEach(day => {
        rowsHtml += `
            <tr class="time-row">
                <td><strong>${day}</strong></td>
                <td><input type="date" class="date"></td>
                <td>
                    <input type="time" class="time-start" style="width: 45%;">
                    <input type="time" class="time-end" style="width: 45%;">
                </td>
                <td><input type="number" class="pause" min="0" placeholder="0"></td>
                <td><input type="text" class="prod-hours" readonly style="background-color: #eee;"></td>
                <td class="center"><input type="checkbox" class="cb1"></td>
                <td class="center"><input type="checkbox" class="cb2"></td>
                <td class="center"><input type="checkbox" class="cb3"></td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHtml;

    // ✅ Event‑Listener anhängen
    updateEvents();

    // ✅ Daten aus localStorage laden
    loadData();

    // ✅ Zeiten neu berechnen
    calculateTimes();
});


// ✅ Event Listener für ALLE Inputs
function updateEvents() {
    const inputs = document.querySelectorAll(
        '.date, .time-start, .time-end, .pause, .cb1, .cb2, .cb3'
    );

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            calculateTimes();
            saveData();
        });
    });
}


// ✅ Zeiten berechnen
function calculateTimes() {
    let totalDecHours = 0;
    const rows = document.querySelectorAll('.time-row');

    rows.forEach(row => {
        const startInput = row.querySelector('.time-start').value;
        const endInput = row.querySelector('.time-end').value;
        const pauseInput = row.querySelector('.pause').value;
        const prodOutput = row.querySelector('.prod-hours');

        if (startInput && endInput) {
            const startTime = new Date(`1970-01-01T${startInput}:00`);
            let endTime = new Date(`1970-01-01T${endInput}:00`);

            if (endTime < startTime) endTime.setDate(endTime.getDate() + 1);

            let diffMins = (endTime - startTime) / (1000 * 60);
            diffMins -= pauseInput ? parseInt(pauseInput) : 0;

            if (diffMins > 0) {
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

    document.getElementById('total-hours').value =
        totalDecHours > 0 ? totalDecHours.toFixed(2) : "";
}


// ✅ ALLES LÖSCHEN
function clearAll() {
    if (!confirm("Wirklich alle Daten löschen?")) return;

    localStorage.removeItem("timesheetData");

    const rows = document.querySelectorAll(".time-row");
    rows.forEach(row => {
        row.querySelector('.date').value = "";
        row.querySelector('.time-start').value = "";
        row.querySelector('.time-end').value = "";
        row.querySelector('.pause').value = "";
        row.querySelector('.prod-hours').value = "";
        row.querySelector('.cb1').checked = false;
        row.querySelector('.cb2').checked = false;
        row.querySelector('.cb3').checked = false;
        row.querySelector('.from-date').value = "";
        row.querySelector('.to-date').value = "";
    });

    document.getElementById('total-hours').value = "";
    alert("Alles gelöscht!");
}


// ✅ CSV EXPORT
function exportCSV() {
    const rows = document.querySelectorAll(".time-row");
    let csv = "Tag;Datum;Start;Ende;Pause;Prod.Std;CB1;CB2;CB3\r\n";

    rows.forEach(row => {
        const day = row.querySelector("td strong").innerText;
        const date = row.querySelector(".date").value;
        const start = row.querySelector(".time-start").value;
        const end = row.querySelector(".time-end").value;
        const pause = row.querySelector(".pause").value;
        const prod = row.querySelector(".prod-hours").value;
        const cb1 = row.querySelector(".cb1").checked ? "x" : "";
        const cb2 = row.querySelector(".cb2").checked ? "x" : "";
        const cb3 = row.querySelector(".cb3").checked ? "x" : "";

        csv += `${day};${date};${start};${end};${pause};${prod};${cb1};${cb2};${cb3}\r\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Arbeitszeiten.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
}


// ✅ SPEICHERN IN LOCALSTORAGE
function saveData() {

    // 🔹 Kopfbereich speichern
    const headerData = {
        kunde: document.querySelector('.kunde')?.value || '',
        bereich: document.querySelector('.bereich')?.value || '',
        employee: document.querySelector('.employee')?.value || '',
        fromDate: document.querySelector('.from-date')?.value || '',
        toDate: document.querySelector('.to-date')?.value || ''
    };

    // 🔹 Tabellenzeilen speichern
    const rows = document.querySelectorAll('.time-row');
    let rowData = [];

    rows.forEach(row => {
        rowData.push({
            date: row.querySelector('.date').value,
            start: row.querySelector('.time-start').value,
            end: row.querySelector('.time-end').value,
            pause: row.querySelector('.pause').value,
            cb1: row.querySelector('.cb1').checked,
            cb2: row.querySelector('.cb2').checked,
            cb3: row.querySelector('.cb3').checked
        });
    });

    // 🔹 Alles zusammen speichern
    localStorage.setItem("timesheetData", JSON.stringify({
        header: headerData,
        rows: rowData
    }));
}

// ✅ LADEN AUS LOCALSTORAGE
function loadData() {
    const saved = localStorage.getItem("timesheetData");
    if (!saved) return;

    const data = JSON.parse(saved);

    // 🔹 Kopfbereich laden
    if (data.header) {
        document.querySelector('.kunde').value = data.header.kunde || '';
        document.querySelector('.bereich').value = data.header.bereich || '';
        document.querySelector('.employee').value = data.header.employee || '';
        document.querySelector('.from-date').value = data.header.fromDate || '';
        document.querySelector('.to-date').value = data.header.toDate || '';
    }

    // 🔹 Tabellenzeilen laden
    const rows = document.querySelectorAll('.time-row');

    data.rows?.forEach((rowData, i) => {
        const row = rows[i];
        if (!row) return;

        row.querySelector('.date').value = rowData.date;
        row.querySelector('.time-start').value = rowData.start;
        row.querySelector('.time-end').value = rowData.end;
        row.querySelector('.pause').value = rowData.pause;
        row.querySelector('.cb1').checked = rowData.cb1;
        row.querySelector('.cb2').checked = rowData.cb2;
        row.querySelector('.cb3').checked = rowData.cb3;
    });
}