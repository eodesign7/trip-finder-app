import AdvancedTripCard from "@/components/trip/AdvancedTripCard";
import { Loader2 } from "lucide-react";
import type { TripResultsProps } from "types";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export default function TripResults({
  trips,
  isLoading,
  aiScores,
}: TripResultsProps) {
  const [maxDuration, setMaxDuration] = useState(180); // minút
  const [maxPrice, setMaxPrice] = useState(30); // €
  const [directOnly, setDirectOnly] = useState(false);

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
  if (!trips.length) return null;

  const filtered = trips.filter(
    (trip) =>
      trip.duration <= maxDuration &&
      trip.price <= maxPrice &&
      (!directOnly || trip.segments.length === 1)
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 flex flex-col gap-4">
      <div className="flex gap-4 mb-4 items-center bg-white p-3 rounded shadow border">
        <div className="flex flex-col min-w-[120px]">
          <span className="text-xs text-gray-500 mb-1">Max duration</span>
          <Slider
            min={30}
            max={600}
            value={[maxDuration]}
            onValueChange={([v]) => setMaxDuration(v)}
          />
          <span className="text-xs mt-1">{maxDuration} min</span>
        </div>
        <div className="flex flex-col min-w-[120px]">
          <span className="text-xs text-gray-500 mb-1">Max price</span>
          <Slider
            min={1}
            max={100}
            value={[maxPrice]}
            onValueChange={([v]) => setMaxPrice(v)}
          />
          <span className="text-xs mt-1">{maxPrice} €</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={directOnly} onCheckedChange={setDirectOnly} />
          <span className="text-xs">Only direct</span>
        </div>
      </div>
      {filtered.map((trip, i) => {
        // LOGUJEME TRIP A SEGMENTY
        console.log(`Trip #${i + 1}:`, trip);
        trip.segments.forEach((segment, idx) => {
          console.log(
            `Trip #${i + 1} Segment #${idx + 1} stops:`,
            segment.stops?.map((s) => s.station)
          );
        });
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
            <div className="transition-all duration-300 origin-top overflow-hidden scale-y-0 opacity-0 max-h-0">
              {/* Expandované detaily sú vypnuté */}
            </div>
          </div>
        );
      })}
    </div>
  );
}
