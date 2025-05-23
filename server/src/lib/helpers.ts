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

// Helper na jednoduché websocket logovanie s jednotným formátom
export function logStep(
  message: string,
  status: number = 200,
  extra?: Record<string, unknown>
) {
  logToAllClients(
    JSON.stringify({
      status,
      message,
      time: new Date().toISOString(),
      ...extra,
    })
  );
}
