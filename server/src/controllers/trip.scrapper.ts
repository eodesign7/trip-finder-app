import { Request, Response } from "express";
import { sendTripScoringRequest } from "../lib/openai";
import { getCpHtmlDynamic } from "../scrapper/trip.getter";
import { parseTripsFromHtml } from "../scrapper/trip.constructor";
import type { TripOption } from "../../../types";
import { buildCpSmartLink } from "../scrapper/url-constructor";
import { formatTodayForConstructor } from "../scrapper/date-helpers";
import { logToAllClients } from "../lib/helpers";

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
  logToAllClients(
    JSON.stringify({
      status: 200,
      message: "[tripCpScrapeController] Začínam spracovanie požiadavky...",
      time: new Date().toISOString(),
    })
  );
  logToAllClients(
    JSON.stringify({
      status: 200,
      message:
        "[tripCpScrapeController] REQ BODY RAW: " + JSON.stringify(req.body),
      time: new Date().toISOString(),
    })
  );
  console.log(
    "[tripCpScrapeController] REQ BODY (stringified):",
    JSON.stringify(req.body, null, 2)
  );
  const { from, to, date } = req.body;
  let time = req.body.time;
  if (!time) {
    logToAllClients(
      JSON.stringify({
        status: 400,
        message: `[tripCpScrapeController] time neprišiel alebo je prázdny! Typ: ${typeof req
          .body.time}, Hodnota: ${req.body.time}`,
        time: new Date().toISOString(),
      })
    );
    time = "00:00"; // fallback, ale FE by mal vždy poslať čas!
    console.log("[tripCpScrapeController] time neprišiel, nastavujem na 00:00");
  }
  logToAllClients(
    JSON.stringify({
      status: 200,
      message: `[tripCpScrapeController] Params: from=${from}, to=${to}, date=${date}, time=${time}`,
      time: new Date().toISOString(),
    })
  );

  let trips: TripOption[] = [];
  let aiResult = null;
  let aiResultToSend = null;
  try {
    logToAllClients(
      JSON.stringify({
        status: 200,
        message: "[tripCpScrapeController] Získavam HTML z cp.sk...",
        time: new Date().toISOString(),
      })
    );
    const html = await getCpHtmlDynamic({ from, to, date, time });
    logToAllClients(
      JSON.stringify({
        status: 200,
        message:
          "[tripCpScrapeController] HTML načítané, idem parsovať tripy...",
        time: new Date().toISOString(),
      })
    );
    const today = formatTodayForConstructor(date);
    trips = parseTripsFromHtml(html, today);
    logToAllClients(
      JSON.stringify({
        status: 200,
        message: `[tripCpScrapeController] Našiel som ${trips.length} tripov.`,
        time: new Date().toISOString(),
      })
    );

    // --- LOGY pred filterom ---
    const totalSegments = trips.reduce(
      (acc, t) => acc + (t.segments?.length || 0),
      0
    );
    logToAllClients(
      JSON.stringify({
        status: 200,
        message: `[tripCpScrapeController] Pred filterom: ${trips.length} tripov, ${totalSegments} segmentov.`,
        time: new Date().toISOString(),
      })
    );

    // --- AI scoring & summary ---
    logToAllClients(
      JSON.stringify({
        status: 200,
        message: "[tripCpScrapeController] AI scoring...",
        time: new Date().toISOString(),
      })
    );
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
    logToAllClients(
      JSON.stringify({
        status: 200,
        message: `[tripCpScrapeController] Po AI scoringu, filter segmentov...`,
        time: new Date().toISOString(),
      })
    );
    const tripsToSend = trips.filter(areSegmentsContinuous);
    logToAllClients(
      JSON.stringify({
        status: 200,
        message: `[tripCpScrapeController] Po filtri: ${tripsToSend.length} tripov zostáva.`,
        time: new Date().toISOString(),
      })
    );

    // --- LOGY po filteri ---
    const totalSegmentsFiltered = tripsToSend.reduce(
      (acc, t) => acc + (t.segments?.length || 0),
      0
    );
    logToAllClients(
      JSON.stringify({
        status: 200,
        message: `[tripCpScrapeController] Po filteri: ${tripsToSend.length} tripov, ${totalSegmentsFiltered} segmentov.`,
        time: new Date().toISOString(),
      })
    );

    // --- Ak parser nenájde žiadne tripy, vráť 404 ---
    if (!tripsToSend.length) {
      return res.status(404).json({
        noTrips: true,
        message:
          "Hm, vyzerá to tak, že na dnes už nie sú spoje. Skús to opäť zajtra alebo zmeň parametre vyhľadávania.",
        ai: {
          summary:
            "Dnes už žiadne spoje nejdú. Skús to opäť zajtra, alebo pohraj sa s časom a dátumom. Ak chceš tip: najviac spojov býva ráno a okolo obeda. Držím palce! 🚄😉",
          scores: [],
        },
        data: [],
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
      logToAllClients(
        JSON.stringify({
          status: 200,
          message: `[tripCpScrapeController] Tripy sú na najbližší možný dátum: ${actualDate}`,
          time: new Date().toISOString(),
        })
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
    logToAllClients(
      JSON.stringify({
        status: 200,
        message: `[tripCpScrapeController] Posielam trips na FE.`,
        time: new Date().toISOString(),
      })
    );

    // 6. Odošli výsledok na FE
    logToAllClients(
      JSON.stringify({
        status: 200,
        message: `[tripCpScrapeController] Hotovo, posielam výsledok na FE.`,
        time: new Date().toISOString(),
      })
    );
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
    logToAllClients(
      JSON.stringify({
        status: 500,
        message: `[tripCpScrapeController] ERROR: ${String(err)}`,
        time: new Date().toISOString(),
      })
    );
    logToAllClients(
      JSON.stringify({
        status: 500,
        message: "Failed to fetch cp.sk via orchestrator",
        error: String(err),
        time: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      message: "Failed to fetch cp.sk via orchestrator",
      error: String(err),
    });
  }
}
