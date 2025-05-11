import { Router } from "express";
import { validateTripInput } from "../middlewares/validateTripInput";
import { tripSearchController } from "../controllers/trip.controller";

const router = Router();

router.post("/trip/search", validateTripInput, tripSearchController);

export default router;
