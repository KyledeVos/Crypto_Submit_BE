import { Router } from "express";

const userRouter = Router()
import { summaryDataRetrieval, latestDataRetrieval, latestDataAllRetrieval } from "../controllers/route_controllers/crypto_route_controller"
import {generalRouteMiddleWare} from "../middleware/route_middleware"
// ========================================================
// GET ROUTES

// Get Crypto Summary Data
userRouter.post("/signUp", async (req, res) => {
    console.log("HIT")
    console.log("sign_up", req.body)
    res.status(200).json()
})


export default userRouter 