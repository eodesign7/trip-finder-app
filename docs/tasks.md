<!-- cSpell: disable -->

---

### 📄 `docs/TASKS.md`

```md
# ✅ TASKS – .Trips - Trip Aggregator Demo App

---

## 🔹 Fáza 1 – Inicializácia a UI | 10.5.2025

- [x] Vytvoriť React + Vite projekt s TypeScript
- [x] Vytvoriť komponentu `TripForm`
  - [x] Input: `odkiaľ`, `kam`
  - [x] `dátum`, `čas`
  - [x] `počet pasažierov`
- [x] Validácia formulára
- [x] OnSubmit → call `POST /trip/search` (axios)
- [x] Zobrazenie výsledkov tripov
- [x] Vytvoriť komponentu `LogStream` na zobrazenie logov (z WebSocketu)

---

## 🔹 Fáza 2 – Backend + WebSocket | 11.5.2025

- [x] Inicializovať Node.js + Express + TS projekt (`tsconfig.json`, `nodemon`)
- [x] Endpoint: `POST /trip/search`
  - [x] Validácia vstupu
  - [x] Inicializácia WebSocket spojenia pre daný request
- [x] Implementácia WebSocket servera (`ws`)
- [x] Pripojenie frontend klienta cez `ws://` a prijímanie správ
- [x] V každom kroku logovať priebeh cez `socket.send(...)`

### Bonus: Vylepšenia navyše

- [x] Profesionálna štruktúra projektu (controllers, routes, middlewares, lib/helpers)
- [x] Validácia vstupu pomocou Zod (typovo bezpečná, rozšíriteľná)
- [x] Logovanie všetkých správ aj do backend konzoly (pre debugging a audit)
- [x] Detailné logy s obsahom tripu (odkiaľ, kam, dátum, počet pasažierov)
- [x] Riešenie CORS (umožnenie komunikácie FE ↔ BE na rôznych portoch FE:5173, BE: 3001 )
- [x] Bezpečné spracovanie WebSocket správ na FE (Blob, string)

---

## 🔹 Fáza 3 – Integrácia dostupných API, Webscrapping-u | 13.5.2025

- [x] Endpoint: Google Directions API (transit)
- [x] Zistenie providera z odpovede
- [x] Paralelný scraping cp.sk (puppeteer/cheerio)
- [x] Ak nič, fallback na fakePrice
- [x] Zjednotenie výsledkov do `TripOption[]`
- [x] Rate limiting na serveri
- [x] Backend: Scraper iteruje cez všetky tripy, parsuje segmenty, chôdzu, cenu, vráti TripOption[] (zoznam tripov)

## 🔹 Fáza 3 – Šedá zóna 😱 – cp.sk smart-link & scraping (test)

- [x] Backend generuje link na cp.sk podľa inputu z FE (odkiaľ, kam, dátum, čas, atď.)
- [x] FE zobrazí link na cp.sk (user si vie kliknúť a pozrieť spojenia/ceny)
- [x] (Voliteľne) Backend scrapuje výsledky z cp.sk a posiela FE
- [x] (Voliteľne) FE zobrazuje vyparsované spojenia/ceny priamo v appke

### 🟣 Plán pre scraping cp.sk výsledkov (TripOption[])

- [x] Pridať do requestu aj počet dospelých a detí (adults, children)
- [x] Na backende fetchnúť HTML z cp.sk podľa vygenerovaného linku
- [x] Pomocou cheerio (alebo puppeteer, ak bude treba) vyparsovať všetky spojenia (každý trip)
- [x] Pre každý trip vyparsovať:
  - [x] hlavné segmenty (bus/vlak, nie všetky zastávky)
  - [x] odchod/príchod, stanice, provider, číslo spoja, typ
  - [x] cenu z "Cestovné" sekcie
- [x] Cenu vynásobiť podľa počtu cestujúcich:
  - [x] adults = plná cena × adults
  - [x] children = polovičná cena × children (alebo 0.5 × cena × children)
- [x] Vytvoriť a vrátiť TripOption[] na FE (jeden objekt pre každé spojenie na stránke)
- [x] FE zobrazí tripy v kartách ako doteraz

---

## 🔹 Fáza 4 – Finalizácia + UI/UXe

- [x] Pridať loading stavy, error handling
- [x] Vykresliť výber spojení (karta pre každý trip)
- [x] Pridať skórovanie výsledkov (voliteľne cez OpenAI)
- [x] Odkomunikovať stav frontend ↔ backend cez logy
- [x] Backend: Nový endpoint na AI odporúčanie najlepšieho tripu (OpenAI sumarizácia)
- [x] FE: Zobraziť AI odporúčanie a sumarizáciu tripu
- [x] FE: Auto-complete pre odkial/kam
- [x] FE: Automaticke ziskavanie uzivatelskej polohy(browser)
- [x] FE: Zapracovať komponenty z iného projektu
- [x] README pre spustenie projektu

---

