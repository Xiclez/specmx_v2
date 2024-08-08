function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (userInput.trim() === '') return;

    // Append user's message to chatbox
    appendMessage('user', userInput);

    // Clear input field
    document.getElementById('userInput').value = '';

    // Simulate bot response
    setTimeout(() => {
        const botResponse = getBotResponse(userInput);
        appendMessage('bot', botResponse);
    }, 1000);
}

function appendMessage(sender, message) {
    const chatboxBody = document.getElementById('chatboxBody');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);
    messageDiv.innerHTML = `<div class="message-content">${message}</div>`;
    chatboxBody.appendChild(messageDiv);
    chatboxBody.scrollTop = chatboxBody.scrollHeight;
}

function getBotResponse(userInput) {
    // Placeholder for bot response logic
    // Replace this with actual bot integration
    return 'Este es un mensaje de respuesta automática de SPEC-IA.';
}
// JavaScript para manejar el cambio de contenido basado en el dropdown
document.addEventListener('DOMContentLoaded', function() {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const indicadorContent = document.getElementById('indicadorContent');
    const indicadorItems = document.querySelectorAll('.indicador-item');

    dropdownItems.forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            const indicador = event.target.getAttribute('data-indicador');

            indicadorItems.forEach(content => {
                if (content.id === indicador) {
                    content.style.display = 'block';
                } else {
                    content.style.display = 'none';
                }
            });
        });
    });
});


$(document).ready(function(){
    $('.carousel-track').slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 0,
        speed: 3000,
        cssEase: 'linear',
        infinite: true,
        pauseOnHover: false,
        pauseOnFocus: false,
        arrows: false
    });
});

// Definir variables globales para las instancias de los gráficos
let inpcChartInstance;
let usdChartInstance;
let salaryChartInstance;

// JavaScript para mostrar un header aleatorio cada vez que se carga la página
document.addEventListener("DOMContentLoaded", function() {
    var headers = document.querySelectorAll('.random-header');
    var randomIndex = Math.floor(Math.random() * headers.length);
    headers[randomIndex].style.display = 'block';
});

// Funciones de cookies
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cname) == 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return "";
}

function renderChart(chartId, labels, data, title, lastUpdate, datasetLabel) {
    const ctx = document.getElementById(chartId).getContext('2d');

    // Destruir la instancia existente del gráfico si existe
    if (chartId === 'inpcChart' && inpcChartInstance) {
        inpcChartInstance.destroy();
    }
    if (chartId === 'usdChart' && usdChartInstance) {
        usdChartInstance.destroy();
    }

    const chartInstance = new Chart(ctx, {
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
                    color: 'rgba(0, 0, 0, 1)' // White title
                },
                subtitle: {
                    display: true,
                    text: 'Última actualización: ' + lastUpdate,
                    color: 'rgba(0, 0, 0, 1)' // White subtitle
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy'
                    },
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.2)' // White grid lines
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 1)' // White labels
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.2)' // White grid lines
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 1)' // White labels
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });

    if (chartId === 'inpcChart') {
        inpcChartInstance = chartInstance;
    }
    if (chartId === 'usdChart') {
        usdChartInstance = chartInstance;
    }
}



// Ajustar el tamaño del gráfico de forma reactiva
window.addEventListener('resize', () => {
    if (inpcChartInstance) inpcChartInstance.resize();
    if (usdChartInstance) usdChartInstance.resize();
    if (salaryChartInstance) salaryChartInstance.resize();
});

// Funciones de obtención y actualización de datos
async function fetchINPCData() {
    const inpcData = getCookie("inpcData");
    const inpcLastUpdated = getCookie("inpcLastUpdated");

    if (inpcData && inpcLastUpdated) {
        const data = JSON.parse(inpcData);
        if (document.getElementById('latestINPCValue')) {
            document.getElementById('latestINPCValue').innerText = data.value;
        }
        if (document.getElementById('inpcLastUpdated')) {
            document.getElementById('inpcLastUpdated').innerText = inpcLastUpdated;
        }
        renderChart('inpcChart', data.labels, data.values, "INPC", inpcLastUpdated, 'INPC');
    } else {
        updateINPCData();
    }
}

