import AdvancedTripCard from "@/components/trip/AdvancedTripCard";
import { Loader2 } from "lucide-react";
import type { TripOption, TripAiScore, TripResultsProps } from "types";

export default function TripResults({
  trips,
  isLoading,
  aiScores,
}: TripResultsProps) {
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

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 flex flex-col gap-4">
      {trips.map((trip, i) => {
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
            <AdvancedTripCard
              id={String(i)}
              from={trip.from.city}
              to={trip.to.city}
              departureTime={trip.from.time}
              arrivalTime={trip.to.time}
              price={0} // demo
              currency="€" // demo
              totalDuration={trip.duration + " min"}
              segments={trip.segments.map((seg) => ({
                type: seg.type === "bus" ? "bus" : "train",
                from: seg.from ?? "",
                to: seg.to ?? "",
                departureTime: seg.stops?.[0]?.time ?? "",
                arrivalTime: seg.stops?.[seg.stops.length - 1]?.time ?? "",
                duration:
                  seg.stops && seg.stops.length > 1
                    ? `${
                        seg.stops[0]?.time &&
                        seg.stops[seg.stops.length - 1]?.time
                          ? seg.stops[0].time +
                            " - " +
                            seg.stops[seg.stops.length - 1].time
                          : ""
                      }`
                    : "",
                carrier: seg.provider ?? trip.provider.name,
              }))}
              co2={0} // demo
              isDemo
            />
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
