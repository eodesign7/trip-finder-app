
<!-- cSpell: disable -->

# 🛠️ Trip Aggregator Demo App – PRD

## 🎯 Cieľ projektu

Vytvoriť demonštračný fullstack projekt, ktorý umožňuje používateľovi vyhľadať dostupné spojenia medzi dvoma bodmi (odkiaľ → kam) s ohľadom na dátum, čas a počet pasažierov. Projekt zároveň demonštruje použitie Express backendu, WebSocket komunikácie, a zobrazovanie serverových logov v reálnom čase vo webovom UI.

---

## 🧱 Architektúra

- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Live Logy:** WebSocket (knižnica `ws`)
- **Formáty komunikácie:** JSON (REST), WebSocket stream
- **Deployment:** Docker (v neskoršej fáze)

---

## 🧪 Funkcionalita

### Používateľské rozhranie (UI)

- Formulár: `Odkiaľ`, `Kam`, `Dátum`, `Čas`, `Počet pasažierov`
- Po odoslaní sa formulár zablokuje a čaká na výsledok
- Zobrazia sa:
  - Výsledky (zoznam možných tripov)
  - Logy servera v reálnom čase ako výstup vedľa výsledkov

### Backend

- Endpoint `POST /trip/search`
- Spracuje vstupné dáta, spustí workflow:
  - Zavolá API na vyhľadanie **autobusových** spojení
  - Zavolá API na vyhľadanie **vlakových** spojení
- Poskladá výsledky do jednotného formátu
- Výsledok + realtime logy pošle späť cez WebSocket

---

## 📦 Výstupný formát

```ts
interface TripOption {
  provider: "train" | "bus";
  segments: Segment[];
  totalPrice: number;
  totalDurationMinutes: number;
  scoring?: number;
}
```
