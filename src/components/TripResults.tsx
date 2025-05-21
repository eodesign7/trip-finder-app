import AdvancedTripCard from "@/components/trip/AdvancedTripCard";
import { Loader2 } from "lucide-react";
import type { TripResultsProps } from "types";

export default function TripResults({
  trips,
  isLoading,
  aiScores,
  aiSummary,
  hasSearched,
}: TripResultsProps & { aiSummary?: string; hasSearched: boolean }) {
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <Loader2 className="animate-spin h-10 w-10 text-orange-500 mb-4" />
        <div className="text-lg text-orange-700 font-semibold">
          Načítavam spoje...
        </div>
      </div>
    );
  }
  if (!hasSearched) return null;
  if (hasSearched && !trips.length) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <div className="text-2xl text-sky-700 font-bold mb-2">
          Žiadne spoje nenájdené
        </div>
        <div className="text-sky-500 text-lg mb-4">
          {aiSummary ||
            "Hm, vyzerá to tak, že na dnes už nie sú spoje. Skús to opäť zajtra alebo zmeň parametre vyhľadávania."}
        </div>
      </div>
    );
  }
  return (
    <div className="w-full max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {trips.map((trip, i) => {
        const score = aiScores?.find((s) => s.index === i);
        return (
          <div key={i}>
            <AdvancedTripCard trip={trip} isDemo />
            {score && (
              <div className="flex gap-2 mt-2 mb-4">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                  Rýchlosť: {score.fast}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                  Cena: {score.cheap}
                </span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                  Pohodlie: {score.comfy}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
