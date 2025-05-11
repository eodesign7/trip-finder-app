type LogEntry = {
  time: string;
  status: number;
  message: string;
  duration?: string | null;
};

function parseLog(log: string): LogEntry {
  let parsed: Partial<LogEntry> = {};
  try {
    parsed = JSON.parse(log);
  } catch {
    parsed = { message: log, status: 200 };
  }
  return {
    time: new Date().toLocaleTimeString(),
    status: parsed.status ?? 200,
    message: parsed.message ?? String(log),
    duration: parsed.duration ?? null,
  };
}

export default parseLog;
