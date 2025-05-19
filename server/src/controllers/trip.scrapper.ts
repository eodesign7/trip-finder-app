import { Request, Response } from "express";
import { sendTripScoringRequest } from "../lib/openai";
import { getCpHtmlDynamic } from "../scrapper/trip.getter";
import { parseTripsFromHtml } from "../scrapper/trip.constructor";
import type { TripOption } from "../../../types";
import { buildCpSmartLink } from "../scrapper/url-constructor";
import { formatTodayForConstructor } from "../scrapper/date-helpers";

// Handler na generovanie smart-linku na cp.sk
export async function tripCpLinkController(req: Request, res: Response) {
  const { from, to, date, time } = req.body;
  const cpLink = buildCpSmartLink({ from, to, date, time });
  res.status(200).json({
    message: "CP.sk link generated!",
    link: cpLink,
  });
}

export async function tripCpScrapeController(req: Request, res: Response) {
  console.log("[tripCpScrapeController] REQ BODY RAW:", req.body);
  console.log(
    "[tripCpScrapeController] REQ BODY (stringified):",
    JSON.stringify(req.body, null, 2)
  );
  const { from, to, date } = req.body;
  let time = req.body.time;
  if (!time) {
    console.log(
      "[tripCpScrapeController] time neprišiel alebo je prázdny! Typ:",
      typeof req.body.time,
      "Hodnota:",
      req.body.time
    );
    time = "00:00"; // fallback, ale FE by mal vždy poslať čas!
    console.log("[tripCpScrapeController] time neprišiel, nastavujem na 00:00");
  }
  console.log(
    `[tripCpScrapeController] Params: from=${from}, to=${to}, date=${date}, time=${time}`
  );

  let trips: TripOption[] = [];
  let aiResult = null;
  let aiResultToSend = null;
  try {
    // --- 1. Získaj HTML cez getter ---
    const html = await getCpHtmlDynamic({ from, to, date, time });
    // --- 2. Vyparsuj tripy cez constructor ---
    const today = formatTodayForConstructor(date);
    trips = parseTripsFromHtml(html, today);

    // --- LOGY pred filterom ---
    console.log(
      "[tripCpScrapeController] TRIPS pred filterom:",
      JSON.stringify(trips, null, 2)
    );

    // --- AI scoring & summary ---
    try {
      aiResult = await sendTripScoringRequest(req.body, trips);
    } catch (err) {
      console.log("[OpenAI] ERROR:", err);
      aiResult = { scores: [], summary: "AI scoring sa nepodaril." };
    }

    // --- SERVER-SIDE VALIDÁCIA NADVÄZNOSTI SEGMENTOV ---
    function normalizeStationName(name: string) {
      return name.split(",")[0].trim().toLowerCase();
    }
    function areSegmentsContinuous(trip: TripOption) {
      if (!trip.segments || trip.segments.length < 2) return true;
      for (let i = 1; i < trip.segments.length; i++) {
        const prevSeg = trip.segments[i - 1];
        const currSeg = trip.segments[i];
        const prevLast =
          prevSeg.stops?.[prevSeg.stops.length - 1]?.station?.trim();
        const currFirst = currSeg.stops?.[0]?.station?.trim();
        const prevLastNorm = prevLast ? normalizeStationName(prevLast) : "";
        const currFirstNorm = currFirst ? normalizeStationName(currFirst) : "";
        if (!prevLastNorm || !currFirstNorm || prevLastNorm !== currFirstNorm) {
          console.log(
            `[areSegmentsContinuous] Trip vyhodený: index=${i}, prevLast=${prevLastNorm}, currFirst=${currFirstNorm}`
          );
          return false;
        }
      }
      return true;
    }
    const tripsToSend = trips.filter(areSegmentsContinuous);

    // --- LOGY po filteri ---
    console.log(
      "[tripCpScrapeController] TRIPS po filteri:",
      JSON.stringify(tripsToSend, null, 2)
    );

    // --- Ak parser nenájde žiadne tripy, vráť 404 ---
    if (!tripsToSend.length) {
      console.log(
        "[tripCpScrapeController] Žiadne spoje na zvolený dátum ani najbližší možný dátum."
      );
      return res.status(404).json({
        message: "No trips found for selected date/time or next available day.",
      });
    }

    // --- Ak tripy existujú, vráť ich s info o actualDate ---
    const actualDate = tripsToSend[0].date;
    const usedDate = date;
    const usedTime = time;
    const todayShort =
      formatTodayForConstructor(date).match(/\d{1,2}\.\d{1,2}\./)?.[0];
    const actualShort = actualDate.match(/\d{1,2}\.\d{1,2}\./)?.[0];
    if (todayShort && actualShort && todayShort !== actualShort) {
      console.log(
        `[tripCpScrapeController] Tripy sú na najbližší možný dátum: ${actualDate}`
      );
      aiResultToSend = aiResult;
      res.status(200).json({
        message: `No trips found for selected date/time, showing results for next available date (${actualDate})`,
        data: tripsToSend,
        ai: aiResultToSend,
        fallbackToNextDay: true,
        usedDate: actualDate,
        usedTime: tripsToSend[0].from.time,
        actualDate,
      });
      return;
    }

    // Logovanie výsledných dát do konzoly servera
    console.log(
      "[tripCpScrapeController] Posielam trips na FE:",
      JSON.stringify(tripsToSend, null, 2)
    );

    // 6. Odošli výsledok na FE
    aiResultToSend = aiResult;
    res.status(200).json({
      message: "Scraped trips",
      data: tripsToSend,
      ai: aiResultToSend,
      fallbackToNextDay: false,
      usedDate,
      usedTime,
      actualDate,
    });
    return;
  } catch (err) {
    console.log("[Orchestrator] ERROR:", err);
    return res.status(500).json({
      message: "Failed to fetch cp.sk via orchestrator",
      error: String(err),
    });
  }
}
