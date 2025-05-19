import { useState } from "react";
import { format } from "date-fns";
import { extractCity } from "@/utils/extractCity";
import { toast } from "@/hooks/use-toast";
import type { TripOption, TripAiScore } from "types";

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
    }: UseTripSearchProps,
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!from || !to || !date) {
      toast({
        title: "Missing information",
        description:
          "Please fill in all required fields (From, To, Date, Time)",
        variant: "destructive",
      });
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
        toast({
          title: "Žiadne spoje nenájdené",
          description:
            "Na zvolený dátum a čas nie sú dostupné žiadne spoje. Skús iný čas alebo deň.",
          variant: "destructive",
        });
        setTrips([]);
        setAiSummary("");
        setAiScores([]);
        return;
      }
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch trips");
      }
      setTrips(data.data || []);
      setAiSummary(data.ai?.summary || "");
      setAiScores(data.ai?.scores || []);
    } catch (error: unknown) {
      let description = "Unable to fetch trips";
      if (error && typeof error === "object" && "message" in error) {
        description = String((error as { message?: string }).message);
      }
      toast({
        title: "Trip search failed",
        description,
        variant: "destructive",
      });
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  }

  return { handleSearch, isLoading };
}
