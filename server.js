const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();

// Initialize a simple http server
const server = http.createServer(app);

// Initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', (ws) => {
  // Add new client to the clients list
  clients.push(ws);

  // Broadcast a message to all connected clients except the sender
  ws.on('message', (message) => {
    const { totalMeronBet, totalWalaBet, plasadaRate } = JSON.parse(message);
    
    const commission = (parseFloat(totalMeronBet) + parseFloat(totalWalaBet)) * parseFloat(plasadaRate);
    const net = parseFloat(totalMeronBet) + parseFloat(totalWalaBet) - parseFloat(commission);
    const meronOdds = net * (100 / parseFloat(totalMeronBet));
    const walaOdds = net * (100 / parseFloat(totalWalaBet));

    const data = {
      commission,
      meronOdds,
      walaOdds,
      totalMeronBet,
      totalWalaBet
    };
    console.log(data)
    // Broadcast to all connected clients
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ data, type: 'oddsData' }));
      }
    });
  });

  // Handle client disconnection
  ws.on('close', () => {
    clients = clients.filter((client) => client !== ws);
  });
});

// Start server
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
