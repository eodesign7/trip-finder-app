import { useState } from "react";
import TripCard from "@/components/TripCard";

type TripOption = {
  provider: "train" | "bus";
  segments: string[];
  totalPrice: number;
  totalDurationMinutes: number;
  scoring?: number;
  details?: {
    segment: string;
    departure: string;
    arrival: string;
    price: number;
  }[];
};

type TripResultsProps = {
  trips: TripOption[];
};

export default function TripResults({ trips }: TripResultsProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  if (!trips.length) return null;
  // Find best trip (najvyššie skóre alebo najnižšia cena)
  const bestIndex = trips.reduce((best, trip, i, arr) => {
    if (typeof trip.scoring === "number") {
      if (arr[best].scoring === undefined || trip.scoring! > arr[best].scoring!)
        return i;
    } else {
      if (trip.totalPrice < arr[best].totalPrice) return i;
    }
    return best;
  }, 0);

  // Fiktívny AI summary
  const aiSummary =
    "Based on your preferences, the best connection is the direct train from Bratislava to Vienna. It offers the fastest travel time (75 min) and a high comfort score. The bus is cheaper, but takes longer. If you value speed and comfort, go with the train! 🚄";

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 flex flex-col gap-4">
      <div className="mb-4 bg-[var(--omio-light)] border-l-4 border-[var(--omio-red)] rounded p-3 text-sm text-[var(--omio-blue)] shadow">
        <span className="font-semibold text-[var(--omio-red)] mr-2">
          AI Summary:
        </span>
        {aiSummary}
      </div>
      {trips.map((trip, i) => (
        <div key={i}>
          <TripCard
            {...trip}
            best={i === bestIndex}
            onExpand={() => setExpanded(expanded === i ? null : i)}
            expanded={expanded === i}
          />
          <div
            className={`transition-all duration-300 origin-top overflow-hidden ${
              expanded === i
                ? "scale-y-100 opacity-100 max-h-[500px]"
                : "scale-y-0 opacity-0 max-h-0"
            }`}
            style={{ transform: expanded === i ? "scaleY(1)" : "scaleY(0)" }}
          >
            {expanded === i && (
              <div className="bg-gray-50 border-l-4 border-[var(--omio-blue)] rounded-b p-4 mt-1 text-xs">
                <div className="font-bold mb-2 text-[var(--omio-blue)]">
                  Trip Details
                </div>
                <table className="w-full text-left mb-2">
                  <thead>
                    <tr className="text-gray-500">
                      <th>Segment</th>
                      <th>Departure</th>
                      <th>Arrival</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      trip.details || [
                        {
                          segment: trip.segments.join(" → "),
                          departure: "08:00",
                          arrival: "09:15",
                          price: trip.totalPrice,
                        },
                      ]
                    ).map((seg, idx) => (
                      <tr key={idx}>
                        <td>{seg.segment}</td>
                        <td>{seg.departure}</td>
                        <td>{seg.arrival}</td>
                        <td>{seg.price} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-gray-600">
                  Total duration: <b>{trip.totalDurationMinutes} min</b>
                </div>
                <div className="text-gray-600">
                  Total price: <b>{trip.totalPrice} €</b>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
