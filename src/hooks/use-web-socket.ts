import { useEffect, useState } from "react";

export function useWebSocket() {
  const [logs, setLogs] = useState<string[]>([]);
  const wsUrl = import.meta.env.VITE_WS_URL || "wss://trip-finder-app.onrender.com";

  useEffect(() => {
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = event.data;
      // if Blob => read as text
      if (data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          setLogs((prev) => [...prev, reader.result as string]);
        };
        reader.readAsText(data);
      } else {
        setLogs((prev) => [...prev, data]);
      }
    };

    socket.onopen = () => {
      console.log("✅ WebSocket Connected!");
      // socket.send(JSON.stringify({ message: "Všetko OK", status: 200 }));
    };

    return () => {
      socket.close();
    };
  }, [wsUrl]);

  return logs;
}

export default useWebSocket;
