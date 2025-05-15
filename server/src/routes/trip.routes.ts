import { Router } from "express";
import { validateTripInput } from "../middlewares/validateTripInput";
import { tripSearchController } from "../controllers/trip.controller";
import {
  tripCpLinkController,
  tripCpScrapeController,
} from "../controllers/trip.scrapper";

const router = Router();

router.post("/trip/search", validateTripInput, tripSearchController);
router.post("/trip/cp", tripCpLinkController);
router.post("/trip/cp-scrape", tripCpScrapeController);

export default router;
