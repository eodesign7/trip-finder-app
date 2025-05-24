import { useState } from "react";
import { format } from "date-fns";
import { extractCity } from "@/utils/extractCity";
import type { TripOption, TripAiScore } from "#/types";

interface UseTripSearchProps {
  from: string;
  to: string;
  date: Date;
  departureTime: string;
  adults: number;
  setTrips: React.Dispatch<React.SetStateAction<TripOption[]>>;
  setIsLoading: (loading: boolean) => void;
  setAiSummary: (summary: string) => void;
  setAiScores: (scores: TripAiScore[]) => void;
  setHasSearched: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useTripSearch() {
  const [isLoading, setLocalLoading] = useState(false);

  async function handleSearch(
    {
      from,
      to,
      date,
      departureTime,
      adults,
      setTrips,
      setIsLoading,
      setAiSummary,
      setAiScores,
      setHasSearched,
    }: UseTripSearchProps,
    e: React.FormEvent
  ) {
    e.preventDefault();
    setHasSearched(true);

    if (!from || !to || !date) {
      // alert("Please fill in all required fields (From, To, Date, Time)");
      return;
    }

    const now = new Date();
    let timeToSend = departureTime;
    let dateToSend = date;
    const selectedDate = new Date(date);
    const [h, m] = timeToSend.split(":").map(Number);
    selectedDate.setHours(h, m, 0, 0);
    if (selectedDate < now) {
      now.setSeconds(0, 0);
      now.setMinutes(now.getMinutes() + 1);
      dateToSend = new Date(now);
      timeToSend = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    }

    setLocalLoading(true);
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/trip/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: extractCity(from),
          to: extractCity(to),
          date: format(dateToSend, "yyyy-MM-dd"),
          time: timeToSend,
          adults: Number(adults),
        }),
      });
      const data = await res.json();
      if (res.status === 404) {
        setTrips([]);
        setAiSummary(
          data.ai?.summary || data.message || "Žiadne spoje nenájdené."
        );
        setAiScores([]);
        // alert("Žiadne spoje nenájdené");
        return;
      }
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch trips");
      }
      setTrips(data.data || []);
      setAiSummary(data.ai?.summary || "");
      setAiScores(data.ai?.scores || []);
    } catch (error: unknown) {
      // alert("Unable to fetch trips");
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  }

  return { handleSearch, isLoading };
}
