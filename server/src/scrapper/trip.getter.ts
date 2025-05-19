import puppeteer from "puppeteer";

export async function getCpHtmlFixed() {
  const url =
    "https://cp.sk/vlakbus/spojenie/vysledky/?f=Dubn%C3%ADk&fc=1&t=Bratislava&tc=1";
  console.log(`[getter] Otváram fixnú stránku: ${url}`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  console.log(
    "[getter] Čakám na načítanie cien (retry-loop, max 10 sekúnd)..."
  );
  let tries = 0;
  let found = false;
  let priceDebug: {
    count: number;
    texts: (string | undefined)[];
    htmls?: string[];
  } = { count: 0, texts: [] };
  while (tries < 10 && !found) {
    priceDebug = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll(".price-value"));
      return {
        count: els.length,
        texts: els.map((e) => e.textContent?.trim()),
      };
    });
    if (priceDebug.texts.some((t) => t && t.length > 0)) {
      found = true;
      break;
    }
    await new Promise((res) => setTimeout(res, 1000));
    tries++;
  }
  console.log("[getter] .price-value texts:", priceDebug.texts);

  // Debug: vypíš všetky elementy, ktoré obsahujú cenu v EUR
  const allPrices = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("*"))
      .filter((el) => el.textContent && el.textContent.match(/\d+\s*EUR/))
      .map((el) => el.outerHTML);
  });
  console.log("[getter] Všetky elementy s cenou EUR:", allPrices);

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

export async function getCpHtmlDynamic({
  from,
  to,
  date,
  time,
}: {
  from: string;
  to: string;
  date: string;
  time: string;
}): Promise<string> {
  function encodeCp(text: string) {
    return encodeURIComponent(text);
  }
  // Ak príde yyyy-MM-dd, preformátuj na d.M.yyyy
  function formatDateForCp(date: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [y, m, d] = date.split("-");
      return `${parseInt(d, 10)}.${parseInt(m, 10)}.${y}`;
    }
    return date;
  }
  const url = `https://cp.sk/vlakbus/spojenie/vysledky/?f=${encodeCp(
    from
  )}&t=${encodeCp(to)}&date=${formatDateForCp(date)}&time=${time}&submit=true`;
  console.log(`[getter] Otváram dynamickú stránku: ${url}`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  console.log(
    "[getter] Čakám na načítanie cien (retry-loop, max 10 sekúnd)..."
  );
  let tries = 0;
  let found = false;
  let priceDebug: {
    count: number;
    texts: (string | undefined)[];
    htmls?: string[];
  } = { count: 0, texts: [] };
  while (tries < 10 && !found) {
    priceDebug = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll(".price-value"));
      return {
        count: els.length,
        texts: els.map((e) => e.textContent?.trim()),
      };
    });
    if (priceDebug.texts.some((t) => t && t.length > 0)) {
      found = true;
      break;
    }
    await new Promise((res) => setTimeout(res, 1000));
    tries++;
  }
  console.log("[getter] .price-value texts:", priceDebug.texts);

  // Debug: vypíš všetky elementy, ktoré obsahujú cenu v EUR
  const allPrices = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("*"))
      .filter((el) => el.textContent && el.textContent.match(/\d+\s*EUR/))
      .map((el) => el.outerHTML);
  });
  console.log("[getter] Všetky elementy s cenou EUR:", allPrices);

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
