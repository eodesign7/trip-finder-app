# Dokumentácia projektu Trip Finder App

## Edge case: Čas v minulosti pri vyhľadávaní spojenia

**Problém:**
Ak používateľ zvolí čas odchodu, ktorý je v minulosti (napr. medzi načítaním stránky a odoslaním formulára sa čas posunie), backend vráti prázdny výsledok alebo error, lebo spojenie v minulosti neexistuje.

**Riešenie:**
Pri submitovaní formulára na klientovi kontrolujeme, či je zvolený čas v minulosti. Ak áno, automaticky posunieme čas na najbližšiu možnú minútu (aktuálny čas +1 minúta) a až potom odošleme request. Týmto predídeme frustrácii používateľa a zbytočným requestom na backend.

**Implementácia:**

- Porovnáme zvolený dátum+čas s aktuálnym časom.
- Ak je v minulosti, nastavíme čas na aktuálny čas +1 minúta.
- Do requestu posielame už upravený čas.

Tento edge case je dôležité riešiť pre robustnosť a UX aplikácie.

--- Sem pisat Docs => Notion Page link do href dokumentacie

# .Trips - Docs

### TECH STACK

React + Vite + Shadcn ⇒ Nodejs + Express + Websocket + Cherrio/Puppeteer + OpenAi + Zod + Typescript

## Hlavne funkcie

---

### FRONTEND

React 19 - Tailwindcss - Shadcn - Framer Motion - Zod - Typescript

1. App (Root)
2. SearchForm
   - Formulár na vyhľadávanie spojov – obsahuje inputy pre Odkiaľ, Kam, dátum, čas, počet osôb, prepínač smeru, a submit button. Obsahuje aj Location Input s autocomplete a geolokáciou.
3. Log Panel
   - Websocket spojenie pre real-time komunikáciu logov/krokov zo serveru. Zobrazuje čas, status, správu, duration a farebne rozlišuje logy podľa statusu (200/400/500/other). Vhodné na debugging aj pre tých, čo nemajú prístup k serveru.
4. TripResults
   - Zobrazuje výsledky vyhľadávania spojov vo forme kariet. Podporuje loading stav, fallback na "žiadne spoje", a zobrazenie AI scoringu. Karty sú zalamované do gridu (2 na riadok na desktope, 1 na mobile).
5. Ai Summary
   - Zobrazuje odporúčanie a sumarizáciu od AI (OpenAI) na základe vyhľadaných spojov. Pomáha užívateľovi rýchlo pochopiť, ktorý spoj je najlepší a prečo.
6. Fallback – nie sú na dnes žiadne tripy

--- Komponenty

### App.tsx

**Root komponent aplikácie.**

- Rieši layout, hero sekciu, gradient, hlavný obsah, log panel, AI summary, výsledky vyhľadávania a footer.
- Orchestruje globálny stav: trips, loading, AI summary, AI scoring, log panel, hasSearched.
- Posúva settery do podkomponentov (SearchForm, TripResults, LogPanel).
- Footer obsahuje odkazy na GitHub a dokumentáciu.

**Použitie:**  
Vždy ako root v index.tsx alebo main.tsx.

**Vstupy/výstupy:**

- Nemá props, všetko je interne cez useState.
- Posúva settery do podkomponentov.

### SearchForm.tsx

**Formulár na vyhľadávanie spojov.**

- Obsahuje inputy pre: Odkiaľ (autocomplete, geolokácia), Kam (autocomplete), dátum, čas, počet osôb.
- Prepínač smeru (swap Odkiaľ/Kam).
- Submit button s loading stavom.
- Po submitnutí volá hook `useTripSearch` a posúva všetky settery do Appu.
- Validuje vstupy, zobrazuje toasty pri chybách.
- UX: všetko je optimalizované pre rýchle zadanie a pohodlné použitie.

**Použitie:**  
Používa sa v App.tsx ako hlavný vyhľadávací formulár.

**Vstupy/výstupy:**

- Props: setTrips, setIsLoading, setAiSummary, setAiScores, setHasSearched (všetko settery z Appu)
- Výstup: po submitnutí nastavuje výsledky, loading, AI summary, atď.

### LogPanel.tsx

**Panel na zobrazenie real-time logov zo servera.**

- Pripája sa na WebSocket server (`ws://localhost:3001`).
- Zobrazuje každý prijatý log v scrollovateľnom paneli.
- Každý log sa parsuje (ak je JSON), zobrazuje čas, status, správu, duration.
- Farebné rozlíšenie podľa statusu (200/400/500/other).
- Automaticky scrolluje na posledný log.
- Ak nie sú žiadne logy, zobrazí info správu.
- Minimalistický, čistý a zároveň profi vizuál, vhodný na debugging a monitoring aj pre tých, čo nemajú prístup k serveru.

