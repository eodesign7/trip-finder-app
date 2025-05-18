import { getCpHtmlFixed } from "./trip.getter";
import { parseTripsFromHtml } from "./trip.constructor";

async function run() {
  const html = await getCpHtmlFixed();
  const today = "18.5."; // uprav podľa reálneho formátu v HTML
  const trips = parseTripsFromHtml(html, today);
  console.log(
    "[test] Výsledok parsovania tripov:",
    JSON.stringify(trips, null, 2)
  );
}

run();
