import { useState, useRef, useEffect } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number>(
    Number(value.split(":")[0]) || new Date().getHours()
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(
    Number(value.split(":")[1]) || new Date().getMinutes()
  );
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && pickerRef.current) {
      const hourEl = pickerRef.current.querySelector(
        `.hour[data-value='${selectedHour}']`
      ) as HTMLElement;
      const minEl = pickerRef.current.querySelector(
        `.minute[data-value='${selectedMinute}']`
      ) as HTMLElement;
      hourEl?.scrollIntoView({ block: "center" });
      minEl?.scrollIntoView({ block: "center" });
    }
  }, [open, selectedHour, selectedMinute]);

  useEffect(() => {
    if (!open) {
      setSelectedHour(Number(value.split(":")[0]) || new Date().getHours());
      setSelectedMinute(Number(value.split(":")[1]) || new Date().getMinutes());
    }
  }, [open, value]);

  const handleSelect = (h: number, m: number) => {
    onChange(
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    );
    setOpen(false);
  };

  return (
    <div className="w-full relative">
      <Label htmlFor="time-picker-btn" className="sr-only">
        Select time
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="time-picker-btn"
            variant="outline"
            className="w-full justify-start text-left font-normal border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50 transition-all text-md text-muted-foreground px-3 py-2 pl-10"
            aria-label="Select time"
          >
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
              <Clock className="h-4 w-4" />
            </span>
            {`${selectedHour.toString().padStart(2, "0")}:${selectedMinute
              .toString()
              .padStart(2, "0")}`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto z-50" align="start">
          <div
            ref={pickerRef}
            className="flex rounded-2xl bg-white shadow-2xl border border-orange-100 overflow-hidden animate-fade-in min-w-[200px]"
          >
            {/* Hours */}
            <div className="flex flex-col max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-100 scrollbar-track-white">
              {hours.map((h) => (
                <button
                  key={h}
                  className={`hour px-6 py-2 my-1 mx-1 rounded-lg text-md text-center transition-all duration-150
                    ${
                      h === selectedHour
                        ? "bg-orange-50 text-orange-600 font-bold shadow-sm"
                        : "text-gray-700 hover:bg-orange-100 hover:text-orange-600"
                    }
                    focus:bg-orange-200 outline-none`}
                  data-value={h}
                  data-active={h === selectedHour}
                  onClick={() => {
                    setSelectedHour(h);
                    handleSelect(h, selectedMinute);
                  }}
                  tabIndex={0}
                  type="button"
                >
                  {h.toString().padStart(2, "0")}
                </button>
              ))}
            </div>
            {/* Minutes */}
            <div className="flex flex-col max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-100 scrollbar-track-white border-l border-orange-100">
              {minutes.map((m) => (
                <button
                  key={m}
                  className={`minute px-6 py-2 my-1 mx-1 rounded-lg text-lg text-center transition-all duration-150
                    ${
                      m === selectedMinute
                        ? "bg-orange-50 text-orange-600 font-bold shadow-sm"
                        : "text-gray-700 hover:bg-orange-100 hover:text-orange-600"
                    }
                    focus:bg-orange-200 outline-none`}
                  data-value={m}
                  data-active={m === selectedMinute}
                  onClick={() => {
                    setSelectedMinute(m);
                    handleSelect(selectedHour, m);
                  }}
                  tabIndex={0}
                  type="button"
                >
                  {m.toString().padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
