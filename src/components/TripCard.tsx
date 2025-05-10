type TripCardProps = {
  provider: "train" | "bus";
  segments: string[];
  totalPrice: number;
  totalDurationMinutes: number;
  scoring?: number;
  best?: boolean;
  onExpand?: () => void;
  expanded?: boolean;
};

export default function TripCard({
  provider,
  segments,
  totalPrice,
  totalDurationMinutes,
  scoring,
  best,
  onExpand,
  expanded,
}: TripCardProps) {
  return (
    <div
      className={`relative flex flex-col md:flex-row items-center gap-4 bg-white rounded-xl shadow-md p-4 border transition-all duration-200 ${
        best
          ? "border-[var(--omio-red)] ring-2 ring-[var(--omio-red)]"
          : "border-gray-200"
      } hover:shadow-lg hover:border-[var(--omio-blue)]`}
    >
      {best && (
        <span className="absolute top-2 right-2 bg-[var(--omio-red)] text-white text-xs font-bold px-2 py-1 rounded-full shadow">
          Best
        </span>
      )}
      <div className="flex items-center gap-2 min-w-[80px]">
        {provider === "train" ? (
          <span className="text-[var(--omio-blue)] text-2xl">🚄</span>
        ) : (
          <span className="text-[var(--omio-blue)] text-2xl">🚌</span>
        )}
        <span className="capitalize text-[var(--omio-blue)] font-semibold">
          {provider}
        </span>
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="text-sm text-gray-700">
          Segments: {segments.join(" → ")}
        </div>
        <div className="text-xs text-gray-400">
          Duration: {totalDurationMinutes} min
        </div>
      </div>
      <div className="flex flex-col items-end min-w-[80px]">
        <span className="text-lg font-bold text-[var(--omio-red)]">
          {totalPrice} €
        </span>
        {typeof scoring === "number" && (
          <span className="text-xs text-gray-500">Score: {scoring}</span>
        )}
        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="mt-2 text-xs text-[var(--omio-blue)] underline hover:text-[var(--omio-red)] focus:outline-none"
          >
            {expanded ? "Hide details" : "Show details"}
          </button>
        )}
      </div>
    </div>
  );
}
