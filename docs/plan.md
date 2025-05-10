# 🚀 Plán projektu – Trip Aggregator Demo App

## Úvod

Staviame demo appku, ktorá ukáže, že vieme makať s moderným stackom, API integráciami, realtime logmi a AI sumarizáciou. Cieľ: prehľadný, robustný a UX-friendly systém na vyhľadávanie spojov (vlak/bus) s logovaním a AI vyhodnotením najlepšej trasy.

---

## Prečo to robíme

- Demonštrujeme skills v architektúre, API, logovaní, UX a AI.
- Klient uvidí, že vieme browser features (geolokácia), moderné UI, realtime logy a AI sumarizáciu.
- Každý krok je jasne logovaný, používateľ má vždy feedback.

---

## Ako to spravíme

### Frontend

- **TripForm**: Inputs (Odkiaľ s MapPin, Kam, Dátum, Čas, Počet osôb – všetko Shadcn UI). Submit → axios na `/trip/search`.
- **LogPanel**: Realtime logy z WebSocketu, loading indikátory, stavové správy.
- **TripResults**: Karty s výsledkami (provider, segmenty, cena, trvanie, scoring).
- **SummaryPanel**: Sumarizácia z OpenAI (krátky text, prečo je dané spojenie najlepšie).

### Backend

- **/trip/search endpoint**: Validácia vstupu, logovanie priebehu (každý krok cez WebSocket), volanie API (vlak/bus), spracovanie výsledkov, warning ak nie je spojenie, scoring (čas, cena, náročnosť), volanie OpenAI na sumarizáciu, odpoveď: TripOption[], sumarizácia, logy.

---

## Mini-checklist

- [ ] Odkiaľ s MapPin (geolokácia)
- [ ] Kam (validácia spojenia)
- [ ] Dátum, čas, počet osôb (Shadcn UI)
- [ ] LogPanel (realtime logy, loading)
- [ ] Výsledky v kartách
- [ ] Sumarizácia cez OpenAI
- [ ] Čistý, udržateľný kód (TS, architektúra, best practices)

---

## Lifehack pre workflow

- Komponenty a logiku si rozdeľ na menšie časti – každý krok testuj samostatne.
- Logy posielaj nielen na FE, ale aj do konzoly na BE – debugging bude easy.
- Ak nemáš OpenAI kľúč, sumarizáciu môžeš mocknúť, nech to demo vyzerá komplet.

---

Sme ready, braško! Poďme na frontend! 🦾
