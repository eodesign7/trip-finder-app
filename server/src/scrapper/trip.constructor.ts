import * as cheerio from "cheerio";
import type { TripOption, TripSegment } from "../../../types";

export function parseTripsFromHtml(html: string, today: string): TripOption[] {
  const $ = cheerio.load(html);
  const trips: TripOption[] = [];
  let skipped = 0;
  // --- NOVÁ LOGIKA POROVNÁVANIA DÁTUMOV ---
  // today môže byť "2025-05-18" alebo "18.5.2025" alebo "18.5." atď.
  // Extrahuj d.M. z today
  let todayShort = today;
  if (/^\d{4}-\d{2}-\d{2}$/.test(today)) {
    const [y, m, d] = today.split("-");
    todayShort = `${parseInt(d, 10)}.${parseInt(m, 10)}.`;
  } else if (/^\d{1,2}\.\d{1,2}\./.test(today)) {
    todayShort = today.match(/\d{1,2}\.\d{1,2}\./)?.[0] || today;
  }
  $(".box.connection.detail-box").each((i, el) => {
    // Získaj dátum tripu
    const dateAfter = $(el).find(".date-after").text().trim();
    const dateOnly = dateAfter.match(/\d{1,2}\.\d{1,2}\./)?.[0] || dateAfter;
    if (dateOnly !== todayShort) {
      console.log(
        `[constructor] Trip #${
          i + 1
        } preskočený, nie je na dnešný dátum (${dateAfter} != ${todayShort})`
      );
      skipped++;
      return;
    }
    // Čas odchodu
    const head = $(el).find(".connection-head");
    const departureTime = head
      .find("h2.reset.date")
      .clone()
      .children()
      .remove()
      .end()
      .text()
      .trim();
    // Celkový čas
    const totalDurationText = head.find(".total strong").text().trim();
    let duration = 0;
    const match = totalDurationText.match(/(\d+)\s*hod\s*(\d+)?\s*min/);
    if (match)
      duration = parseInt(match[1] || "0") * 60 + parseInt(match[2] || "0");
    else {
      const minMatch = totalDurationText.match(/(\d+)\s*min/);
      if (minMatch) duration = parseInt(minMatch[1]);
    }
    // Stanica odchodu/príchodu a časy
    const firstStation = $(el)
      .find(".outside-of-popup ul.stations")
      .first()
      .find(".name")
      .first()
      .text()
      .trim();
    const firstTime = $(el)
      .find(".outside-of-popup ul.stations")
      .first()
      .find(".time")
      .first()
      .text()
      .trim();
    const lastStation = $(el)
      .find(".outside-of-popup ul.stations")
      .last()
      .find(".name")
      .last()
      .text()
      .trim();
    const lastTime = $(el)
      .find(".outside-of-popup ul.stations")
      .last()
      .find(".time")
      .last()
      .text()
      .trim();
    // Cena (robustné parsovanie s .first())
    let price = 0;
    let priceText = $(el)
      .find(".price-value")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();
    let priceMatch = priceText.match(/([\d,.]+)\s*EUR/);
    if (priceMatch) price = parseFloat(priceMatch[1].replace(",", "."));
    if (!price) {
      priceText = $(el)
        .find(".connection-expand .basket .price-value")
        .first()
        .text()
        .replace(/\s+/g, " ")
        .trim();
      priceMatch = priceText.match(/([\d,.]+)\s*EUR/);
      if (priceMatch) price = parseFloat(priceMatch[1].replace(",", "."));
    }
    if (!price) {
      priceText = $(el)
        .find(".price")
        .first()
        .text()
        .replace(/\s+/g, " ")
        .trim();
      priceMatch = priceText.match(/([\d,.]+)\s*EUR/);
      if (priceMatch) price = parseFloat(priceMatch[1].replace(",", "."));
    }
    // --- SEGMENTY ---
    const segmentBlocks = $(el).find(
      ".connection-details .outside-of-popup, .connection-details .outside-of-popup--with-link-dist"
    );
    const segments = segmentBlocks
      .map((j, segEl) => {
        // Typ segmentu
        let type: "bus" | "train" | "walk" = "bus";
        let icon: "bus" | "train" | "walk" = "bus";
        const iconText = $(segEl)
          .find(".line-title .tt-icon")
          .text()
          .toLowerCase();
        const titleText = $(segEl)
          .find(".line-title h3 span")
          .text()
          .toLowerCase();
        if (iconText.includes("247") || titleText.includes("bus")) {
          type = "bus";
          icon = "bus";
        } else if (
          iconText.includes("251") ||
          titleText.includes("os") ||
          titleText.includes("ec") ||
          titleText.includes("vlak") ||
          titleText.includes("metropolitan")
        ) {
          type = "train";
          icon = "train";
        } else if ($(segEl).hasClass("outside-of-popup--with-link-dist")) {
          type = "walk";
          icon = "walk";
        }
        // Stanice segmentu
        const ul = $(segEl).find("ul.stations").first();
        const liAll = ul.find("li");
        const fromLi = liAll.filter(".item.active").first();
        const toLi = liAll.filter(".item.active.last").first();
        const from =
          fromLi.find(".name").text().trim() ||
          liAll.first().find(".name").text().trim();
        const to =
          toLi.find(".name").text().trim() ||
          liAll.last().find(".name").text().trim();
        // Zastávky
        const stops = liAll
          .map((_, li) => ({
            time: $(li).find(".time").text().trim(),
            station: $(li).find(".name").text().trim(),
          }))
          .get();
        // Linka a provider
        const line = $(segEl).find(".line-title h3 span").text().trim();
        const provider = $(segEl).find(".line-title .owner span").text().trim();
        return {
          from,
          to,
          type,
          icon,
          line,
          provider,
          stops,
        };
      })
      .get();
    // Log
    console.log(
      `[constructor] Trip #${
        i + 1
      } pridaný: ${departureTime} ${firstStation} → ${lastTime} ${lastStation}, duration: ${duration}min, segments: ${
        segments.length
      }, price: ${price}`
    );
    trips.push({
      from: { time: firstTime, station: firstStation, city: "" },
      to: { time: lastTime, station: lastStation, city: "" },
      duration,
      segments,
      price,
      totalPrice: price,
      adults: 1,
      date: dateAfter,
    });
  });
  console.log(
    `[constructor] Celkovo nájdených tripov: ${trips.length}, preskočených: ${skipped}`
  );
  return trips;
}
