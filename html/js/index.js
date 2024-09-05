// Global variables for chart instances
let inpcChart = null;
let usdChart = null;
let ipcChart = null;

// Function to show spinner while data is loading
function showSpinner(chartId) {
    const container = document.getElementById(`${chartId}Container`);
    container.innerHTML = '<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div>';
}

// Function to hide spinner after data is loaded
function hideSpinner(chartId) {
    const container = document.getElementById(`${chartId}Container`);
    container.innerHTML = `<canvas id="${chartId}"></canvas>`;
}

// Function to render a chart using Chart.js
function renderChart(chartId, labels, data, title, lastUpdate, datasetLabel) {
    const canvas = document.getElementById(chartId);

    if (!canvas) {
        console.error(`Canvas with id ${chartId} not found`);
        return; // Stop if the canvas is not found
    }

    const ctx = canvas.getContext('2d');

    // Destroy the existing chart instance if it exists
    if (window[chartId] && typeof window[chartId].destroy === 'function') {
        window[chartId].destroy();
    }

    // Create a new chart instance
    window[chartId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: datasetLabel,
                data: data,
                borderColor: 'rgba(255, 0, 0, 1)', // Red line
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: title,
                    color: 'rgba(0, 0, 0, 1)' // Black title
                },
                subtitle: {
                    display: true,
                    text: 'Última actualización: ' + lastUpdate,
                    color: 'rgba(0, 0, 0, 1)' // Black subtitle
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.2)' // Grid lines
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 1)' // Black labels
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.2)' // Grid lines
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 1)' // Black labels
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Utility function to format date from YYYY-MM-DD to DD%2FMM%2FYYYY
function formatDateForAPI(dateStr) {
    const dateParts = dateStr.split('-');
    return `${dateParts[2]}%2F${dateParts[1]}%2F${dateParts[0]}`;
}

// Function to fetch USD Data
async function fetchUSDData() {
    // Show spinner while fetching data
    showSpinner('usdChart');

    // Get the start and end dates from the input fields
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;

    // If the date inputs are empty, show an alert and stop
    if (!startDateInput || !endDateInput) {
        alert("Por favor selecciona ambas fechas.");
        return;
    }

    // Convert dates to the required format "DD%2FMM%2FYYYY"
    const formattedStartDate = formatDateToUrlParam(startDateInput);
    const formattedEndDate = formatDateToUrlParam(endDateInput);

    try {
        const response = await fetch('http://specmx.net/api/indicators/dof-usd', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: formattedStartDate, endDate: formattedEndDate })
        });

        const data = await response.json();
        const labels = data.map(item => item.fecha);
        const values = data.map(item => parseFloat(item.valor));

        const title = 'Tendencia del Dólar Americano';
        const lastUpdate = labels[labels.length - 1];

        // Update UI with the latest USD value
        if (document.getElementById('latestUSDPrice')) {
            document.getElementById('latestUSDPrice').innerText = values[values.length - 1];
        }
        if (document.getElementById('usdLastUpdated')) {
            document.getElementById('usdLastUpdated').innerText = lastUpdate;
        }

        // Render USD chart
        hideSpinner('usdChart');
        renderChart('usdChart', labels, values, title, lastUpdate, 'USD');
    } catch (error) {
        console.error('Error fetching USD data: ', error);
    }
}

// Utility function to format date to "DD%2FMM%2FYYYY"
function formatDateToUrlParam(dateStr) {
    const dateParts = dateStr.split('-'); // YYYY-MM-DD format
    return `${dateParts[2]}%2F${dateParts[1]}%2F${dateParts[0]}`; // Convert to DD%2FMM%2FYYYY
}

// Function to fetch INPC Data
async function fetchINPCData() {
    // Show spinner while fetching data
    showSpinner('inpcChart');

    try {
        const response = await fetch('http://specmx.net/api/indicators/inpc');
        const data = await response.json();

        const labels = data.labels;
        const values = data.values;
        const title = data.title;
        const lastUpdate = data.lastUpdate;

        // Update UI with the latest INPC value
        if (document.getElementById('latestINPCValue')) {
            document.getElementById('latestINPCValue').innerText = values[values.length - 1];
        }
        if (document.getElementById('inpcLastUpdated')) {
            document.getElementById('inpcLastUpdated').innerText = lastUpdate;
        }

        // Render INPC chart
        hideSpinner('inpcChart');
        renderChart('inpcChart', labels, values, title, lastUpdate, 'INPC');
    } catch (error) {
        console.error('Error fetching INPC data: ', error);
    }
}

// Function to fetch IPC Data
async function fetchIPCData() {
    try {
        const response = await fetch('http://specmx.net/api/indicators/ipc');
        const ipcData = await response.json();

        if (ipcData) {
            document.getElementById('ipcIndex').innerText = ipcData.valorAcomulado;
            document.getElementById('ipcVariation').innerText = ipcData.variacionPorcentual + '%';
            document.getElementById('ipcVolume').innerText = ipcData.volumenOperado;
            document.getElementById('ipcUpdateTime').innerText = ipcData.hora;
        }
    } catch (error) {
        console.error('Error fetching IPC data: ', error);
    }
}

// Event listener to fetch data when the page is loaded
document.addEventListener('DOMContentLoaded', function () {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    // Set default date values (startDate = today - 1 month, endDate = today)
    const today = new Date();
    const lastMonth = new Date(today.setMonth(today.getMonth() - 1));

    startDateInput.value = lastMonth.toISOString().split('T')[0];
    endDateInput.value = new Date().toISOString().split('T')[0];

    // Add event listeners to the date inputs to fetch data when dates are selected
    startDateInput.addEventListener('change', fetchUSDData);
    endDateInput.addEventListener('change', fetchUSDData);

    // Fetch initial data
    fetchINPCData();
    fetchUSDData();
    fetchIPCData();
});
