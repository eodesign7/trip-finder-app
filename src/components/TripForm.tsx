import { useState, type Dispatch, type SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { MapPin, CalendarIcon, Users } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import LogPanel from "@/components/LogPanel";
import type { TripOption } from "#/types";

const tripFormSchema = z.object({
  from: z.string().min(2, "Enter at least 2 characters"),
  to: z.string().min(2, "Enter at least 2 characters"),
  date: z.date({ required_error: "Select a date" }),
  adults: z.number().min(1, "At least 1 adult").max(10, "Max 10 adults"),
  children: z.number().min(0, "Cannot be negative").max(10, "Max 10 children"),
});

type TripFormProps = {
  setTrips: Dispatch<SetStateAction<TripOption[]>>;
};

export default function TripForm({ setTrips }: TripFormProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [travelerOpen, setTravelerOpen] = useState(false);
  const [cpLink, setCpLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setCpLink(null);
    console.log("[TripForm] Submit!", { from, to, date, adults, children });

    const result = tripFormSchema.safeParse({
      from,
      to,
      date,
      adults,
      children,
    });

    if (!result.success) {
      const fieldErrors: { [k: string]: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      console.warn("[TripForm] Validation failed", fieldErrors);
      return;
    }

    try {
      const formattedDate = date ? format(date, "d.M.yyyy") : "";
      const formattedTime = date ? format(date, "HH:mm") : "";

      // Uloženie requestu do localStorage
      const prevRequests = JSON.parse(
        localStorage.getItem("tripRequests") || "[]"
      );
      const newRequest = {
        from,
        to,
        date: formattedDate,
        time: formattedTime,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        "tripRequests",
        JSON.stringify([...prevRequests, newRequest])
      );

      // Voláme nový endpoint na scraping cp.sk
      const res = await fetch("http://localhost:3001/trip/cp-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to,
          date: formattedDate,
          time: formattedTime,
          adults,
          children,
        }),
      });

      const data = await res.json();
      console.log("[TripForm] Response from backend", data);
      setTrips(data.data || []);
      setCpLink(null); // Skryjeme link, keďže zobrazujeme tripy
    } catch (err) {
      console.error("[TripForm] Error during fetch", err);
      // Môžeš pridať alert alebo toast pre usera
    }
  };

  return (
    <div className="min-w-full h-full p-4 bg-none">
      <div className="mb-4 text-center mt-4 text-4xl font-normal text-white">
        Let's find your next adventure!
      </div>
      <form
        onSubmit={handleSubmit}
        className="mt-[40px] flex flex-col md:flex-row items-center gap-2 bg-[var(--omio-light)] rounded-xl shadow-lg p-6 w-full min-w-7xl mx-auto"
        aria-label="Trip search form"
      >
        <div className="relative w-full md:w-1/4">
          <label htmlFor="from" className="sr-only">
            From
          </label>
          <Input
            id="from"
            placeholder="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="pl-10 h-12 bg-[var(--omio-white)] rounded-lg"
            tabIndex={1}
            autoFocus
          />
          <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--omio-blue)] w-5 h-5" />
          {errors.from && (
            <div className="text-red-500 text-xs mt-1 ml-2">
              ⚠️ {errors.from}
            </div>
          )}
        </div>
        <div className="w-full md:w-1/4">
          <label htmlFor="to" className="sr-only">
            To
          </label>
          <Input
            id="to"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-12 bg-[var(--omio-white)] rounded-lg"
            tabIndex={2}
          />
          {errors.to && (
            <div className="text-red-500 text-xs mt-1 ml-2 h-12">
              ⚠️ {errors.to}
            </div>
          )}
        </div>
        <div className="w-full md:w-1/4">
          <label htmlFor="date" className="sr-only">
            Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal border border-red-500/75 h-12",
                  date
                    ? "bg-[var(--omio-red)] text-[var(--omio-white)]"
                    : "bg-[var(--omio-white)] text-[var(--omio-blue)]"
                )}
                tabIndex={3}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-[var(--omio-light)]"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="bg-[var(--omio-light)]"
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <div className="text-red-500 text-xs mt-1 ml-2">
              ⚠️ {errors.date}
            </div>
          )}
        </div>
        <div className="w-44">
          <label htmlFor="travelers" className="sr-only">
            Travelers
          </label>
          <Popover open={travelerOpen} onOpenChange={setTravelerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal bg-[var(--omio-white)] text-[var(--omio-blue)] border h-12"
                tabIndex={4}
              >
                <Users className="mr-2 h-4 w-4" />
                {adults} Adults{children > 0 ? `, ${children} Children` : ""}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-56 bg-[var(--omio-light)]"
              align="start"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span>Adults</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-7 h-7"
                    >
                      -
                    </Button>
                    <span>{adults}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => setAdults(Math.min(10, adults + 1))}
                      className="w-7 h-7"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Children</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-7 h-7"
                    >
                      -
                    </Button>
                    <span>{children}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => setChildren(Math.min(10, children + 1))}
                      className="w-7 h-7"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {(errors.adults || errors.children) && (
            <div className="text-red-500 text-xs mt-1 ml-2">
              {errors.adults && <span>⚠️ {errors.adults}</span>}
              {errors.children && (
                <span className="ml-2">⚠️ {errors.children}</span>
              )}
            </div>
          )}
        </div>
        <Button
          type="submit"
          className="bg-[var(--omio-red)] hover:bg-[var(--omio-blue)] text-[var(--omio-white)] font-bold rounded-lg px-6 py-2 shadow border border-red-500/75 h-12"
          tabIndex={5}
        >
          Search
        </Button>
      </form>
      <LogPanel />
      {cpLink && (
        <div className="mt-6 text-center">
          <a
            href={cpLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[var(--omio-blue)] text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-[var(--omio-red)] transition-colors text-lg"
          >
            Zobraziť spojenia na cp.sk 🚂
          </a>
        </div>
      )}
    </div>
  );
}
