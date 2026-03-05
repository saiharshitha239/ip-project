let usageData = [];
let alertData = [];
let pricePerLiter = 0.05;

function validateLogin(event) {

    event.preventDefault();

    let username = document.getElementById("username")?.value.trim();
    let password = document.getElementById("password")?.value.trim();
    let errorBox = document.getElementById("loginError");

    if (!username || !password) {
        if (errorBox) errorBox.innerText = "⚠ Please fill all fields.";
        return false;
    }

    if (password.length < 6) {
        if (errorBox) errorBox.innerText = "⚠ Password must be at least 6 characters.";
        return false;
    }

    if (username === "admin" && password === "admin123") {
        window.location.href = "dashboard.html";
    } else {
        if (errorBox) errorBox.innerText = "❌ Unauthorized Access!";
        createAlert("Unauthorized login attempt detected.");
    }

    return false;
}

function addUsageEntry(litres, zone = "Main Tank") {

    let timestamp = new Date().toLocaleString();
    let status = getStatus(litres);

    let entry = {
        time: timestamp,
        zone: zone,
        litres: litres,
        status: status.class
    };

    usageData.push(entry);

    if (status.class === "high")
        createAlert("⚠ High water usage detected.");

    if (status.class === "critical")
        createAlert("🚨 Critical water spike detected!");

    updateDashboard();
    updateUsageLogs();
    updateBilling();
}

function getStatus(litres) {

    if (litres < 500) {
        return { class: "normal", text: "Normal" };
    } 
    else if (litres < 800) {
        return { class: "high", text: "High" };
    } 
    else {
        return { class: "critical", text: "Critical" };
    }
}

function addManualUsage() {

    let input = document.getElementById("manualUsage");
    if (!input) return;

    let value = parseFloat(input.value);

    if (isNaN(value) || value <= 0) {
        alert("⚠ Enter valid water usage value.");
        return;
    }

    addUsageEntry(value);
    input.value = "";
}

function simulateSensor() {

    let randomUsage = Math.floor(Math.random() * 1000) + 100;
    let zones = ["Floor 1", "Floor 2", "Floor 3"];

    let randomZone = zones[Math.floor(Math.random() * zones.length)];

    addUsageEntry(randomUsage, randomZone);
}

setInterval(simulateSensor, 8000);

function updateDashboard() {

    let total = usageData.reduce((sum, item) => sum + item.litres, 0);
    let latest = usageData.length > 0 
        ? usageData[usageData.length - 1].litres 
        : 0;

    if (document.getElementById("totalUsage"))
        document.getElementById("totalUsage").innerText = total + " L";

    if (document.getElementById("latestUsage"))
        document.getElementById("latestUsage").innerText = latest + " L";
}

function updateUsageLogs() {

    let tableBody = document.getElementById("usageTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    usageData.forEach(entry => {

        let statusText = getStatus(entry.litres).text;

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${entry.time}</td>
            <td>${entry.zone}</td>
            <td>${entry.litres} L</td>
            <td>
                <span class="badge ${entry.status}">
                    ${statusText}
                </span>
            </td>
        `;

        tableBody.appendChild(row);
    });

    updateSummary();
}

function filterLogs() {

    let input = document.getElementById("searchInput")?.value.toLowerCase();
    let rows = document.querySelectorAll("#usageTableBody tr");

    rows.forEach(row => {

        let zone = row.cells[1].textContent.toLowerCase();

        if (zone.includes(input)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

function updateSummary() {

    let summary = document.getElementById("summarySection");
    if (!summary) return;

    let total = usageData.reduce((sum, item) => sum + item.litres, 0);
    let highCount = usageData.filter(u => u.status === "high").length;
    let criticalCount = usageData.filter(u => u.status === "critical").length;

    summary.innerHTML = `
        <h3>Total Usage: ${total} Litres</h3>
        <p>High Usage Entries: ${highCount}</p>
        <p>Critical Usage Entries: ${criticalCount}</p>
    `;

    showCriticalAlert(criticalCount);
}

function createAlert(message) {
    alertData.push(message);
    updateAlerts();
}

function updateAlerts() {

    let alertBox = document.getElementById("alertContainer");
    if (!alertBox) return;

    alertBox.innerHTML = "";

    alertData.slice(-5).forEach(alert => {

        let div = document.createElement("div");
        div.className = "alert-item";
        div.innerText = alert;
        alertBox.appendChild(div);
    });
}

function showCriticalAlert(count) {

    if (count > 0) {
        createAlert("🚨 Critical water usage detected in building!");
    }
}

function updateBilling() {

    let billElement = document.getElementById("totalBill");
    if (!billElement) return;

    let total = usageData.reduce((sum, item) => sum + item.litres, 0);
    let billAmount = total * pricePerLiter;

    billElement.innerText = "₹ " + billAmount.toFixed(2);
}

document.addEventListener("DOMContentLoaded", () => {
    updateDashboard();
    updateUsageLogs();
    updateBilling();
});
