import express from "express";
import { WebSocketServer } from "ws";

const app = express();
const PORT = 3000;

// HTTP server
app.get("/", (req, res) => {
  res.send("Aura Realtime Collaboration Server Running");
});

const server = app.listen(PORT, () => {
  console.log(`Aura server running on port ${PORT}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });

let rooms = {}; // { roomId: { clients: [], data: "" } }

wss.on("connection", ws => {
  ws.on("message", msg => {
    const data = JSON.parse(msg);

    if (data.type === "join") {
      const { roomId } = data;

      if (!rooms[roomId]) rooms[roomId] = { clients: [], data: "" };

      rooms[roomId].clients.push(ws);

      // Send current project
      ws.send(JSON.stringify({ type: "project", data: rooms[roomId].data }));
    }

    if (data.type === "update") {
      const { roomId, patch } = data;
      rooms[roomId].data = patch;

      // Broadcast update
      rooms[roomId].clients.forEach(client => {
        if (client !== ws)
          client.send(JSON.stringify({ type: "update", patch }));
      });
    }
  });
});
