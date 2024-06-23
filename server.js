const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

let deaths = JSON.parse(fs.readFileSync('deaths.json', 'utf8'));
let users = JSON.parse(fs.readFileSync('users.json', 'utf8'));

wss.on('connection', ws => {
    ws.send(JSON.stringify(deaths));
});


app.post('/update', (req, res) => {
    const { name, increment } = req.body;
    const person = deaths.find(d => d.name === name);
    if (person) {
        person.deaths += increment;
        broadcast();
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

app.post('/add', (req, res) => {
    const { name } = req.body;
    if (!deaths.find(d => d.name === name)) {
        deaths.push({ name, deaths: 0 });
        broadcast();
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
});

app.post('/remove', (req, res) => {
    const { name } = req.body;
    deaths = deaths.filter(d => d.name !== name);
    broadcast();
    res.sendStatus(200);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = user;
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
});

app.get('/isAdmin', (req, res) => {
    res.json({ isAdmin: !!req.session.user });
});

// Middleware, um den Zugriff auf Admin-Seiten zu kontrollieren
function requireLogin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        next(); // Weiter zur nächsten Middleware oder zum nächsten Handler
    } else {
        res.redirect('/login.html'); // Benutzer nicht authentifiziert, zur Login-Seite weiterleiten
    }
}

// Admin-Seite nur zugänglich machen, wenn der Benutzer authentifiziert ist
app.get('/admin.html', requireLogin, (req, res) => {
    res.sendFile(__dirname + '/public/admin.html');
});

function broadcast() {
    fs.writeFileSync('deaths.json', JSON.stringify(deaths, null, 2));
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(deaths));
        }
    });
}

const PORT = process.env.PORT || 25597;
server.listen(PORT, () => {
    console.log(`Server läuft auf localhost:${PORT}`);
});
