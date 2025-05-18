import * as cheerio from "cheerio";
import type { TestTripOption } from "../test/scrapped-trips";

export function parseTripsFromHtml(
  html: string,
  today: string
): TestTripOption[] {
  const $ = cheerio.load(html);
  const trips: TestTripOption[] = [];
  let skipped = 0;
  $(".box.connection.detail-box").each((i, el) => {
    if (trips.length >= 3) return false;
    // Získaj dátum tripu
    const dateAfter = $(el).find(".date-after").text().trim();
    const dateOnly = dateAfter.split(" ")[0];
    if (dateOnly !== today) {
      console.log(
        `[constructor] Trip #${
          i + 1
        } preskočený, nie je na dnešný dátum (${dateAfter} != ${today})`
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
    // Počet segmentov (každý .outside-of-popup alebo .outside-of-popup--with-link-dist)
    const segmentCount = $(el).find(
      ".connection-details .outside-of-popup, .connection-details .outside-of-popup--with-link-dist"
    ).length;
    const segments = Array(segmentCount).fill({});
    // Log
    console.log(
      `[constructor] Trip #${
        i + 1
      } pridaný: ${departureTime} ${firstStation} → ${lastTime} ${lastStation}, duration: ${duration}min, segments: ${segmentCount}, price: ${price}`
    );
    trips.push({
      from: { time: firstTime, station: firstStation, city: "" },
      to: { time: lastTime, station: lastStation, city: "" },
      duration,
      segments,
      price,
      totalPrice: price,
      adults: 1,
      children: 0,
      date: dateAfter,
    });
  });
  console.log(
    `[constructor] Celkovo nájdených tripov: ${trips.length}, preskočených: ${skipped}`
  );
  return trips;
}
