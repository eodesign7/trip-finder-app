import { useEffect, useState } from "react";

export function useWebSocket() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");

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
  }, []);

  return logs;
}

export default useWebSocket;
