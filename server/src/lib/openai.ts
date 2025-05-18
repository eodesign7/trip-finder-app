import type { TripOption } from "../../../types";

export type TripUserInput = {
  from: string;
  to: string;
  date: string;
  time: string;
  adults: number;
  children: number;
};

export type TripAiScore = {
  index: number;
  fast: number;
  cheap: number;
  comfy: number;
};

export type TripAiResult = {
  scores: TripAiScore[];
  summary: string;
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY nie je nastavený v .env");
}

/**
 * Pošle user input a trips do OpenAI, vráti skóre a sumarizáciu.
 */
export async function sendTripScoringRequest(
  userInput: TripUserInput,
  trips: TripOption[]
): Promise<TripAiResult> {
  const prompt = `Si špičkový slovenský travel expert. Na základe vstupu užívateľa a zoznamu spojení mu odporuč najlepší spoj.
Odpovedz stručne, jasne a konkrétne, ako by si radil kamarátovi:
- Napíš presne, kde má nastúpiť (názov stanice, čas).
- Ak treba prestupovať, napíš kde vystúpiť, koľko pešo (odhadni podľa segmentov typu WALK), kde nastúpiť na ďalší spoj a kedy.
- Ak je spoj priamy (žiadny prestup), zvýrazni to: "Ide o priame spojenie, nemusíš prestupovať."
- Ak je prestup, popíš ho ľudsky: "Vystúp na stanici X, prejdi pešo Y minút, nastúp na vlak/bus Z."
- Ak je spoj známy svojou spoľahlivosťou (napr. RegioJet, Metropolitan), pridaj tip: "Tento spoj je známy svojou spoľahlivosťou."
- Odpoveď formuluj ako pre kamaráta, nie ako suchý robot.

Príklad odpovede:
"Chod na autobus z Dubnika, námestie o 15:25, vystúp na Strekov, žel. st. o 15:40, prejdi pešo na vlakovú stanicu (cca 5 minút), nastúp na rýchlik Metropolitan o 17:03, ktorý zvyčajne chodí načas. Vystúp v Bratislave hl. st. o 17:55. Takto to máš najrýchlejšie a bez komplikácií."

Ak je viac možností, odporuč tú najlepšiu a vysvetli prečo.

Vstup užívateľa:
${JSON.stringify(userInput, null, 2)}

Spoje (TripOption[]):
${JSON.stringify(trips, null, 2)}

Odpoveď vráť v tomto JSON formáte:
{
  "scores": [
    { "index": 0, "fast": 80, "cheap": 60, "comfy": 90 },
    ...
  ],
  "summary": "..."
}`;

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Si špičkový slovenský cestovateľský asistent.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 600,
    }),
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  try {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);
    return JSON.parse(jsonString);
  } catch {
    throw new Error("Nepodarilo sa parsovať JSON z OpenAI odpovede: " + text);
  }
}
