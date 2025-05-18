import puppeteer from "puppeteer";

export async function getCpHtmlFixed() {
  const url =
    "https://cp.sk/vlakbus/spojenie/vysledky/?f=Dubn%C3%ADk&fc=1&t=Bratislava&tc=1";
  console.log(`[getter] Otváram fixnú stránku: ${url}`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  console.log("[getter] Čakám 7 sekúnd na natiahnutie cien...");
  await new Promise((res) => setTimeout(res, 7000));
  console.log("[getter] Čakanie dokončené, scrapujem tripy...");

  // Debug: vypíš počet a texty všetkých .price-value elementov
  const priceDebug = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll(".price-value"));
    return {
      count: els.length,
      texts: els.map((e) => e.textContent?.trim()),
    };
  });
  if (priceDebug.count === 0) {
    console.warn("[getter] Nebol nájdený žiadny .price-value element!");
  } else {
    console.log(
      `[getter] Našiel som ${priceDebug.count} .price-value elementov:`,
      priceDebug.texts
    );
  }

  // Klikaj max 2x na "Neskoršie spojenie"
  for (let i = 0; i < 2; i++) {
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
      const allLinks = await page.$$("a");
      const idx = nextLinks[0];
      try {
        await allLinks[idx].click({ delay: 100 });
        await new Promise((res) => setTimeout(res, 1500));
        console.log(`[getter] Klikol som na 'Neskoršie spojenie' #${i + 1}`);
      } catch (err) {
        console.log(`[getter] Klik na 'Neskoršie spojenie' zlyhal:`, err);
        break;
      }
    } else {
      break;
    }
  }

  // Scrapuj HTML všetkých trip boxov (už aj s cenami)
  const html = await page.content();

  // Debug: vypíš ceny z každého trip boxu
  const prices = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".box.connection.detail-box")
    ).map((box, i) => {
      const priceEl = box.querySelector(".price-value");
      const priceText =
        priceEl?.textContent?.replace(/\s+/g, " ").trim() || null;
      if (!priceText) {
        // eslint-disable-next-line no-console
        console.warn(`[getter] [Trip #${i + 1}] Cena nebola nájdená!`);
      }
      return priceText;
    });
  });
  console.log("[getter] Ceny tripov:", prices);

  await browser.close();
  console.log(`[getter] Puppeteer zavretý, HTML pripravené.`);
  return html;
}
