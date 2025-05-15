import React from "react";

// import type { TripCardProps } from "types";

const SEGMENT_ICONS: Record<string, string> = {
  TRAIN: "🚄",
  BUS: "🚌",
  WALK: "🚶",
  UNKNOWN: "❓",
};

// Voliteľné: špeciálne ikonky (wifi, bike, wheelchair...) podľa segmentu
const SPECIAL_ICONS: Record<string, string> = {
  wifi: "📶",
  bike: "🚲",
  wheelchair: "♿",
};

// Pomocná funkcia na formátovanie dátumu (napr. 17.5. so)
function formatDate(dateStr?: string) {
  if (!dateStr) return "?";
  // Očakávam formát "17.5. so" alebo "17.5.2025"
  return dateStr;
}

// Props podľa TripOption
interface TripCardProps {
  from: { time: string; station: string; city: string };
  duration: number;
  segments: Array<{
    type?: string;
    from?: string;
    to?: string;
    line?: string;
    provider?: string;
  }>;
  price?: number;
  adults?: number;
  children?: number;
}

export default function TripCard({
  from,
  duration,
  segments,
  price,
  adults,
  children,
}: TripCardProps) {
  // Header info
  const mainSegment =
    segments.find((s) => s.type === "BUS" || s.type === "TRAIN") || segments[0];
  const toStation =
    segments.length > 0 ? segments[segments.length - 1].to : "?";
  const line = mainSegment?.line || "?";
  const provider = mainSegment?.provider || "?";
  const icon = SEGMENT_ICONS[mainSegment?.type || "UNKNOWN"] || "❓";
  const transferCount =
    segments.filter((s) => s.type === "BUS" || s.type === "TRAIN").length - 1;
  const isDirect = transferCount === 0;
  const priceStr = price !== undefined ? `${price.toFixed(2)} EUR` : "?";
  const adultsStr = adults !== undefined ? adults : 1;
  const childrenStr = children !== undefined ? children : 0;
  const durationStr = `${
    Math.floor(duration / 60) > 0 ? Math.floor(duration / 60) + " hod " : ""
  }${duration % 60} min`;

  return (
    <div className="bg-blue-50 rounded-2xl shadow-lg overflow-hidden mb-6 border border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-blue-100 border-b border-blue-200">
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold text-blue-700">
            {from.station || "?"}
          </span>
          <span className="text-gray-400 text-base">{from.city || "?"}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500">Celkový čas</span>
          <span className="text-2xl font-bold text-blue-700">
            {durationStr}
          </span>
        </div>
      </div>

      {/* Segment (spoj) */}
      <div className="flex items-center gap-4 px-6 py-4 bg-white rounded-xl shadow-sm mt-4 mx-4">
        <span className="text-3xl mr-2">{icon}</span>
        <div className="flex flex-col items-start min-w-[120px]">
          <span className="font-bold text-lg text-gray-800">
            {from.station || "?"}
          </span>
          <span className="font-bold text-lg text-gray-800">
            {toStation || "?"}
          </span>
        </div>
        <div className="flex flex-col ml-4 min-w-[180px]">
          <span className="text-blue-700 font-semibold text-sm leading-tight">
            {line}
          </span>
        </div>
        <div className="flex flex-col ml-4">
          <span className="text-gray-500 text-sm leading-tight">
            {provider}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 bg-blue-50 border-t border-blue-100 mt-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-700 underline cursor-pointer">
            Detaily spojenia
          </span>
          <span className="text-sm text-gray-500">
            {adultsStr} dospelý, {childrenStr} detí
          </span>
          {isDirect ? (
            <span className="inline-block px-3 py-1 rounded text-xs font-bold bg-green-200 text-green-800">
              Priame spojenie
            </span>
          ) : (
            <span className="inline-block px-3 py-1 rounded text-xs font-bold bg-orange-200 text-orange-800">
              {transferCount} prestup{transferCount === 1 ? "" : "y"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-green-700">{priceStr}</span>
          <span className="text-sm text-gray-400">Čiastočná cena</span>
        </div>
      </div>
    </div>
  );
}
