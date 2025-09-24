// API Configuration for Trip Finder App
export const config = {
  // API Base URL - Render endpoint
  apiUrl:
    import.meta.env.VITE_API_URL || "https://trip-finder-app.onrender.com",

  // WebSocket URL - Render WebSocket endpoint
  wsUrl: import.meta.env.VITE_WS_URL || "wss://trip-finder-app.onrender.com",

  // Development fallbacks
  devApiUrl: "http://localhost:3001",
  devWsUrl: "ws://localhost:3001",
};

export default config;
