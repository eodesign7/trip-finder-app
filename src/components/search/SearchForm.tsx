import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Locate,
  ArrowRight,
  Loader2,
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
import { Label } from "@/components/ui/label";
import LocationInput from "@/components/search/LocationInput";
import { toast } from "@/hooks/use-toast";
import type { TripOption } from "types";
import TimePicker from "@/components/ui/TimePicker";

type SearchFormProps = {
  setTrips: React.Dispatch<React.SetStateAction<TripOption[]>>;
  setIsLoading: (loading: boolean) => void;
  setAiSummary: (summary: string) => void;
  setAiScores: (scores: any[]) => void;
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
  const [children, setChildren] = useState(0);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isLoading, setLocalLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!from || !to || !date || !departureTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLocalLoading(true);
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/trip/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to,
          date: format(date, "yyyy-MM-dd"),
          time: departureTime,
          adults: Number(adults),
          children: Number(children),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch trips");
      }

      setTrips(data.data || []);
      setAiSummary(data.ai?.summary || "");
      setAiScores(data.ai?.scores || []);

      // Ak chceš navigovať na výsledky, odkomentuj:
      // navigate({
      //   pathname: "/search-results",
      //   search: `?from=${from}&to=${to}&date=${format(date, "yyyy-MM-dd")}&passengers=${passengers}&luggage=${luggage}`,
      // });
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
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location detection",
        variant: "destructive",
      });
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );

          const data = await response.json();
          const locationString = `${data.city || data.locality || "Unknown"}, ${
            data.countryName
          }`;
          setFrom(locationString);

          toast({
            title: "Location detected",
            description: `Found your location: ${locationString}`,
            variant: "default",
          });
        } catch (error: unknown) {
          let description = "Unable to determine your current location";
          if (error && typeof error === "object" && "message" in error) {
            description = String((error as { message?: string }).message);
          }
          toast({
            title: "Location detection failed",
            description: description,
            variant: "destructive",
          });
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error: unknown) => {
        let description = "Unable to determine your current location";
        if (error && typeof error === "object" && "message" in error) {
          description = String((error as { message?: string }).message);
        }
        toast({
          title: "Location access denied",
          description: description,
          variant: "destructive",
        });
        setIsDetectingLocation(false);
      }
    );
  };

  return (
    <Card className="border-0 shadow-xl overflow-hidden bg-white">
      <CardContent className="p-6 relative z-10">
        <form onSubmit={handleSearch} className="space-y-6">
          {/* Top Row - From and To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="from"
                className="font-semibold text-brand-800 flex items-center justify-between"
              >
                <span>From</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-2 text-xs bg-amber-600 text-white hover:text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  onClick={getCurrentLocation}
                  disabled={isDetectingLocation}
                >
                  <Locate className="h-3 w-3 mr-1" />
                  {isDetectingLocation ? "Detecting..." : "My Location"}
                </Button>
              </Label>
              <LocationInput
                id="from"
                placeholder="Departure city"
                value={from}
                onChange={setFrom}
                icon={<MapPin className="h-4 w-4 text-orange-500" />}
              />
            </div>
            <div className="space-y-2 translate-y-4.5">
              <Label htmlFor="to" className="font-semibold text-brand-800">
                To
              </Label>
              <LocationInput
                id="to"
                placeholder="Destination city"
                value={to}
                onChange={setTo}
                icon={<MapPin className="h-4 w-4 text-orange-500" />}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {/* Date */}
            <div className="space-y-2">
              <Label className="font-semibold text-brand-800">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50 transition-all",
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
              <Label className="font-semibold text-brand-800">
                Departure Time
              </Label>
              <TimePicker value={departureTime} onChange={setDepartureTime} />
            </div>
            {/* Adults */}
            <div className="space-y-2">
              <Label
                htmlFor="adults"
                className="font-semibold text-brand-800 flex items-center gap-1"
              >
                <Users className="h-3.5 w-3.5 text-orange-500" /> Adults
              </Label>
              <Input
                id="adults"
                type="number"
                min={1}
                max={10}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                placeholder="Number of adults"
                className="transition-all duration-300 hover:border-orange-400 focus:border-orange-400 bg-white"
              />
            </div>
            {/* Children */}
            <div className="space-y-2">
              <Label
                htmlFor="children"
                className="font-semibold text-brand-800 flex items-center gap-1"
              >
                <Users className="h-3.5 w-3.5 text-orange-300" /> Children
              </Label>
              <Input
                id="children"
                type="number"
                min={0}
                max={10}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                placeholder="Number of children"
                className="transition-all duration-300 hover:border-orange-400 focus:border-orange-400 bg-white"
              />
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
            {isLoading ? "Hľadám spoje..." : "Find Transport"}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
