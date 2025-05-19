// cSpell:disable

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar as CalendarIcon,
  Users,
  Locate,
  ArrowRight,
  Loader2,
  Clock,
  ArrowRightToLine,
  ArrowRightFromLine,
  ArrowRightLeft,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import type { TripAiScore, TripOption } from "types";
import TimePicker from "@/components/ui/TimePicker";
import { getCurrentLocation } from "@/utils/location";
import LocationInput from "@/components/search/LocationInput";
import { useTripSearch } from "./useTripSearch";

type SearchFormProps = {
  setTrips: React.Dispatch<React.SetStateAction<TripOption[]>>;
  setIsLoading: (loading: boolean) => void;
  setAiSummary: (summary: string) => void;
  setAiScores: (scores: TripAiScore[]) => void;
};

export default function SearchForm({
  setTrips,
  setIsLoading,
  setAiSummary,
  setAiScores,
}: SearchFormProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const defaultTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const [date, setDate] = useState<Date>(now);
  const [departureTime, setDepartureTime] = useState<string>(defaultTime);
  const [adults, setAdults] = useState(1);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const { handleSearch, isLoading } = useTripSearch();

  return (
    <Card className="border-0 shadow-xl overflow-hidden bg-white min-h-[240px] lg:min-w-4xl">
      <CardContent className="p-6 relative z-10 min-w-[240px]">
        <form
          onSubmit={(e) =>
            handleSearch(
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
              },
              e
            )
          }
          className="space-y-6"
        >
          {/* Top Row - From and To */}
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex-1">
              <LocationInput
                id="from"
                placeholder="Odkiaľ?..."
                value={from}
                onChange={setFrom}
                icon={
                  <ArrowRightFromLine className="h-4 w-4 text-orange-500" />
                }
                rightIcon={
                  isDetectingLocation ? (
                    <span className="animate-spin text-neutral-500">⏳</span>
                  ) : (
                    <span
                      onClick={() =>
                        !isDetectingLocation &&
                        getCurrentLocation(
                          setFrom,
                          setIsDetectingLocation,
                          toast
                        )
                      }
                      title="Zisti moju polohu"
                      className={
                        isDetectingLocation
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    >
                      <Locate className="h-4 w-4 text-neutral-500 hover:text-orange-600 transition-colors" />
                    </span>
                  )
                }
              />
            </div>

            {/* Switch directions from -  to */}
            <div className="flex items-center justify-center">
              <ArrowRightLeft
                className="h-4 w-4 text-orange-500 cursor-pointer hover:scale-110 transition-transform"
                onClick={() => {
                  const tmp = from;
                  setFrom(to);
                  setTo(tmp);
                }}
              />
            </div>
            <div className="flex-1">
              <LocationInput
                id="to"
                placeholder="Kam?..."
                value={to}
                onChange={setTo}
                icon={<ArrowRightToLine className="h-4 w-4 text-orange-500" />}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {/* Date */}
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50 transition-all text-muted-foreground",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 w-4 text-orange-500" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className={cn(
                      "p-3 pointer-events-auto border-2 border-orange-100 rounded-md bg-white"
                    )}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Departure Time */}
            <div className="space-y-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
                  <Clock className="h-4 w-4" />
                </span>
                <TimePicker value={departureTime} onChange={setDepartureTime} />
              </div>
            </div>

            {/* Adults */}
            <div className="space-y-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
                  <Users className="h-4 w-4" />
                </span>
                <Input
                  id="adults"
                  type="number"
                  min={1}
                  max={10}
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  placeholder="Počet osôb"
                  className="pl-10 transition-all duration-300 hover:border-orange-400 focus:border-orange-400 bg-white text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-6 py-3 h-auto transform hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-xl group flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : null}
            {isLoading ? "Hľadám spoje..." : "Vyhľadať spoje"}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
