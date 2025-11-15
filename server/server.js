import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3000;

// room storage: { roomId: { xml, clients:set } }
let rooms = {};

app.get("/", (req, res) => {
  res.send("Aura blocks-only realtime server running.");
});

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    // create a new room
    if (data.type === "create") {
      rooms[data.roomId] = { xml: "", clients: new Set() };
      ws.send(JSON.stringify({ type: "created", roomId: data.roomId }));
      return;
    }

    // join a room
    if (data.type === "join") {
      const room = rooms[data.roomId];
      if (!room) {
        ws.send(JSON.stringify({ type: "error", error: "no-room" }));
        return;
      }

      room.clients.add(ws);

      // send current xml to that client
      ws.send(JSON.stringify({ type: "sync", xml: room.xml }));
      return;
    }

    // update xml
    if (data.type === "update") {
      const room = rooms[data.roomId];
      if (!room) return;

      room.xml = data.xml;

      // broadcast to everyone except sender
      for (const client of room.clients) {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify({ type: "update", xml: data.xml }));
        }
      }
    }
  });
});

server.listen(PORT, () =>
  console.log(`Aura server running on http://localhost:${PORT}`)
);
