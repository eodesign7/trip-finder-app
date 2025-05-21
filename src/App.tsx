import "./App.css";
import TripResults from "@/components/TripResults";
import { useState } from "react";
import type { TripOption, TripAiScore } from "types";
import SearchForm from "./components/search/SearchForm";
import LogPanel from "./components/LogPanel";
import { DayPickerProvider } from "react-day-picker";
import { Button } from "@/components/ui/button";
import AiSummary from "@/components/AiSummary";

export default function App() {
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiScores, setAiScores] = useState<TripAiScore[]>([]);
  const [showLogPanel, setShowLogPanel] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  return (
    <DayPickerProvider initialProps={{ mode: "single" }}>
      <main className="min-h-screen p-0 m-0">
        <div className="absolute top-0 left-0 w-full h-[720px] z-0">
          <img
            src="hero3.png"
            alt="hero_header"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white opacity-50" />
        </div>
        <div className="relative z-20 flex flex-col items-center pt-[80px] ">
          <h1 className="text-6xl md:text-[8rem] font-extrabold mb-12 text-white drop-shadow-lg">
            <span className="text-orange-500">.</span>Trips
          </h1>
          <div className="w-full flex flex-col items-center justify-center gap-4">
            <SearchForm
              setTrips={setTrips}
              setIsLoading={setIsLoading}
              setAiSummary={setAiSummary}
              setAiScores={setAiScores}
              setHasSearched={setHasSearched}
            />
            <Button
              variant="link"
              size="icon"
              className="text-orange-500 bg-transparent"
              onClick={() => setShowLogPanel(!showLogPanel)}
            >
              {showLogPanel ? "Skryť Log" : "Zobraz Log"}
            </Button>
            {showLogPanel && <LogPanel />}
          </div>
          <AiSummary aiSummary={aiSummary} />
          <TripResults
            trips={trips}
            isLoading={isLoading}
            aiScores={aiScores}
            aiSummary={aiSummary}
            hasSearched={hasSearched}
          />
        </div>
      </main>
      <footer className="w-full bg-white/80 border-t border-slate-200 py-4 mt-12 flex flex-col md:flex-row items-center justify-center gap-4 text-slate-500 text-sm z-30">
        <span>©{new Date().getFullYear()} .Trips | Made with ❤️ by eoDev.</span>
        <span className="mx-2">·</span>
        <a
          href="https://github.com/erikxxx/trip-finder-app"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-600 transition-colors text-neutral-600"
        >
          GitHub
        </a>
        <span className="mx-2">·</span>
        <a
          href="#"
          className="hover:text-orange-600 transition-colors text-neutral-600"
        >
          Dokumentácia (čoskoro)
        </a>
      </footer>
    </DayPickerProvider>
  );
}
