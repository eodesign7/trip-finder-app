import { Request, Response } from "express";
import { logToAllClients } from "../lib/helpers";
import { GOOGLE_DIRECTIONS_API_KEY } from "../../config/env";
import { tripCpScrapeController } from "./trip.scrapper";

let googleApiCallCount = 0;
let lastReset = new Date().toDateString();
function resetIfNewDay() {
  const today = new Date().toDateString();
  if (today !== lastReset) {
    googleApiCallCount = 0;
    lastReset = today;
  }
}

type GoogleLeg = {
  start_address?: string;
  end_address?: string;
  duration?: { value: number };
  departure_time?: { text: string };
  arrival_time?: { text: string };
  steps?: any[];
};

type GoogleRoute = {
  legs?: GoogleLeg[];
};

export async function tripSearchController(req: Request, res: Response) {
  // Prepojíme na náš scrapper controller
  return await tripCpScrapeController(req, res);
}
