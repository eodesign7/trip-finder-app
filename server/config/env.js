"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPENAI_API_KEY = exports.GOOGLE_DIRECTIONS_API_KEY = void 0;
const dotenv_1 = require("dotenv");
// Dynamicky načítaj správny .env súbor podľa NODE_ENV
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
(0, dotenv_1.config)(); // Načíta /server/.env
// Odstránené debug logy
// Typovo bezpečný export len pre Google Directions API Key
exports.GOOGLE_DIRECTIONS_API_KEY = process.env.GOOGLE_DIRECTIONS_API_KEY;
if (!exports.GOOGLE_DIRECTIONS_API_KEY) {
    throw new Error("GOOGLE_DIRECTIONS_API_KEY nie je nastavený v .env súbore!");
}
exports.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!exports.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY nie je nastavený v .env súbore!");
}
