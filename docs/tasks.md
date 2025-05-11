<!-- cSpell: disable -->

---

### 📄 `docs/TASKS.md`

```md
# ✅ TASKS – Trip Aggregator Demo App

---

## 🔹 Fáza 1 – Inicializácia a UI

- [x] Vytvoriť React + Vite projekt s TypeScript
- [X ] Vytvoriť komponentu `TripForm`
  - [x] Input: `odkiaľ`, `kam`
  - [x] `dátum`, `čas`
  - [x] `počet pasažierov`
- [x] Validácia formulára
- [ ] OnSubmit → call `POST /trip/search` (axios)
- [x] Zobrazenie výsledkov tripov
- [x] Vytvoriť komponentu `LogStream` na zobrazenie logov (z WebSocketu)

---

## 🔹 Fáza 2 – Backend + WebSocket

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
- [x] Riešenie CORS (umožnenie komunikácie FE ↔ BE na rôznych portoch)
- [x] Bezpečné spracovanie WebSocket správ na FE (Blob, string)

---

## 🔹 Fáza 3 – Integrácia verejných API

- [ ] Napojenie na **Navitia API** (vlak/bus)
- [ ] Prípadne fallback na TransportAPI alebo Trafiklab
- [ ] Transformácia výsledkov do jednotného formátu `TripOption[]`
- [ ] Zabezpečiť, že pre vlaky sa berú len mestá s vlakovou stanicou

---

## 🔹 Fáza 4 – Finalizácia + UXe

- [ ] Pridať loading stavy, error handling
- [ ] Vykresliť výber spojení (karta pre každý trip)
- [ ] Pridať skórovanie výsledkov (voliteľne cez OpenAI)
- [ ] Odkomunikovať stav frontend ↔ backend cez logy

---

## 🔹 Fáza 5 – Deployment a Docker

- [ ] Dockerfile pre FE (Vite build)
- [ ] Dockerfile pre backend (Node + Express + WebSocket)
- [ ] Docker Compose setup (voliteľné)
- [ ] README pre spustenie projektu

---

## 💡 BONUS: Dev UX

- [ ] Pridať prostredie `.env` pre API kľúče
- [ ] Logger helper (`logStep(msg: string) => socket.send(...)`)

---

## API RESOURCE

API Zameranie URL
Navitia - Bus+Train EU - https://www.navitia.io/

## Nice to Have - Enhancements

- [ ] Pridanie scoringu cez OpenAI
- [ ] Možnosť filtrovať/prepínať medzi bus/vlak
- [ ] Podpora lietadiel/áut/kompatibilita s mapami
- [ ] Dockerizácia a CI/CD

---

## 🧠 Nápady na vylepšenia (brainstorm)

Tu budeme zbierať všetky nápady, ktoré nás napadnú počas vývoja, ale nie sú prioritou v hlavnom checkliste. Môžeme ich kedykoľvek doplniť alebo rozpracovať neskôr.

- Loading stav na Search button (spinner)
- Skutočné napojenie na backend (axios)
- Autocomplete pre inputy (mock/fake)
- Ešte viac UX vychytávok (napr. clear button, copy logy, atď.)
- Auto-scroll logov na posledný záznam
- Tooltipy a help texty pre inputy
- Dark mode prepínač
- Pridať možnosť filtrovať výsledky podľa provideru
- ... (pridávaj ďalšie nápady sem, braško!)
```
