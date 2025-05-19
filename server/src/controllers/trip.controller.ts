import { Request, Response } from "express";
import { tripCpScrapeController } from "./trip.scrapper";

export async function tripSearchController(req: Request, res: Response) {
  return await tripCpScrapeController(req, res);
}
