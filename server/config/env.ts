import { config } from "dotenv";

// Dynamicky načítaj správny .env súbor podľa NODE_ENV
config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

config(); // Načíta /server/.env

// Odstránené debug logy

// Typovo bezpečný export len pre Google Directions API Key
export const { GOOGLE_DIRECTIONS_API_KEY } = process.env as {
  GOOGLE_DIRECTIONS_API_KEY?: string;
};

if (!GOOGLE_DIRECTIONS_API_KEY) {
  throw new Error("GOOGLE_DIRECTIONS_API_KEY nie je nastavený v .env súbore!");
}

export const { OPENAI_API_KEY } = process.env as {
  OPENAI_API_KEY?: string;
};

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY nie je nastavený v .env súbore!");
}
