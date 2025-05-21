// cSpell:disable
import "../config/env";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { clients } from "./lib/helpers";
import tripRoutes from "./routes/trip.routes";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("OK");
});

app.use(tripRoutes);

const server = app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.send("⚙️SERVER: Welcome! You are now connected to the WebSocket server.");

  ws.on("close", () => {
    clients.delete(ws);
    console.log("WebSocket client disconnected");
  });

  ws.on("message", (message) => {
    console.log("Message from client:", message.toString());
    ws.send(`🧑‍💻CLIENT: Received your message: ${message}`);
  });
});
