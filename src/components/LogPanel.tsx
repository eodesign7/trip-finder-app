import { useEffect, useRef, useState } from "react";

function parseLog(log: string) {
  try {
    const entry = JSON.parse(log);
    return {
      time: entry.time || "",
      status: entry.status || "",
      message: entry.message || "",
      duration: entry.duration || "",
    };
  } catch {
    return { time: "", status: "", message: log, duration: "" };
  }
}

export default function LogPanel() {
  const [logs, setLogs] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const wsUrl = import.meta.env.VITE_WS_URL || "wss://trip-finder-app.onrender.com";

  useEffect(() => {
    ws.current = new WebSocket(wsUrl);
    ws.current.onmessage = (event) => {
      setLogs((prev) => [...prev, event.data]);
    };
    return () => {
      ws.current?.close();
    };
  }, [wsUrl]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4 w-full max-w-3xl mx-auto text-xs h-72 overflow-y-auto border border-sky-200 flex flex-col">
      {logs.length === 0 ? (
        <div className="text-neutral-400 text-center">Žiadne logy...</div>
      ) : (
        logs.map((log, i) => {
          const entry = parseLog(log);
          let borderColor = "";
          let textColor = "";
          switch (entry.status) {
            case 200:
              borderColor = "border-green-500 bg-green-50";
              textColor = "text-green-700";
              break;
            case 400:
              borderColor = "border-yellow-500 bg-yellow-50";
              textColor = "text-yellow-700";
              break;
            case 500:
              borderColor = "border-red-500 bg-red-50";
              textColor = "text-red-700";
              break;
            default:
              borderColor = "border-sky-200 bg-sky-50";
              textColor = "text-sky-700";
          }
          return (
            <div
              key={i}
              className={`flex items-center border-l-4 ${borderColor} ${textColor} px-2 py-1 rounded mb-1`}
            >
              <span className="w-20 text-[10px] text-gray-500 text-left">
                {entry.time}
              </span>
              <span className="w-8 font-mono text-xs text-left">
                {entry.status}
              </span>
              <span className="flex-1 text-gray-800 text-left">
                {entry.message}
              </span>
              {entry.duration && (
                <span className="text-gray-400 ml-2 text-[10px]">
                  {entry.duration}
                </span>
              )}
            </div>
          );
        })
      )}
      <div ref={logEndRef} />
    </div>
  );
}
