import { Router } from "express";

const cryptoRouter = Router()
import { summaryDataRetrieval,latestDataRetrieval } from "../controllers/route_controllers/crypto_route_controller"
import {generalRouteMiddleWare} from "../middleware/route_middleware"
// ========================================================
// GET ROUTES

// Get Crypto Summary Data
cryptoRouter.get("/summaryData", generalRouteMiddleWare, async (req, res) => {
    summaryDataRetrieval(req, res)
})

cryptoRouter.post("/latestData", async (req, res) => {
    console.log("HIT latestData")
    console.log(req.body)
    latestDataRetrieval(req, res)
    // default for now
    res.status(200).json()
})

export default cryptoRouter 