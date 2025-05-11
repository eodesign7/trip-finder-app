import { WebSocket } from "ws";

export const clients: Set<WebSocket> = new Set();

export function logToAllClients(message: string) {
  // Logni správu aj do backend konzoly
  console.log(message);

  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}
