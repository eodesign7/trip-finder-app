import { Request, Response } from "express";
import * as cheerio from "cheerio";
import type { TripOption } from "../../../types";

// Handler na generovanie smart-linku na cp.sk
export async function tripCpLinkController(req: Request, res: Response) {
  const { from, to, date, time } = req.body;

  // Helper na URL encoding s diakritikou
  function encodeCp(text: string) {
    return encodeURIComponent(text);
  }

  // Funkcia na zistenie, či je dátum dnes
  function isToday(dateStr: string) {
    const today = new Date();
    const [d, m, y] = dateStr.split(".");
    const reqDate = new Date(`${y}-${m}-${d}`);
    return (
      reqDate.getFullYear() === today.getFullYear() &&
      reqDate.getMonth() === today.getMonth() &&
      reqDate.getDate() === today.getDate()
    );
  }

  // Nastavenie času podľa logiky
  let searchTime = time;
  if (!searchTime || searchTime === "") {
    if (isToday(date)) {
      const now = new Date();
      searchTime = now
        .toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })
        .padStart(5, "0");
    } else {
      searchTime = "00:01";
    }
  }

  // Skladanie URL
  const baseUrl = "https://www.cp.sk/vlakbus/spojenie/";
  const params = [
    `f=${encodeCp(from)}`,
    `t=${encodeCp(to)}`,
    date ? `date=${date}` : null,
    searchTime ? `time=${searchTime}` : null,
    "submit=true",
  ]
    .filter(Boolean)
    .join("&");

  const cpLink = `${baseUrl}?${params}`;

  res.status(200).json({
    message: "CP.sk link generated!",
    link: cpLink,
  });
}

