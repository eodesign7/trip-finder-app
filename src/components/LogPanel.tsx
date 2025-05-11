import { useWebSocket } from "@/hooks/use-web-socket";
import parseLog from "@/utils/parse-log"; 

export default function LogPanel() {
  const logs = useWebSocket();

  if (!logs) return null;
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4 w-full max-w-3xl mx-auto text-xs h-40 overflow-y-auto border border-[var(--omio-blue)] flex flex-col">
      {logs.map((log, i) => {
        const entry = parseLog(log);
        let borderColor = "";
        let textColor = "";
        switch (entry.status) {
          case 200:
            borderColor = "border-green-500 bg-green-50";
            textColor = "text-green-500";
            break;
          case 400:
            borderColor = "border-yellow-500 bg-yellow-50";
            break;
          case 500:
            borderColor = "border-red-500 bg-red-50";
            textColor = "text-red-500";
            break;
          default:
            borderColor = "border-blue-300 bg-blue-50";
            textColor = "text-blue-500";
        }
        return (
          <div
            key={i}
            className={`flex items-center border-l-4 ${borderColor} ${textColor} px-2 py-1 rounded`}
          >
            <span className="w-12 text-[10px] text-gray-500 text-left">
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
      })}
    </div>
  );
}
