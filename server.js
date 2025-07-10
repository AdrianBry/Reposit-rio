// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

let latestData = {};

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Pasta onde você colocará seu HTML, CSS, JS

// SSE
let clients = [];
app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();
  clients.push(res);

  res.write(`data: ${JSON.stringify(latestData)}\n\n`);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// Recebe dados do ESP32
app.post('/data', (req, res) => {
  latestData = req.body;
  clients.forEach(c => c.write(`data: ${JSON.stringify(latestData)}\n\n`));
  res.status(200).send('OK');
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
