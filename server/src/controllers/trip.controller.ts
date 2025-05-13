import { Request, Response } from "express";
import { logToAllClients } from "../lib/helpers";
import { GOOGLE_DIRECTIONS_API_KEY } from "../../config/env";

let googleApiCallCount = 0;
let lastReset = new Date().toDateString();
function resetIfNewDay() {
  const today = new Date().toDateString();
  if (today !== lastReset) {
    googleApiCallCount = 0;
    lastReset = today;
  }
}

type GoogleLeg = {
  start_address?: string;
  end_address?: string;
  duration?: { value: number };
  departure_time?: { text: string };
  arrival_time?: { text: string };
  steps?: any[];
};

type GoogleRoute = {
  legs?: GoogleLeg[];
};

export async function tripSearchController(req: Request, res: Response) {
  const { from, to, date, time, passengers } = req.body;

  logToAllClients("⚙️SERVER: Processing trip...");
  logToAllClients(
    `⚙️SERVER: Looking for trip: ${from} => ${to}, date: ${date}, time: ${time}, passengers: ${passengers}`
  );
  logToAllClients("⚙️SERVER: Trip received, processing request...");

  try {
    resetIfNewDay();
    if (googleApiCallCount >= 99) {
      return res.status(429).json({
        message:
          "Denný limit na Google Directions API vyčerpaný. Skús to zajtra, braško!",
      });
    }
    googleApiCallCount++;

    // departure_time logika
    let departureTimestamp: number;
    const today = new Date();
    const reqDate = new Date(date);

    if (
      reqDate.getFullYear() === today.getFullYear() &&
      reqDate.getMonth() === today.getMonth() &&
      reqDate.getDate() === today.getDate()
    ) {
      // Dnešný deň – použijeme aktuálny čas
      departureTimestamp = Math.floor(Date.now() / 1000);
    } else {
      // Budúci deň – nastavíme čas na 00:01
      reqDate.setHours(0, 1, 0, 0);
      departureTimestamp = Math.floor(reqDate.getTime() / 1000);
    }

    const params = new URLSearchParams({
      origin: from,
      destination: to,
      mode: "transit",
      departure_time: String(departureTimestamp),
      key: GOOGLE_DIRECTIONS_API_KEY || "",
      language: "sk",
    });
    const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`;
    console.log("[BACKEND] Volám Google Directions API s url:", url);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error("[BACKEND] Error response:", data);
      return res.status(500).json({
        message: "Chyba pri volaní Directions API",
        error: data,
      });
    }

    console.log("[BACKEND] Odpoveď z Google Directions API:", data);

    // Mapovanie Google routes na TripOption[] pre FE
    // FE očakáva: provider, segments, totalPrice, totalDurationMinutes, details, atď.
    const tripOptions = (data.routes || []).map((route: GoogleRoute) => {
      const leg = route.legs?.[0];
      const steps = leg?.steps || [];
      const transitStep = steps.find((s: any) => s.transit_details);
      const lastTransitStep = [...steps]
        .reverse()
        .find((s: any) => s.transit_details);

      // Provider info
      const agency = transitStep?.transit_details?.line?.agencies?.[0];
      const providerName = agency?.name || "unknown";
      const providerUrl = agency?.url || "#";

      // Číslo spoja
      const lineShortName =
        transitStep?.transit_details?.line?.short_name || "";

      // Typ spojenia (vlak/bus)
      const vehicleType =
        transitStep?.transit_details?.line?.vehicle?.type || "";
      const icon =
        vehicleType === "TRAIN" ? "🚄" : vehicleType === "BUS" ? "🚌" : "🚶";

      return {
        from: {
          time: leg?.departure_time?.text || "",
          station: transitStep?.transit_details?.departure_stop?.name || "",
          city: leg?.start_address || "",
        },
        to: {
          time: leg?.arrival_time?.text || "",
          station: lastTransitStep?.transit_details?.arrival_stop?.name || "",
          city: leg?.end_address || "",
        },
        duration: leg ? Math.round((leg.duration?.value || 0) / 60) : 0,
        icon,
        provider: { name: providerName, url: providerUrl },
        line: lineShortName,
        segments: steps.map((step: any) => ({
          type: step.transit_details?.line?.vehicle?.type || step.travel_mode,
          from: step.transit_details?.departure_stop?.name,
          to: step.transit_details?.arrival_stop?.name,
          line: step.transit_details?.line?.short_name,
          provider: step.transit_details?.line?.agencies?.[0]?.name,
        })),
      };
    });

    // Odošli FE už premapované tripy
    res.status(200).json({
      message: "Trip search successful!",
      data: tripOptions,
    });
  } catch (error) {
    console.error("[BACKEND] Neznáma chyba:", error);
    res.status(500).json({
      message: "Chyba pri volaní Directions API",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
