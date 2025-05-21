import React from "react";
import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import {
  Route,
  Clock,
  Train,
  Bus,
  CircleArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TripOption, TripSegment } from "../../../types";

type AdvancedTripCardProps = {
  trip: TripOption;
  isDemo?: boolean;
};

export default function AdvancedTripCard({ trip }: AdvancedTripCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const { from, to, duration, segments, price, totalPrice, date } = trip;

  // Helper na formátovanie času (minúty na h:mm)
  const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h > 0 ? h + "h " : ""}${m}min`;
  };

  // Ikona podľa typu segmentu
  const SegmentIcon = ({ type }: { type: TripSegment["type"] }) => {
    if (type === "train") return <Train className="h-4 w-4" />;
    if (type === "bus") return <Bus className="h-4 w-4" />;
    return <CircleArrowRight className="h-4 w-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="mb-6"
    >
      <Card className="overflow-hidden border-sky-100 hover:shadow-lg transition-all duration-300 p-0">
        {/* Trip overview section */}
        <div className="border-b border-sky-100">
          <div className="bg-gradient-to-r from-sky-50 to-sky-100 p-4 h-52">
            <div className="flex justify-between">
              <div className="flex items-stretch">
                {/* Dot Indicator */}
                <div className="flex flex-col items-center justify-between py-1 mr-4">
                  <div className="w-3 h-3 bg-sky-500 rounded-full z-10" />
                  <div className="w-0.5 flex-1 bg-sky-300" />
                  <div className="w-3 h-3 bg-sky-500 rounded-full z-10" />
                </div>
                <div className="flex flex-col justify-between h-full">
                  {/* From */}
                  <div>
                    <div className="text-lg font-bold text-sky-700 text-start">
                      {from.city || from.station}
                    </div>
                    <div className="text-sm text-sky-500 text-start font-medium">
                      {from.time}
                      {date && (
                        <span className="ml-2 text-xs text-sky-400">
                          {date}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* To */}
                  <div>
                    <div className="text-lg font-bold text-sky-700 text-start">
                      {to.city || to.station}
                    </div>
                    <div className="text-sm text-start text-sky-500 font-medium">
                      {to.time}
                      {date && (
                        <span className="ml-2 text-xs text-sky-400">
                          {date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="flex flex-col items-end">
                <div className="text-sm text-sky-500 mb-2">
                  <Clock className="inline-block h-4 w-4 mr-1" />
                  {formatDuration(duration)}
                </div>
                <div className="flex items-center gap-2">
                  {segments.map((segment, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="border-sky-200 text-sky-700"
                    >
                      <SegmentIcon type={segment.type} />
                      <span className="ml-1">{segment.provider}</span>
                    </Badge>
                  ))}
                  {segments.length === 1 && (
                    <Badge className="bg-green-500 text-white ml-2">
                      Priame spojenie
                    </Badge>
                  )}
                </div>

                <div className="mt-16 text-4xl font-bold text-sky-600">
                  {typeof totalPrice === "number" ? totalPrice : price} EUR
                </div>
                <div
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 flex items-center text-sky-400 cursor-pointer"
                >
                  {isExpanded ? "Hide details" : "Show details"}
                  {isExpanded ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trip details section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4">
                <h4 className="text-sky-700 font-semibold mb-4 flex items-center">
                  <Route className="mr-2 h-5 w-5" />
                  Trip details
                </h4>
                <div className="space-y-6">
                  {segments.map((segment, idx) => (
                    <React.Fragment key={idx}>
                      <div className="flex">
                        {/* Indicator column */}
                        <div className="flex flex-col items-center mr-2 mt-2">
                          <div
                            className={`w-3 h-3 aspect-square rounded-full z-10 ${
                              segment.type === "train"
                                ? "bg-sky-500"
                                : segment.type === "bus"
                                ? "bg-orange-500"
                                : "bg-green-500"
                            }`}
                          />

                          <div className="w-0.5 h-full bg-neutral-200" />
                        </div>

                        {/* Segment details */}
                        <div className="flex flex-1">
                          <div className="flex flex-col items-start gap-2">
                            {/* Ikona providera */}
                            <div className="flex gap-2  items-center text-sky-700">
                              <SegmentIcon type={segment.type} />
                              <div className="text-md font-medium">
                                {segment.provider}
                              </div>
                            </div>

                            {/* Type and stops */}
                            <div className="flex items-center justify-between gap-2 w-full">
                              {/* FROM */}
                              <div className="flex flex-col items-start min-w-[140px]">
                                <span className="text-[20px] font-bold text-sky-800">
                                  {segment.stops[0]?.time}
                                </span>
                                <span className="text-base text-start text-sky-700">
                                  {segment.stops[0]?.station}
                                </span>
                              </div>
                              {/* DOTTED LINE + ARROW */}
                              <div className="flex-1 flex items-center mx-4 min-w-[120px]">
                                <svg
                                  className="w-full h-6"
                                  viewBox="0 0 100 24"
                                  fill="none"
                                  preserveAspectRatio="none"
                                >
                                  {/* Dotted line */}
                                  <line
                                    x1="0"
                                    y1="12"
                                    x2="95"
                                    y2="12"
                                    stroke="#38bdf8"
                                    strokeWidth="3"
                                    strokeDasharray="4,6"
                                  />
                                  {/* Arrowhead */}
                                  <polygon
                                    points="95,6 100,12 95,18"
                                    fill="#38bdf8"
                                  />
                                </svg>
                              </div>
                              {/* TO */}
                              <div className="flex flex-col items-start min-w-[140px]">
                                <span className="text-[20px] font-bold text-sky-800">
                                  {
                                    segment.stops[segment.stops.length - 1]
                                      ?.time
                                  }
                                </span>
                                <span className="text-base text-sky-700">
                                  {
                                    segment.stops[segment.stops.length - 1]
                                      ?.station
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
