import { Router } from "express";

const cryptoRouter = Router()
import { summaryDataRetrieval, latestDataRetrieval, latestDataAllRetrieval } from "../controllers/route_controllers/crypto_route_controller"
import {generalRouteMiddleWare} from "../middleware/route_middleware"
// ========================================================
// GET ROUTES

// Get Crypto Summary Data
cryptoRouter.get("/summaryData", generalRouteMiddleWare, async (req, res) => {
    summaryDataRetrieval(req, res)
})

cryptoRouter.post("/latestData", async (req, res) => {
    await latestDataRetrieval(req, res)
})

cryptoRouter.post("/latestDataAll", async(req, res) => {
    console.log("HIT ALL LATEST")
    latestDataAllRetrieval(req, res)
})

export default cryptoRouter 