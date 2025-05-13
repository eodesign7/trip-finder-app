import TripCard from "@/components/TripCard";

type TripOption = {
  from: { time: string; station: string; city: string };
  to: { time: string; station: string; city: string };
  duration: number;
  icon: string;
  provider: { name: string; url: string };
  line: string;
  segments: Array<{
    type?: string;
    from?: string;
    to?: string;
    line?: string;
    provider?: string;
  }>;
};

type TripResultsProps = {
  trips: TripOption[];
};

export default function TripResults({ trips }: TripResultsProps) {
  if (!trips.length) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 flex flex-col gap-4">
      {trips.map((trip, i) => (
        <div key={i}>
          <TripCard {...trip} />
          <div className="transition-all duration-300 origin-top overflow-hidden scale-y-0 opacity-0 max-h-0">
            {/* Expandované detaily sú vypnuté */}
          </div>
        </div>
      ))}
    </div>
  );
}
