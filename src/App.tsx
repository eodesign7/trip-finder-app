import "./App.css";
// import TripForm from "@/components/TripForm";
import TripResults from "@/components/TripResults";
import { useState } from "react";
import type { TripOption, TripAiScore } from "types";
import SearchForm from "./components/search/SearchForm";
import LogPanel from "./components/LogPanel";
import { DayPickerProvider } from "react-day-picker";
import { Button } from "@/components/ui/button";

export default function App() {
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiScores, setAiScores] = useState<TripAiScore[]>([]);
  const [showLogPanel, setShowLogPanel] = useState(false);
  return (
    <DayPickerProvider initialProps={{ mode: "single" }}>
      <main className="min-h-screen p-0 m-0">
        {/* Hero image */}
        <div className="absolute top-0 left-0 w-full h-[528px] z-0">
          <img
            src="hero_header.jpg"
            alt="hero_header"
            className="w-full h-full object-cover object-top"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center pt-[180px] ">
          <h1 className="text-6xl md:text-[8rem] font-extrabold mb-6 text-white drop-shadow-lg">
            <span className="text-[var(--omio-red)]">.</span>Trips
          </h1>
          <div className="w-full flex flex-col items-center justify-center gap-4">
            <SearchForm
              setTrips={setTrips}
              setIsLoading={setIsLoading}
              setAiSummary={setAiSummary}
              setAiScores={setAiScores}
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
          {aiSummary && (
            <div className="w-full max-w-3xl mx-auto mt-4 mb-2 p-4 bg-orange-50 border-l-4 border-orange-400 text-orange-900 rounded shadow">
              <strong>AI odporúčanie:</strong> {aiSummary}
            </div>
          )}
          <TripResults
            trips={trips}
            isLoading={isLoading}
            aiScores={aiScores}
          />
        </div>
      </main>
    </DayPickerProvider>
  );
}