async function updateINPCData() {
    try {
        const response = await fetch('https://www.inegi.org.mx/app/tabulados/serviciocuadros/wsDataService.svc/listaindicador/583731/false/0700/es/json/2023/2024');
        const data = await response.json();

        const serie = data[0].Data[0].Serie.Obs;
        const metaData = data[0].Data[0].MetaData;

        const values = serie.map(obs => parseFloat(obs.CurrentValue));
        const labels = serie.map(obs => obs.TimePeriod);

        const title = metaData.Name;
        const lastUpdate = metaData.LastUpdate;

        if (document.getElementById('latestINPCValue')) {
            document.getElementById('latestINPCValue').innerText = values[values.length - 1];
        }
        if (document.getElementById('inpcLastUpdated')) {
            document.getElementById('inpcLastUpdated').innerText = lastUpdate;
        }

        setCookie("inpcData", JSON.stringify({ value: values[values.length - 1], labels, values }), 1);
        setCookie("inpcLastUpdated", lastUpdate, 1);

        renderChart('inpcChart', labels, values, title, lastUpdate, 'INPC');
    } catch (error) {
        console.error('Error fetching INPC data: ', error);
    }
}

async function fetchUSDData() {
    const usdData = getCookie("usdData");
    const usdLastUpdated = getCookie("usdLastUpdated");

    if (usdData && usdLastUpdated) {
        const data = JSON.parse(usdData);
        if (document.getElementById('latestUSDPrice')) {
            document.getElementById('latestUSDPrice').innerText = data.value;
        }
        if (document.getElementById('usdLastUpdated')) {
            document.getElementById('usdLastUpdated').innerText = usdLastUpdated;
        }
        renderChart('usdChart', data.labels, data.values, "USD", usdLastUpdated, 'USD');
    } else {
        updateUSDData();
    }
}

async function updateUSDData() {
    try {
        const response = await fetch('https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=USD&to_symbol=MXN&apikey=E9XRI6SJ0TWWIX8U');
        const data = await response.json();
        const timeSeries = data['Time Series FX (Daily)'];
        const labels = Object.keys(timeSeries).reverse();
        const values = labels.map(label => parseFloat(timeSeries[label]['4. close']));

        const title = 'Tendencia del Dólar Americano';
        const lastUpdate = labels[labels.length - 1];

        if (document.getElementById('latestUSDPrice')) {
            document.getElementById('latestUSDPrice').innerText = values[values.length - 1];
        }
        if (document.getElementById('usdLastUpdated')) {
            document.getElementById('usdLastUpdated').innerText = lastUpdate;
        }

        setCookie("usdData", JSON.stringify({ value: values[values.length - 1], labels, values }), 1);
        setCookie("usdLastUpdated", lastUpdate, 1);

        renderChart('usdChart', labels, values, title, lastUpdate, 'USD');
    } catch (error) {
        console.error('Error fetching USD data: ', error);
    }
}

async function fetchDOFUSDData() {
    const today = new Date().toISOString().split('T')[0].split('-').reverse().join('/');
    try {
        const response = await fetch(`http://localhost:3001/api/dof-usd`);
   

            if (document.getElementById('latestUSDPrice')) {
                document.getElementById('latestUSDPrice').innerText = valor;
            }
      
    } catch (error) {
        console.error('Error fetching USD data from DOF: ', error);
    }
}


async function fetchIPCData() {
    const targetUrl = 'http://idosfinance.xyz/api/ipc';

    try {
        const response = await fetch(targetUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const ipcData = await response.json();

        if (ipcData) {
            if (document.getElementById('ipcIndex')) {
                document.getElementById('ipcIndex').innerText = ipcData.valorAcomulado;
            }
            if (document.getElementById('ipcVariation')) {
                document.getElementById('ipcVariation').innerText = ipcData.variacionPorcentual + '%';
            }
            if (document.getElementById('ipcVolume')) {
                document.getElementById('ipcVolume').innerText = ipcData.volumenOperado;
            }
            if (document.getElementById('ipcUpdateTime')) {
                document.getElementById('ipcUpdateTime').innerText = ipcData.hora;
            }
        }
    } catch (error) {
        console.error('Error fetching IPC data: ', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchINPCData();
    fetchUSDData();
    fetchDOFUSDData();
    fetchIPCData();
});