**Použitie:**  
Používa sa v App.tsx, zobrazuje sa po kliknutí na "Zobraz Log".

**Vstupy/výstupy:**

- Nemá props, všetko rieši interne cez useState a WebSocket.
- Výstup: renderuje logy v UI.

### TripResults.tsx

**Komponent na zobrazenie výsledkov vyhľadávania spojov.**

- Zobrazuje každú možnosť spojenia v karte (AdvancedTripCard).
- Podporuje loading stav (spinner).
- Ak nie sú žiadne výsledky, zobrazí fallback správu.
- Zobrazuje AI scoring (rýchlosť, cena, pohodlie) pre každý trip, ak je k dispozícii.
- Karty sú zalamované do gridu (2 na riadok na desktope, 1 na mobile).

**Použitie:**  
Používa sa v App.tsx na zobrazenie výsledkov po vyhľadaní.

**Vstupy/výstupy:**

- Props: trips (pole TripOption), isLoading, aiScores, aiSummary, hasSearched
- Výstup: renderuje karty spojov alebo fallback správu.

### AiSummary.tsx

**Komponent na zobrazenie AI odporúčania a sumarizácie.**

- Zobrazuje textovú správu od AI (OpenAI), ktorá sumarizuje najlepšie spojenie, odporúča konkrétny spoj a vysvetľuje prečo.
- Zobrazuje sa len vtedy, keď je k dispozícii AI summary (teda po úspešnom vyhľadaní spojov).
- Má oranžové podfarbenie, border a je vizuálne oddelený od ostatného obsahu.

**Použitie:**  
Používa sa v App.tsx nad výsledkami vyhľadávania, zobrazuje sa len ak existuje `aiSummary`.

**Vstupy/výstupy:**

- Props: aiSummary (string)
- Výstup: renderuje AI odporúčanie v UI.

---

### **BACKEND**

Node.js - Express - Websocket - Cheerio - Puppeteer - OpenAi - Zod - Typescript

nenasiel som ziadne API, ktore by pokryvali spoje zdarma tak som postavil scrapper, ktory ziskava spojenia z cp.sk

API's

/trip/search - endpoint pre FE

open ai - AI sumarizacia a scoring

### BACKEND – Štruktúra a hlavné súbory

