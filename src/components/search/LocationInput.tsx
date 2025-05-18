import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface LocationInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
}

// This would typically come from an API
const POPULAR_LOCATIONS = [
  "Nové Zámky, Slovakia",
  "Bratislava, Slovakia",
  "Vienna, Austria",
  "Budapest, Hungary",
  "Prague, Czech Republic",
  "Zurich, Switzerland",
  "Munich, Germany",
  "Berlin, Germany",
  "Paris, France",
  "Amsterdam, Netherlands",
];

export default function LocationInput({
  id,
  value,
  onChange,
  placeholder,
  icon,
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query);

    if (query.length > 1) {
      const filtered = POPULAR_LOCATIONS.filter((location) =>
        location.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (value.length > 1) {
      const filtered = POPULAR_LOCATIONS.filter((location) =>
        location.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
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
          } transition-all duration-300 hover:border-amber-500 focus:border-amber-500`}
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto animate-fade-in">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm transition-colors duration-150"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
