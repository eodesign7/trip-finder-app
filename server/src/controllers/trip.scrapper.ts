import { Request, Response } from "express";
import puppeteer from "puppeteer";
import type { TripOption } from "../../../types";
import { sendTripScoringRequest } from "../lib/openai";

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
// Táto funkcia:
// 1. Vygeneruje smart-link na cp.sk podľa zadaných parametrov
// 2. Otvorí stránku cez Puppeteer
// 3. Kliká na "Neskoršie spojenie" (aj opakovane), aby načítala všetky možné spoje
// 4. Pre každý spoj klikne na "Detaily spojenia", aby sa načítala cena
// 5. Získa HTML a cez Cheerio vyparsuje všetky spoje do TripOption[]
// 6. Vráti výsledok na FE
export async function tripCpScrapeController(req: Request, res: Response) {
  // Logovanie requestu na debug
  console.log(
    "[tripCpScrapeController] REQ BODY:",
    JSON.stringify(req.body, null, 2)
  );
  const { from, to, date, time } = req.body;

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

  let trips: TripOption[] = [];
  let aiResult = null;
  try {
    console.log("[Puppeteer] Začínam scraping stránky CP.sk");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(cpLink, { waitUntil: "networkidle2" });

    // Klikaj na "Neskoršie spojenie" kým existuje, max 5x
    let clickCount = 0;
    while (clickCount < 5) {
      let found = false;
      // Získaj všetky viditeľné odkazy s textom "Neskoršie spojenie"
      const nextLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a"))
          .filter(
            (a) =>
              a.textContent?.includes("Neskoršie spojenie") &&
              a.offsetParent !== null
          )
          .map((a, idx) => idx);
      });
      if (nextLinks.length > 0) {
        // Klikni na prvý viditeľný odkaz cez index
        const allLinks = await page.$$("a");
        const idx = nextLinks[0];
        try {
          await allLinks[idx].click({ delay: 100 });
          await new Promise((res) => setTimeout(res, 1500));
          clickCount++;
          console.log(
            `[Puppeteer] Klikám na 'Neskoršie spojenie' #${clickCount}`
          );
          found = true;
        } catch (err) {
          console.log("[Puppeteer] Klik na 'Neskoršie spojenie' zlyhal:", err);
        }
      }
      if (!found) break;
    }
    console.log(
      `[Puppeteer] Celkový počet klikov na 'Neskoršie spojenie':`,
      clickCount
    );

    // Rozklikni "Detaily spojenia" pre každý trip a počkaj na cenu
    const boxes = await page.$$(".box.connection.detail-box");
    for (const box of boxes) {
      const expandBtn = await box.$(
        'a.ext-expand, a[title*="Detaily spojenia"]'
      );
      if (expandBtn) {
        await expandBtn.click();
        // Počkaj, kým sa objaví cena (max 2 sekundy)
        try {
          await page.waitForFunction(
            (el) =>
              el.querySelector(".price-value") ||
              el.querySelector(".basket .price"),
            { timeout: 2000 },
            box
          );
        } catch {
          // Cena sa neobjavila, ideme ďalej
        }
        await new Promise((res) => setTimeout(res, 300));
      }
    }

    // Získaj HTML (pre prípad debugovania)
    // rawHtml = await page.content(); // už netreba

    // --- Hlavné parsovanie cez evaluate ---
    trips = await page.evaluate(() => {
      function getSegmentType(el: Element) {
        const icon =
          (el.querySelector(".line-title .tt-icon") as HTMLElement)
            ?.textContent || "";
        const title =
          (
            el.querySelector(".line-title h3 span") as HTMLElement
          )?.textContent?.toLowerCase() || "";
        if (icon.includes("247") || title.includes("bus")) return "BUS";
        if (
          icon.includes("251") ||
          title.includes("os") ||
          title.includes("ec") ||
          title.includes("vlak") ||
          title.includes("metropolitan")
        )
          return "TRAIN";
        if (el.classList.contains("outside-of-popup--with-link-dist"))
          return "WALK";
        return "UNKNOWN";
      }
      function getStops(ul: Element | null) {
        if (!ul) return [];
        return Array.from(ul.querySelectorAll("li")).map((li) => ({
          time:
            (li.querySelector(".time") as HTMLElement)?.textContent?.trim() ||
            "",
          station:
            (li.querySelector(".name") as HTMLElement)?.textContent?.trim() ||
            "",
        }));
      }
      function logDebug(obj: unknown) {
        if (typeof window !== "undefined") {
          (window as unknown as { [key: string]: unknown }).__DEBUG_TRIP__ =
            (window as unknown as { [key: string]: unknown }).__DEBUG_TRIP__ ||
            [];
          (
            (window as unknown as { [key: string]: unknown })
              .__DEBUG_TRIP__ as unknown[]
          ).push(obj);
        }
      }
      return Array.from(
        document.querySelectorAll(".box.connection.detail-box")
      ).map((box) => {
        const head = box.querySelector(".connection-head");
        const departureTime =
          (
            head?.querySelector("h2.reset.date") as HTMLElement
          )?.childNodes[0]?.textContent
            ?.trim()
            .slice(0, 5) || "";
        const dateAfter =
          (
            head?.querySelector(".date-after") as HTMLElement
          )?.textContent?.trim() || "";
        const totalDurationText =
          (
            head?.querySelector(".total strong") as HTMLElement
          )?.textContent?.trim() || "";
        let duration = 0;
        const match = totalDurationText.match(/(\d+)\s*hod\s*(\d+)?\s*min/);
        if (match)
          duration = parseInt(match[1] || "0") * 60 + parseInt(match[2] || "0");
        else {
          const minMatch = totalDurationText.match(/(\d+)\s*min/);
          if (minMatch) duration = parseInt(minMatch[1]);
        }
        // --- Segmenty ---
        const segments: Array<{
          type?: string;
          from?: string;
          to?: string;
          line?: string;
          provider?: string;
          stops?: { time: string; station: string }[];
        }> = [];
        const lineItems = box.querySelectorAll(
          ".connection-details .line-item"
        );
        lineItems.forEach((lineItem) => {
          lineItem
            .querySelectorAll(
              ".outside-of-popup, .outside-of-popup--with-link-dist"
            )
            .forEach((block) => {
              const type = getSegmentType(block);
              if (type === "WALK") {
                const walkText =
                  (
                    block.querySelector(".walk--detail") as HTMLElement
                  )?.textContent?.trim() || "";
                const prev = segments[segments.length - 1];
                segments.push({
                  type: "WALK",
                  from: prev ? prev.to : "",
                  to: "",
                  line: walkText,
                  provider: "",
                  stops: [],
                });
              } else {
                const line =
                  (
                    block.querySelector(".line-title h3 span") as HTMLElement
                  )?.textContent?.trim() || "";
                const provider =
                  (
                    block.querySelector(
                      ".line-title .owner span"
                    ) as HTMLElement
                  )?.textContent?.trim() || "";
                // TU JE DÔLEŽITÉ: stops ber len z ul.stations v rámci tohto bloku
                const stops = getStops(block.querySelector("ul.stations"));
                segments.push({
                  type,
                  from: stops[0]?.station || "",
                  to: stops[stops.length - 1]?.station || "",
                  line,
                  provider,
                  stops,
                });
              }
            });
        });
        for (let i = 0; i < segments.length; i++) {
          const seg = segments[i];
          if (seg.type === "WALK" && segments[i + 1]) {
            seg.to = segments[i + 1].from;
          }
        }
        const tripFrom = segments[0]?.stops?.[0] || {
          time: departureTime,
          station: "",
        };
        const tripTo = segments[segments.length - 1]?.stops?.slice(-1)[0] || {
          time: "",
          station: "",
        };
        // --- Cena ---
        let price: number | undefined = undefined;
        let priceDebug = "";
        // 1. Skús partial price (napr. 'Čiastočná cena 6 EUR')
        const partialPrice = box.querySelector(".connection-head .price-value");
        if (partialPrice) {
          const priceText =
            partialPrice.textContent?.replace(/\s+/g, " ").trim() || "";
          const match = priceText.match(/([\d,.]+)\s*EUR/);
          if (match) {
            price = parseFloat(match[1].replace(",", "."));
            priceDebug = "partialPrice";
          }
        }
        if (price === undefined) {
          const priceEl = box.querySelector(
            ".connection-expand .basket .price"
          );
          if (priceEl) {
            const priceText =
              priceEl.textContent?.replace(/\s+/g, " ").trim() || "";
            const match = priceText.match(/([\d,.]+)\s*EUR/);
            if (match) {
              price = parseFloat(match[1].replace(",", "."));
              priceDebug = "expandPrice";
            }
          }
        }
        if (price === undefined) {
          const priceValueEl = box.querySelector(
            ".connection-expand .basket .price-value"
          );
          if (priceValueEl) {
            const priceValueText = priceValueEl.textContent?.trim() || "";
            const match = priceValueText.match(/([\d,.]+)\s*EUR?/);
            if (match) {
              price = parseFloat(match[1].replace(",", "."));
              priceDebug = "expandPriceValue";
            }
          }
        }
        if (price === undefined) {
          const anyPrice = box.querySelector(".price");
          if (anyPrice) {
            const priceText =
              anyPrice.textContent?.replace(/\s+/g, " ").trim() || "";
            const match = priceText.match(/([\d,.]+)\s*EUR?/);
            if (match) {
              price = parseFloat(match[1].replace(",", "."));
              priceDebug = "anyPrice";
            }
          }
        }
        if (price === undefined) {
          priceDebug = "not found";
        }
        logDebug({
          duration,
          price,
          priceDebug,
          segments,
          tripFrom,
          tripTo,
          dateAfter,
        });
        return {
          from: { time: tripFrom.time, station: tripFrom.station, city: "" },
          to: { time: tripTo.time, station: tripTo.station, city: "" },
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
          totalPrice: undefined,
          adults: undefined,
          children: undefined,
          date: dateAfter,
        };
      });
    });

    // --- Doplnenie from/to, city, adults, children, totalPrice na serveri ---
    trips = trips.map((trip) => {
      // Najdi prvý segment s aspoň jedným stopom
      const firstSeg = trip.segments.find(
        (seg) => seg.stops && seg.stops.length > 0
      );
      // Najdi posledný segment s aspoň jedným stopom
      const lastSeg = [...trip.segments]
        .reverse()
        .find((seg) => seg.stops && seg.stops.length > 0);
      // from
      trip.from = {
        time: firstSeg?.stops?.[0]?.time || trip.from.time,
        station: firstSeg?.stops?.[0]?.station || trip.from.station,
        city: from,
      };
      // to
      trip.to = {
        time: lastSeg?.stops?.[lastSeg.stops.length - 1]?.time || trip.to.time,
        station:
          lastSeg?.stops?.[lastSeg.stops.length - 1]?.station ||
          trip.to.station,
        city: to,
      };
      // adults/children
      trip.adults = Number(req.body.adults) || 1;
      trip.children = Number(req.body.children) || 0;
      // totalPrice
      if (typeof trip.price === "number") {
        trip.totalPrice =
          trip.price * trip.adults + trip.price * 0.5 * trip.children;
      }
      // ŽIADNE OREZÁVANIE SEGMENTOV! Segmenty už sú správne podľa CP.sk
      return trip;
    });

    await browser.close();
    console.log("[Puppeteer] Scraping stránky CP.sk dokončený");

    // --- AI scoring & summary ---
    try {
      aiResult = await sendTripScoringRequest(req.body, trips);
    } catch (err) {
      console.log("[OpenAI] ERROR:", err);
      aiResult = { scores: [], summary: "AI scoring sa nepodaril." };
    }
  } catch (err) {
    console.log("[Puppeteer] ERROR:", err);
    return res.status(500).json({
      message: "Failed to fetch cp.sk via Puppeteer",
      error: String(err),
    });
  }

  if (!trips.length) return res.status(404).json({ message: "No trip found" });

  // --- SERVER-SIDE VALIDÁCIA NADVÄZNOSTI SEGMENTOV ---
  function areSegmentsContinuous(trip: TripOption) {
    if (!trip.segments || trip.segments.length < 2) return true;
    for (let i = 1; i < trip.segments.length; i++) {
      const prevSeg = trip.segments[i - 1];
      const currSeg = trip.segments[i];
      const prevLast =
        prevSeg.stops?.[prevSeg.stops.length - 1]?.station?.trim();
      const currFirst = currSeg.stops?.[0]?.station?.trim();
      if (!prevLast || !currFirst || prevLast !== currFirst) {
        return false;
      }
    }
    return true;
  }
  let tripsToSend = trips.filter(areSegmentsContinuous);

  // --- Fallback plán: ak by trips boli prázdne alebo segmenty zle ---
  let usedAI = false;
  // Fallback je teraz vždy aktívny (alebo môžeš dať podmienku podľa potreby)
  try {
    // Kompletný user input podľa typu
    const userInput = {
      from,
      to,
      date,
      time,
      adults: Number(req.body.adults) || 1,
      children: Number(req.body.children) || 0,
    };
    // --- NOVÝ PROMPT ---
    // --- /NOVÝ PROMPT ---
    const openAIResponse = await sendTripScoringRequest(userInput, trips);
    if (
      openAIResponse &&
      typeof openAIResponse === "object" &&
      "data" in openAIResponse
    ) {
      tripsToSend = (openAIResponse as { data: unknown }).data as TripOption[];
      usedAI = true;
    }
  } catch (err) {
    console.log("[OpenAI Fallback] ERROR:", err);
  }

  // Logovanie výsledných dát do konzoly servera
  console.log(
    "[tripCpScrapeController] Posielam trips na FE:",
    JSON.stringify(tripsToSend, null, 2),
    usedAI ? "[AI Fallback]" : "[RAW SCRAPER]"
  );

  // 6. Odošli výsledok na FE
  res.status(200).json({
    message: "Scraped trips",
    data: tripsToSend,
    ai: aiResult,
    usedAI,
  });
}
