import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Route,
  Clock,
  Train,
  Bus,
  MapPin,
  ArrowRight,
  CircleArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TripOption, TripSegment } from "../../../types";

type AdvancedTripCardProps = {
  trip: TripOption;
  isDemo?: boolean;
};

export default function AdvancedTripCard({
  trip,
  isDemo = true,
}: AdvancedTripCardProps) {
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
      <Card className="overflow-hidden border-sky-100 hover:shadow-lg transition-all duration-300">
        {/* Trip overview section */}
        <div className="relative border-b border-sky-100">
          {isDemo && (
            <div className="absolute top-0 right-0 z-10">
              <Badge className="bg-gradient-to-r from-sky-500 to-sky-700 text-white px-3 py-1">
                Demo
              </Badge>
            </div>
          )}

          <div className="bg-gradient-to-r from-sky-50 to-sky-100 p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <div className="flex items-center">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-3 h-3 bg-sky-500 rounded-full z-10" />
                        <div className="w-0.5 h-12 bg-sky-300 my-1" />
                        <div className="w-3 h-3 bg-sky-500 rounded-full z-10" />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col mb-6">
                          <div className="text-sm text-sky-500 font-medium">
                            {from.time}
                            {date && (
                              <span className="ml-2 text-xs text-sky-400">
                                {date}
                              </span>
                            )}
                          </div>
                          <div className="text-lg font-bold text-sky-700">
                            {from.city}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="text-sm text-sky-500 font-medium">
                            {to.time}
                          </div>
                          <div className="text-lg font-bold text-sky-700">
                            {to.city}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 md:ml-10 text-right flex-shrink-0">
                    <div className="text-sm text-sky-500 mb-1">
                      <Clock className="inline-block h-4 w-4 mr-1" />
                      {formatDuration(duration)}
                    </div>
                    <div className="flex items-center flex-wrap justify-end gap-2">
                      {segments.map((segment, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-white border-sky-200"
                        >
                          <SegmentIcon type={segment.type} />
                          <span className="ml-1">{segment.provider}</span>
                        </Badge>
                      ))}
                    </div>
                    {/* CO2 badge placeholder, ak máš CO2 v TripOption, zobraz */}
                  </div>
                </div>
              </div>
              <div className="md:ml-8 mt-4 md:mt-0 flex flex-col items-end justify-center">
                <div className="text-3xl font-bold text-sky-600">
                  € {typeof totalPrice === "number" ? totalPrice : price}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-sky-500 border-sky-300 hover:bg-sky-50"
                >
                  {isExpanded ? "Hide details" : "Show details"}
                </Button>
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
              <div className="p-5">
                <h4 className="text-sky-700 font-semibold mb-4 flex items-center">
                  <Route className="mr-2 h-5 w-5" />
                  Trip details
                </h4>
                <div className="space-y-6">
                  {segments.map((segment, idx) => (
                    <React.Fragment key={idx}>
                      <div className="relative">
                        {/* Connecting line */}
                        {idx < segments.length - 1 && (
                          <div className="absolute left-3 top-14 w-0.5 h-12 bg-sky-200 z-0" />
                        )}
                        <div className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                segment.type === "train"
                                  ? "bg-sky-100 text-sky-600"
                                  : segment.type === "bus"
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              <SegmentIcon type={segment.type} />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-sky-700">
                                  {segment.provider}
                                </div>
                                <div className="text-sm text-sky-500 mt-1">
                                  {segment.type.charAt(0).toUpperCase() +
                                    segment.type.slice(1)}
                                  {segment.line ? ` • ${segment.line}` : ""} •{" "}
                                  {segment.stops.length} stops
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-4">
                              <div className="flex items-start">
                                <div className="mr-2 mt-1">
                                  <div className="w-2 h-2 rounded-full bg-sky-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-sky-700">
                                    {segment.stops[0]?.time}
                                  </div>
                                  <div className="text-sm text-sky-500">
                                    {segment.stops[0]?.station}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <div className="mr-2 mt-1">
                                  <div className="w-2 h-2 rounded-full bg-sky-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-sky-700">
                                    {
                                      segment.stops[segment.stops.length - 1]
                                        ?.time
                                    }
                                  </div>
                                  <div className="text-sm text-sky-500">
                                    {
                                      segment.stops[segment.stops.length - 1]
                                        ?.station
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Station change indicator (ak treba) */}
                      {idx < segments.length - 1 && (
                        <div className="ml-10 -my-2 py-4">
                          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                            <div className="flex items-center mb-2">
                              <MapPin className="h-4 w-4 text-amber-700 mr-2" />
                              <span className="text-amber-700 font-medium">
                                Station change required
                              </span>
                            </div>
                            {/* Ak máš transit options, zobraz ich tu */}
                            {/* ...prípadne ďalšie info podľa potreby... */}
                            <div className="text-xs text-amber-700 mt-2">
                              * Transit time is included in the total journey
                              time
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button className="bg-sky-600 hover:bg-sky-700 text-white">
                    Select this route
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
