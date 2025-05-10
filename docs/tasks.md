
---

### 📄 `docs/TASKS.md`

```md
# ✅ TASKS – Trip Aggregator Demo App

---

## 🔹 Fáza 1 – Inicializácia a UI
- [ ] Vytvoriť React + Vite projekt s TypeScript
- [ ] Vytvoriť komponentu `TripForm`
  - [ ] Input: `odkiaľ`, `kam`
  - [ ] `dátum`, `čas`
  - [ ] `počet pasažierov`
- [ ] Validácia formulára
- [ ] OnSubmit → call `POST /trip/search` (axios)
- [ ] Zobrazenie výsledkov tripov
- [ ] Vytvoriť komponentu `LogStream` na zobrazenie logov (z WebSocketu)

---

## 🔹 Fáza 2 – Backend + WebSocket
- [ ] Inicializovať Node.js + Express + TS projekt (`tsconfig.json`, `nodemon`)
- [ ] Endpoint: `POST /trip/search`
  - [ ] Validácia vstupu
  - [ ] Inicializácia WebSocket spojenia pre daný request
- [ ] Implementácia WebSocket servera (`ws`)
- [ ] Pripojenie frontend klienta cez `ws://` a prijímanie správ
- [ ] V každom kroku logovať priebeh cez `socket.send(...)`

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
API	      Zameranie	     URL
Navitia	- Bus+Train EU - https://www.navitia.io/

## Nice to Have - Enhancements
- [ ] Pridanie scoringu cez OpenAI
- [ ] Možnosť filtrovať/prepínať medzi bus/vlak
- [ ] Podpora lietadiel/áut/kompatibilita s mapami
- [ ] Dockerizácia a CI/CD