// Scrape prvý trip z cp.sk (fetch HTML z webu)
export async function tripCpScrapeController(req: Request, res: Response) {
  const { from, to, date, time, adults, children } = req.body;

  function encodeCp(text: string) {
    return encodeURIComponent(text);
  }
  const baseUrl = "https://www.cp.sk/vlakbus/spojenie/";
  const params = [
    `f=${encodeCp(from)}`,
    `t=${encodeCp(to)}`,
    date ? `date=${date}` : null,
    time ? `time=${time}` : null,
    "submit=true",
  ]
    .filter(Boolean)
    .join("&");
  const cpLink = `${baseUrl}?${params}`;

  // Fetch HTML z cp.sk cez natívny fetch
  let rawHtml = "";
  try {
    const response = await fetch(cpLink);
    rawHtml = await response.text();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch cp.sk", error: String(err) });
  }

  const $ = cheerio.load(rawHtml);
  const trips: TripOption[] = [];

  // Iteruj cez všetky tripy
  $(".box.connection.detail-box").each((i, box) => {
    const head = $(box).find(".connection-head");
    const departureTime = head.find("h2.reset.date").text().trim().slice(0, 5); // napr. "11:57"
    const totalDurationText = head.find(".total strong").text().trim();
    // Prevod na minúty
    let duration = 0;
    const match = totalDurationText.match(/(\d+)\s*hod\s*(\d+)?\s*min/);
    if (match) {
      duration = parseInt(match[1] || "0") * 60 + parseInt(match[2] || "0");
    } else {
      const minMatch = totalDurationText.match(/(\d+)\s*min/);
      if (minMatch) duration = parseInt(minMatch[1]);
    }

    // Segmenty
    type Segment = {
      type?: string;
      from?: string;
      to?: string;
      line?: string;
      provider?: string;
      stops?: { time: string; station: string }[];
    };
    const segments: Segment[] = [];
    $(box)
      .find(".line-item")
      .each((j, el) => {
        const title = $(el).find(".line-title h3 span").text().trim();
        const provider = $(el).find(".owner span").text().trim();
        const stations = $(el).find("ul.stations li");
        const stops: { time: string; station: string }[] = [];
        stations.each((k, li) => {
          const time = $(li).find(".time").text().trim();
          const station = $(li).find(".name").text().trim();
          stops.push({ time, station });
        });
        segments.push({
          type: title.startsWith("Bus")
            ? "BUS"
            : title.startsWith("EC") ||
              title.startsWith("Os") ||
              title.startsWith("REX") ||
              title.startsWith("R ")
            ? "TRAIN"
            : "UNKNOWN",
          line: title,
          provider,
          from: stops[0]?.station || "",
          to: stops[stops.length - 1]?.station || "",
          stops,
        });
        // Ak je medzi segmentmi chôdza
        const walk = $(el)
          .next(".outside-of-popup--with-link-dist")
          .find(".walk--detail")
          .text()
          .trim();
        if (walk) {
          segments.push({
            type: "WALK",
            line: walk,
            provider: "",
            from: stops[stops.length - 1]?.station || "",
            to: stops[stops.length - 1]?.station || "",
            stops: [],
          });
        }
      });

    // Cena (skús najprv .connection-expand .basket .price, potom .price-value, potom detailnú sekciu "Cestovné")
    let price: number | undefined = undefined;
    // 1. Skús .connection-expand .basket .price
    const priceText = $(box)
      .find(".connection-expand .basket .price")
      .text()
      .replace(/\s+/g, " ")
      .trim();
    if (priceText) {
      // Hľadám číslo pred "EUR"
      const match = priceText.match(/([\d,.]+)\s*EUR/);
      if (match) {
        price = parseFloat(match[1].replace(",", "."));
      }
    }
    // 2. Ak nič, skús .price-value
    if (price === undefined) {
      const priceValueText = $(box).find(".price-value").first().text().trim();
      if (priceValueText) {
        const match = priceValueText.match(/([\d,.]+)\s*EUR?/);
        if (match) {
          price = parseFloat(match[1].replace(",", "."));
        }
      }
    }
    // 3. Ak stále nič, skús detailnú sekciu "Cestovné"
    if (price === undefined) {
      const fareSection = $(box)
        .find(".connection-details")
        .find(".cestovne, .fare, .connection-fare, .connection-fare-section");
      let sum = 0;
      fareSection.find("li, p").each((_, el) => {
        const txt = $(el).text();
        const match = txt.match(/([\d,.]+)\s*[€EUR]/);
        if (match) {
          sum += parseFloat(match[1].replace(",", "."));
        }
      });
      if (sum > 0) price = sum;
    }
    // Fallback na fakePrice podľa vzdialenosti (ak stále nič)
    if (price === undefined) {
      // Skús odhadnúť vzdialenosť podľa názvov staníc (veľmi hrubý odhad)
      const fromStation = segments[0]?.from || from;
      const toStation = segments[segments.length - 1]?.to || to;
      // Tu by si mohol volať nejakú distance API, ale dáme fake heuristiku:
      // Ak je v názve "Bratislava" a "Košice" => 400km, "Bratislava" a "Žilina" => 200km, inak default 50km
      let km = 50;
      const all = (fromStation + toStation).toLowerCase();
      if (all.includes("bratislava") && all.includes("košice")) km = 400;
      else if (all.includes("bratislava") && all.includes("žilina")) km = 200;
      else if (all.includes("bratislava") && all.includes("trnava")) km = 60;
      else if (all.includes("bratislava") && all.includes("nové zámky"))
        km = 110;
      else if (all.includes("bratislava") && all.includes("nitra")) km = 90;
      // Fake price: 0.12 EUR/km
      price = Math.round(km * 0.12 * 100) / 100;
    }

    // Vytvor TripOption
    const trip: TripOption = {
      from: {
        time: segments[0]?.stops?.[0]?.time || departureTime || "",
        station: segments[0]?.stops?.[0]?.station || "",
        city: from,
      },
      to: {
        time: segments[segments.length - 1]?.stops?.slice(-1)[0]?.time || "",
        station:
          segments[segments.length - 1]?.stops?.slice(-1)[0]?.station || "",
        city: to,
      },
      duration,
      icon:
        segments[0]?.type === "TRAIN"
          ? "🚄"
          : segments[0]?.type === "BUS"
          ? "🚌"
          : "🚶",
      provider: { name: segments[0]?.provider || "", url: "" },
      line: segments[0]?.line || "",
      segments,
      price,
      totalPrice:
        price !== undefined
          ? price * (Number(adults) + 0.5 * Number(children))
          : undefined,
      adults: Number(adults),
      children: Number(children),
    };
    trips.push(trip);
  });

  if (!trips.length) return res.status(404).json({ message: "No trip found" });

  res.status(200).json({ message: "Scraped trips", data: trips });
}
