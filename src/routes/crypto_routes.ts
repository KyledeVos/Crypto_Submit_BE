import { Router } from "express";

const cryptoRouter = Router()
import { summaryDataRetrieval } from "../controllers/route_controllers/crypto_route_controller"

// ========================================================
// GET ROUTES

// Get Crypto Summary Data
cryptoRouter.get("/summaryData", async (req, res) => {
    summaryDataRetrieval(req, res)
})

cryptoRouter.post("/latestData", async (req, res) => {
    console.log("HIT latestData")
    console.log(req.body)
    // default for now
    res.status(200).json()
})

export default cryptoRouter 