import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface LocationInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

type NominatimResult = {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

export default function LocationInput({
  id,
  value,
  onChange,
  placeholder,
  icon,
  rightIcon,
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 400);
  }, [value]);

  async function fetchSuggestions(query: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5`
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setIsOpen(true);
    } catch {
      setSuggestions([]);
      setIsOpen(false);
    }
    setLoading(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelectSuggestion = (suggestion: NominatimResult) => {
    const city = suggestion.display_name.split(",")[0].trim();
    onChange(city);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (value.length > 1 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={inputRef} className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
        )}
        <Input
          id={id}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`${
            icon ? "pl-10" : ""
          } transition-all duration-300 hover:border-amber-500 focus-within:bg-white focus:border-amber-500`}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
            {rightIcon}
          </div>
        )}
        {loading && <div className="absolute right-2 top-2 text-xs">...</div>}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-20 mt-2 w-full bg-white shadow-lg rounded-md border border-gray-200 animate-fade-in">
          {suggestions.map((suggestion, index) => {
            const parts = suggestion.display_name.split(",");
            let region = parts[1]?.replace(/okres/i, "").trim() || "";
            if (region) region = `okr. ${region}`;
            const city = parts[0]?.trim() || "";
            return (
              <div
                key={index}
                className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-start text-sm transition-colors duration-150"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                {city}
                {region && `, ${region}`}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
