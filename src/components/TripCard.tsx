type TripCardProps = {
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

export default function TripCard({
  from,
  to,
  duration,
  icon,
  provider,
  line,
  segments,
}: TripCardProps) {
  return (
    <div className="relative flex flex-col md:flex-row items-center gap-4 bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg hover:border-[var(--omio-blue)] transition-all duration-200">
      {/* Ikona a provider */}
      <div className="flex flex-col items-center min-w-[80px]">
        <span className="text-[var(--omio-blue)] text-3xl">{icon}</span>
        <a
          href={provider.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--omio-blue)] font-semibold underline text-xs mt-1"
        >
          {provider.name}
        </a>
        {line && <span className="text-xs text-gray-500 mt-1">{line}</span>}
      </div>
      {/* Odkiaľ/Kam */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex flex-row gap-4 items-center">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Odkiaľ</span>
            <span className="font-bold text-[var(--omio-blue)]">
              {from.time} {from.station}
            </span>
            <span className="text-xs text-gray-500">{from.city}</span>
          </div>
          <span className="mx-2 text-lg text-gray-400">→</span>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Kam</span>
            <span className="font-bold text-[var(--omio-blue)]">
              {to.time} {to.station}
            </span>
            <span className="text-xs text-gray-500">{to.city}</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Dĺžka cesty: <b>{duration} min</b>
        </div>
        {/* Segmenty/prestupy */}
        {segments.length > 1 && (
          <div className="mt-2 text-xs text-gray-600">
            Prestupy:
            <ul className="list-disc ml-4">
              {segments.map((seg, idx) => (
                <li key={idx}>
                  {seg.type && <span className="font-bold">{seg.type}</span>}{" "}
                  {seg.from} → {seg.to} {seg.line && <span>({seg.line})</span>}{" "}
                  {seg.provider && <span>- {seg.provider}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