1. **index.ts** – Entry point servera, spúšťa Express, websocket, načítava env.
2. **env** – Konfigurácia prostredia, API kľúče, porty, atď.
3. **routes/trip.routes.ts** – Definuje všetky backend endpointy.
4. **scrapper/trip.getter.ts** – Získava HTML z CP.sk (Puppeteer).
5. **scrapper/trip.constructor.ts** – Parsuje tripy z HTML (Cheerio).
6. **controllers/trip.scrapper.ts** – Orchestruje scraping, parsing, fallbacky, AI scoring, odpovedá FE.
7. **lib/openai.ts** – AI scoring a sumarizácia.
8. **middlewares/validateTripInput.ts** – Validácia vstupov requestu.
9. **lib/helpers.ts** – Pomocné funkcie (logovanie, atď.)
10. **config/** – Ďalšie konfiguračné súbory, ak sú.

Každý súbor bude mať nižšie detailný popis, čo robí, aké má vstupy/výstupy a kde sa používa.

---

### index.ts

**Entry point backend servera.**

- Spúšťa Express server a WebSocket server.
- Načítava env premenné (cez config/env).
- Pridáva CORS a JSON middleware.
- Registruje všetky backend route-y (tripRoutes).
- Spúšťa server na porte z env alebo 3001.
- WebSocket server umožňuje real-time logovanie a komunikáciu s FE.
- Každý nový websocket klient dostane privítaciu správu, loguje sa jeho pripojenie/odpojenie a echo správ.

**Použitie:**

- Spúšťa sa ako hlavný súbor serveru (node src/index.ts alebo cez ts-node).

**Vstupy/výstupy:**

- Vstup: žiadny (spúšťa sa priamo)
- Výstup: HTTP API na porte 3001, WebSocket server na rovnakom porte.

---

### routes/trip.routes.ts

**Definuje všetky backend endpointy pre prácu so spojmi.**

- Vstupná brána pre všetky requesty z FE týkajúce sa vyhľadávania spojov, generovania smart-linku na cp.sk a scraping dát.
- Každý endpoint je jasne oddelený, middleware na validáciu vstupov je aplikovaný len tam, kde treba.
- Tento router sa registruje v `index.ts` ako hlavný backend router.

**Endpointy:**

- `POST /trip/search`  
  → Validuje vstupy (`validateTripInput`), potom volá hlavný controller (`tripSearchController`), ktorý orchestruje scraping, parsing, AI scoring a odpoveď pre FE.

- `POST /trip/cp`  
  → Vygeneruje smart-link na cp.sk podľa vstupných parametrov (bez scraping).

- `POST /trip/cp-scrape`  
  → Priamo spustí scraping a parsing spojov z cp.sk (používa sa interne v controllery).

**Použitie:**  
Registruje sa v `index.ts` cez `app.use(tripRoutes);`.

**Vstupy/výstupy:**

- Vstup: JSON body podľa endpointu (from, to, date, time, atď.)
- Výstup: JSON s výsledkami vyhľadávania, AI scoringom, alebo smart-linkom.

---

### middlewares/validateTripInput.ts

**Middleware na validáciu vstupov pre vyhľadávanie spojov.**

- Používa Zod schému na kontrolu, či request obsahuje všetky potrebné polia (`from`, `to`, `date`, `time`, `adults`).
- Ak niečo chýba alebo je zle, vráti 400 a zoznam chýb.
- Ak je všetko OK, prepíše `req.body` na typovaný objekt a pustí request ďalej.
- Používa sa v route `/trip/search` (pozri routes/trip.routes.ts).

**Vstupy/výstupy:**

- Vstup: `req.body` musí obsahovať:
  - `from` (string)
  - `to` (string)
  - `date` (string)
  - `time` (string)
  - `adults` (number, >=1)
- Výstup pri chybe: HTTP 400 + JSON s chybami, napr.

```json
{
  "message": "Invalid input.",
  "errors": ["From is required", "At least one adult required"]
}
```

- Výstup pri úspechu: request pokračuje na ďalší handler/controller.

---

### controllers/trip.scrapper.ts

**Hlavný orchestrátor backend logiky pre vyhľadávanie spojov.**

- Obsahuje dva hlavné handlery:

  - `tripCpLinkController` – generuje smart-link na cp.sk podľa vstupných parametrov (from, to, date, time).
  - `tripCpScrapeController` – orchestruje celý flow vyhľadávania spojov:
    1. Prijme request z FE (from, to, date, time, adults).
    2. Zaloguje request (aj cez websocket pre FE log panel).
    3. Zavolá Puppeteer getter (`getCpHtmlDynamic`) – scrapne HTML z cp.sk.
    4. Zavolá Cheerio constructor (`parseTripsFromHtml`) – naparsuje tripy z HTML.
    5. Zaloguje počet nájdených tripov a segmentov.
    6. Zavolá OpenAI (`sendTripScoringRequest`) – získa AI scoring a sumarizáciu.
    7. Prebehne server-side validácia nadväznosti segmentov (žiadne rozbité prestupy).
    8. Ak nie sú žiadne tripy, vráti 404 + fallback AI správu.
    9. Ak sú tripy, vráti ich spolu s AI scoringom, summary a info o použitom dátume/čase.
    10. Všetko priebežne loguje cez websocket pre real-time monitoring.

- Všetko je napojené na routes/trip.routes.ts → `/trip/cp` (link), `/trip/cp-scrape` (scrape), `/trip/search` (cez controller).

**Vstupy/výstupy:**

- Vstup: JSON body s `from`, `to`, `date`, `time`, `adults`.
- Výstup:
  - 200: JSON s tripmi, AI scoringom, summary, info o dátume/čase
  - 404: Ak nie sú tripy, fallback správa + AI summary
  - 500: Ak zlyhá scraping/parsing, error správa

**Príklad odpovede:**

```json
{
  "message": "Scraped trips",
  "data": [
    /* TripOption[] */
  ],
  "ai": {
    "scores": [
      /* AI scoring pre každý trip */
    ],
    "summary": "Najlepší spoj je..."
  },
  "fallbackToNextDay": false,
  "usedDate": "2024-06-01",
  "usedTime": "15:00",
  "actualDate": "2024-06-01"
}
```

**Poznámky:**

- Controller je pripravený na rozšírenie (ďalšie scoringy, fallbacky, nové zdroje).
- Všetky logy idú do websocketu, takže FE vie, čo sa deje v reálnom čase.

---

### lib/helpers.ts

**Pomocné funkcie pre backend, hlavne websocket logovanie.**

- `clients` – Set všetkých websocket klientov (FE log panel).
- `logToAllClients(message: string)` – Pošle správu všetkým websocket klientom a vypíše ju do backend konzoly. Používa sa na real-time logovanie krokov, chýb, statusov atď.
- `logStep(message: string, status = 200, extra?)` – Helper na jednoduché websocket logovanie s jednotným formátom. Automaticky pridá čas, status, message a voliteľné extra dáta. Skracuje a zjednodušuje zápis logov v controllery.

**Použitie:**

```ts
logStep("AI scoring...");
logStep("Chyba pri scrapovaní", 500, { error: err });
```

**Vstupy/výstupy:**

- Vstup: message (string), status (number, default 200), extra (ľubovoľný objekt)
- Výstup: JSON log vo formáte `{ status, message, time, ...extra }` cez websocket na FE a do backend konzoly.

---

### scrapper/trip.getter.ts

**Scraper na získavanie HTML výsledkov spojení z cp.sk cez Puppeteer.**

- `getCpHtmlFixed()` – Testovacia funkcia, ktorá vždy scrapuje fixnú trasu Dubník → Bratislava. Vhodné na debugovanie a vývoj.
- `getCpHtmlDynamic({ from, to, date, time })` – Hlavný produkčný scraper. Prijíma vstupné parametre, vygeneruje správny URL na cp.sk, otvorí stránku cez Puppeteer, retry-loop na načítanie cien, kliká na "Neskoršie spojenie" (max 2x), scrapuje HTML všetkých trip boxov.
- Všetky logy idú cez websocket helper `logStep` (real-time monitoring na FE log paneli).
- Debug logy a konzolové výpisy sú odstránené, loguje sa len to, čo je dôležité pre monitoring a debugging.

**Vstupy/výstupy:**

- Vstup: `from`, `to`, `date`, `time` (všetko stringy)
- Výstup: HTML stránky s výsledkami spojení (string)

**Edge case-y:**

- Ak sa ceny nenačítajú do 10 sekúnd, scraper pokračuje s tým, čo má.
- Ak nie je možné kliknúť na "Neskoršie spojenie", loguje warning a pokračuje.
- Ak nie je nájdená cena pre niektorý trip, loguje warning (voliteľne).

**Použitie:**

- Volá sa z controlleru pri každom vyhľadávaní spojov.
- Výsledné HTML sa následne parsuje v `trip.constructor.ts`.

---

### scrapper/trip.constructor.ts

**Parser na konverziu HTML z cp.sk na štruktúrované tripy (TripOption[]).**

- `parseTripsFromHtml(html, today)` – Hlavná funkcia na parsovanie HTML výsledkov spojení.
  - Používa Cheerio na traversovanie DOM-u.
  - Pre každý trip:
    - Skontroluje dátum (parsuje len tripy na správny deň).
    - Zistí čas, stanicu, cenu, segmenty (bus/vlak/walk), provider, zastávky.
    - Všetko uloží do objektu `TripOption`.
  - Nepotrebné debug logy sú odstránené pre maximálnu rýchlosť a čistotu.

**Vstupy/výstupy:**

- Vstup: HTML stránky (string), today (string, dátum na ktorý sa filtruje)
- Výstup: Pole objektov `TripOption[]` (každý trip má from, to, duration, segmenty, cenu, atď.)

**Optimalizácia:**

- Ak trip nie je na správny dátum, je preskočený bez ďalšieho spracovania.
- Robustné parsovanie cien a segmentov (viac fallbackov na rôzne HTML štruktúry).

**Použitie:**

- Volá sa z controlleru po scrapovaní HTML cez getter.
- Výsledok sa posiela na FE a/alebo do AI scoringu.

---

### lib/openai.ts

**AI scoring a sumarizácia spojov cez OpenAI API.**

- Typy:

  - `TripUserInput` – vstup od užívateľa (from, to, date, time, adults)
  - `TripAiScore` – skóre pre každý trip (fast, cheap, comfy)
  - `TripAiResult` – výsledok z AI (scores + summary)

- `sendTripScoringRequest(userInput, trips, isTomorrow?)` – Hlavná funkcia na získanie AI scoringu a sumarizácie:
  - Pripraví prompt pre OpenAI (v slovenčine, s detailnými inštrukciami pre travel experta).
  - Pošle request na OpenAI (model gpt-3.5-turbo).
  - Očakáva odpoveď v JSON formáte (scores + summary).
  - Ak odpoveď nie je validný JSON, vyhodí error.
  - Ak nie je nastavený API key, vyhodí error hneď na začiatku.

**Vstupy/výstupy:**

- Vstup: userInput (objekt), trips (pole TripOption), isTomorrow? (boolean)
- Výstup: objekt `TripAiResult` (scores + summary)
- Pri chybe: vyhodí error (napr. ak nie je validný JSON alebo je problém s API)

**Edge case-y a odporúčania:**

- Ak je tripov príliš veľa, odporúča sa posielať len prvých 5-10 (šetrenie tokenov a rýchlosť odpovede).
- Ak OpenAI vráti error (rate limit, zlý kľúč, sieť), odporúča sa logovať detailne (status, body).
- Prompt je optimalizovaný pre slovenského užívateľa a travel UX.

**Použitie:**

- Volá sa z controlleru po parsovaní tripov.
- Výsledok sa posiela na FE ako AI odporúčanie a scoring.

---
