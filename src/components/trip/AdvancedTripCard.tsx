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
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface TransitOption {
  type: "walk" | "tram" | "bus" | "metro";
  duration: string;
  stops?: number;
  line?: string;
}

interface RouteSegment {
  type: "train" | "bus";
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  carrier: string;
  platform?: string;
  stationChange?: boolean;
  transitOptions?: TransitOption[];
}

interface AdvancedRideCardProps {
  id: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  totalDuration: string;
  segments: RouteSegment[];
  co2: number;
  totalPrice?: number;
  isDemo?: boolean;
  date?: string;
}

export default function AdvancedRideCard({
  id,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  currency,
  totalDuration,
  segments,
  co2,
  totalPrice,
  isDemo = false,
  date,
}: AdvancedRideCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const SegmentIcon = ({ type }: { type: "train" | "bus" }) =>
    type === "train" ? (
      <Train className="h-4 w-4" />
    ) : (
      <Bus className="h-4 w-4" />
    );

  const TransitIcon = ({
    type,
  }: {
    type: "walk" | "tram" | "bus" | "metro";
  }) => {
    switch (type) {
      case "walk":
        return <CircleArrowRight className="h-4 w-4 text-green-600" />;
      case "tram":
        return <Train className="h-4 w-4 text-purple-600" />;
      case "bus":
        return <Bus className="h-4 w-4 text-blue-600" />;
      case "metro":
        return <Train className="h-4 w-4 text-red-600" />;
      default:
        return <CircleArrowRight className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="mb-6"
    >
      <Card className="overflow-hidden border-navy-100 hover:shadow-lg transition-all duration-300">
        {/* Trip overview section */}
        <div className="relative border-b border-navy-100">
          {isDemo && (
            <div className="absolute top-0 right-0 z-10">
              <Badge className="bg-gradient-to-r from-navy-500 to-navy-700 text-white px-3 py-1">
                Demo
              </Badge>
            </div>
          )}

          <div className="bg-gradient-to-r from-navy-50 to-navy-100 p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <div className="flex items-center">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-3 h-3 bg-navy-500 rounded-full z-10" />
                        <div className="w-0.5 h-12 bg-navy-300 my-1" />
                        <div className="w-3 h-3 bg-navy-500 rounded-full z-10" />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col mb-6">
                          <div className="text-sm text-navy-500 font-medium">
                            {departureTime}
                            {date && (
                              <span className="ml-2 text-xs text-navy-400">
                                {date}
                              </span>
                            )}
                          </div>
                          <div className="text-lg font-bold text-navy-700">
                            {from}
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <div className="text-sm text-navy-500 font-medium">
                            {arrivalTime}
                          </div>
                          <div className="text-lg font-bold text-navy-700">
                            {to}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 md:ml-10 text-right flex-shrink-0">
                    <div className="text-sm text-navy-500 mb-1">
                      <Clock className="inline-block h-4 w-4 mr-1" />
                      {totalDuration}
                    </div>
                    <div className="flex items-center flex-wrap justify-end gap-2">
                      {segments.map((segment, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-white border-navy-200"
                        >
                          <SegmentIcon type={segment.type} />
                          <span className="ml-1">{segment.carrier}</span>
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-green-600 mt-2">
                      {co2} kg CO<sub>2</sub>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:ml-8 mt-4 md:mt-0 flex flex-col items-end justify-center">
                <div className="text-3xl font-bold text-navy-600">
                  {currency}{" "}
                  {typeof totalPrice === "number" ? totalPrice : price}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-navy-500 border-navy-300 hover:bg-navy-50"
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
                <h4 className="text-navy-700 font-semibold mb-4 flex items-center">
                  <Route className="mr-2 h-5 w-5" />
                  Trip details
                </h4>

                <div className="space-y-6">
                  {segments.map((segment, idx) => (
                    <React.Fragment key={idx}>
                      <div className="relative">
                        {/* Connecting line */}
                        {idx < segments.length - 1 && (
                          <div className="absolute left-3 top-14 w-0.5 h-12 bg-navy-200 z-0" />
                        )}

                        <div className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                segment.type === "train"
                                  ? "bg-navy-100 text-navy-600"
                                  : "bg-orange-100 text-orange-600"
                              }`}
                            >
                              <SegmentIcon type={segment.type} />
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-navy-700">
                                  {segment.carrier}
                                </div>
                                <div className="text-sm text-navy-500 mt-1">
                                  {segment.type === "train" ? "Train" : "Bus"} •{" "}
                                  {segment.duration}
                                </div>
                              </div>
                              {segment.platform && (
                                <Badge className="bg-navy-100 text-navy-700 border-none">
                                  Platform {segment.platform}
                                </Badge>
                              )}
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-4">
                              <div className="flex items-start">
                                <div className="mr-2 mt-1">
                                  <div className="w-2 h-2 rounded-full bg-navy-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-navy-700">
                                    {segment.departureTime}
                                  </div>
                                  <div className="text-sm text-navy-500">
                                    {segment.from}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-start">
                                <div className="mr-2 mt-1">
                                  <div className="w-2 h-2 rounded-full bg-navy-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-navy-700">
                                    {segment.arrivalTime}
                                  </div>
                                  <div className="text-sm text-navy-500">
                                    {segment.to}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Station Change indicator with transit options */}
                      {idx < segments.length - 1 &&
                        segments[idx + 1]?.stationChange && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="ml-10 -my-2 py-4"
                          >
                            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                              <div className="flex items-center mb-2">
                                <MapPin className="h-4 w-4 text-amber-700 mr-2" />
                                <span className="text-amber-700 font-medium">
                                  Station change required
                                </span>
                              </div>

                              {segments[idx + 1]?.transitOptions ??
                              [].length > 0 ? (
                                <div className="mt-2 space-y-2">
                                  <div className="text-xs text-amber-700 mb-1">
                                    Transit options:
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(
                                      segments[idx + 1]?.transitOptions ?? []
                                    ).map((option, optIdx) => (
                                      <motion.div
                                        key={optIdx}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: optIdx * 0.1 }}
                                        className="flex items-center bg-white rounded p-2 border border-amber-100"
                                      >
                                        <div className="mr-2">
                                          <TransitIcon type={option.type} />
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-xs font-medium">
                                            {option.type === "walk"
                                              ? "Walking"
                                              : option.type === "tram"
                                              ? `Tram ${option.line}`
                                              : option.type === "bus"
                                              ? `Bus ${option.line}`
                                              : `Metro ${option.line}`}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {option.duration}
                                            {option.stops &&
                                              option.stops > 0 &&
                                              ` • ${option.stops} ${
                                                option.stops === 1
                                                  ? "stop"
                                                  : "stops"
                                              }`}
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>

                                  <motion.div
                                    className="relative mt-3 pt-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                  >
                                    <div className="absolute top-0 left-0 right-0 h-px bg-amber-200"></div>
                                    <div className="text-xs text-amber-600 italic">
                                      * Transit time is included in the total
                                      journey time
                                    </div>
                                  </motion.div>
                                </div>
                              ) : (
                                <div className="text-sm text-amber-700">
                                  Please allow sufficient time for transit
                                  between stations.
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                    </React.Fragment>
                  ))}
                </div>

                <motion.div
                  className="mt-6 flex justify-end"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    asChild
                    className="bg-navy-600 hover:bg-navy-700 text-white"
                  >
                    <Link to={`/transport/${id}`} className="flex items-center">
                      Select this route
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
