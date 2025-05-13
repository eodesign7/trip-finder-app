declare global {
  type TripOption = {
    from: { time: string; station: string; city: string };
    to: { time: string; station: string; city: string };
    duration: number;
    icon: string;
    provider: { name: string; url: string };
    line: string;
    segments: Array<{
      type?: string;
      from?: string;
      to?: string;
      line?: string;
      provider?: string;
    }>;
  };

  type GoogleStep = {
    travel_mode?: string;
    transit_details?: {
      line?: {
        agencies?: { name?: string; url?: string }[];
        short_name?: string;
        vehicle?: { type?: string };
      };
      departure_stop?: { name?: string };
      arrival_stop?: { name?: string };
      num_stops?: number;
    };
  };

  type GoogleLeg = {
    start_address?: string;
    end_address?: string;
    duration?: { value: number };
    departure_time?: { text: string };
    arrival_time?: { text: string };
    steps?: GoogleStep[];
  };

  type GoogleRoute = {
    legs?: GoogleLeg[];
  };

  type LogEntry = {
    time: string;
    status: number;
    message: string;
    duration?: string | null;
  };
}

export {};
