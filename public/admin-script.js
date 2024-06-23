let deathCountersDiv = document.getElementById('death-counters');
let socket = new WebSocket('ws://NODE-1.hostingnest.de:25597/');

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
            <div class="count">${person.deaths}</div>
            <button onclick="updateDeaths('${person.name}', 1)">+</button>
            <button onclick="updateDeaths('${person.name}', -1)">-</button>
            <button onclick="removePerson('${person.name}')">Entfernen</button>
        `;
        deathCountersDiv.appendChild(div);
    });
}

function updateDeaths(name, increment) {
    fetch('/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, increment })
    });
}

function removePerson(name) {
    fetch('/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
}

function addPerson() {
    const name = document.getElementById('person-name').value;
    fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
}

function logout() {
    fetch('/logout', { method: 'POST' })
        .then(() => window.location.href = '/login.html');
}

let isAdmin = false;
fetch('/isAdmin')
    .then(response => response.json())
    .then(data => {
        isAdmin = data.isAdmin;
        if (isAdmin) {
            document.getElementById('admin-panel').style.display = 'block';
        }
    });
