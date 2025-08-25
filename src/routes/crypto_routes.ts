import { Router } from "express";

const cryptoRouter = Router()
import {summaryDataController} from "../controllers/route_controllers/crypto_route_controller"

// ========================================================
// GET ROUTES

// Get Crypto Summary Data
cryptoRouter.get("/summaryData", async (req, res) => {
    summaryDataController(req, res)
})

export default cryptoRouter 