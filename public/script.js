let deathCountersDiv = document.getElementById('death-counters');
let socket = new WebSocket('ws://localhost:25597/');

socket.onmessage = function(event) {
    let data = JSON.parse(event.data);
    updateDeathCounters(data);
};

function updateDeathCounters(data) {
    deathCountersDiv.innerHTML = '';
    data.forEach(person => {
        let div = document.createElement('div');
        div.className = 'death-counter';
        div.innerHTML = `
            <h2>${person.name}</h2>
            <h1>💀</h1>
            <div class="count">${person.deaths}</div>
        `;
        deathCountersDiv.appendChild(div);
    });
}