## 🔹 Fáza 4: Optimal – Refaktor scraping logiky (Bratislava → Nové Zámky)

- [x] Rozdeliť scraping na dve vrstvy:
  - [x] `trip.getter.ts` – získava HTML (Puppeteer alebo loader z uloženého HTML)
  - [x] `trip.constructor.ts` – parsuje HTML a vracia TripOption[]
- [x] Pripraviť testovací HTML súbor v projekte (napr. `test-data/cp-bratislava-nove-zamky.html`)
- [x] Pripraviť endpoint/test, ktorý vráti TripOption[] pre túto trasu
- [x] Všetko ladiť len na tejto konkrétnej trase (deterministický input)
- [x] Otestovať, že vieme získať všetky potrebné dáta (segmenty, ceny, provider, atď.)
- [x] Získanie a vyskladanie samostatných segmentov, teda potrebných spojov-prestupov a pod...

**Prečo:**

- Prehľadnosť, testovateľnosť, rýchlejšie iterácie, pripravenosť na ďalšie trasy.

**Ako:**

- Getter = len raw HTML (alebo loader z file)
- Constructor = čisté parsovanie a transformácia na TripOption[]

---

## 💡Fáza 4 BONUS: Dev UX - Enhancements - Brainstorm

- [x] Pridať prostredie `.env` pre API kľúče
- [x] Logger helper (`logStep(msg: string) => socket.send(...)`)
- [x] Pridanie scoringu cez OpenAI
- [x] Loading stav na Search button (spinner)

## 💡Fáza 5: UX / UX - Enhancements - Documentation

- [x] Autocomplete pre inputy (Open Street Map API ?? )
- [x] Ešte viac UX vychytávok (napr. clear button, copy logy, atď.)
- [x] Auto-scroll logov na posledný záznam
- [x] FE: Pridať filtre na trvanie, cenu, priame spojenia (len 1 line-item)
- [x] Prehodenie inputov Odkiaľ/Kam kliknutím na ikonku ArrowRightLeft
- [x] Vylepšiť UI AdvandcedTripCard komponent
- [x] ! trips Vratit, nevolat API, "Hm, vyzera to tak, ze na dnes uz nie su spoje, skus to opat zajtra"
- [ ] Zabavit usera pocas loading stavu... ako???
- [ ] Fallbabk na "Ziadne spoje" ak na dnes nie su spoje - BE Sprava + AI hardcoded sprava
- [ ] Vratit vsetky spoje nie len 3
- [ ] Vymenit hlavny obrazok za vlastny
- [ ] Doplniť dokumentáciu
- [ ] Footer - Copy, Docs, Surce(GitHub Repo)

---

### 🚦 Google Transit + Ceny (custom flow) - Toto som nakoniec reálne nepoužil

- [x] User zadá ➜ Odkiaľ/Kam, Dátum/Čas, Počet pasažierov
- [x] Backend ➜ Google Directions API (`mode=transit`)
- [x] Z výsledku zistiť provider: "FlixBus", "ZSSK", "RegioJet"

---

## 🔹 Fáza 7 – Deploy (Vercel + Render/Railway/Fly.io)

- [ ] **FE (Vercel):**

  - [ ] Deployni frontend (React/Vite) do rootu repa na Vercel.
  - [ ] Skontroluj, že Vercel rozpozná FE build (vite.config.js, package.json scripts).
  - [ ] Pridaj/verifikuj `vercel.json` ak treba custom build alebo rewrites.
  - [ ] Nastav `.env` v root FE s URL na backend (napr. `VITE_API_URL=https://trip-finder-backend.onrender.com`).
  - [ ] Otestuj, že FE volá správne endpointy na BE (aj WebSocket endpoint).

- [ ] **BE (Render/Railway/Fly.io):**

  - [ ] Deployni celý `/server` folder na Render/Railway/Fly.io ako Node.js app.
  - [ ] Skontroluj, že Puppeteer funguje (Render/Railway/Fly.io to podporujú, Heroku nie vždy).
  - [ ] Nastav CORS na FE doménu z Vercelu (aby FE mohol volať BE endpointy a WebSocket).
  - [ ] Pridaj všetky potrebné env premenné (OpenAI key, PORT, atď.).
  - [ ] Otestuj, že WebSocket endpoint funguje (log panel na FE sa pripája).

- [ ] **Komunikácia FE ↔ BE:**

  - [ ] FE volá BE cez HTTP(S) a WebSocket na správnu doménu (z .env).
  - [ ] Otestuj všetky flows: vyhľadávanie, logovanie, fallbacky, AI scoring.

- [ ] **Dokumentácia a README:**

  - [ ] Doplň README s návodom na deploy FE (Vercel) a BE (Render/Railway/Fly.io).
  - [ ] Pridaj info o potrebných env variables a doménach.

- [ ] **Finálny test:**
  - [ ] Otestuj appku na produkčných doménach (FE aj BE).
  - [ ] Skontroluj, že všetko funguje (aj fallbacky, error handling, AI scoring, log panel).

---
```
