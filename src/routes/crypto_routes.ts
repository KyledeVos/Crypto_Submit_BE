import { Router } from "express";

const cryptoRouter = Router()

// GET ROUTES
cryptoRouter.get("/summaryData", (req, res) => {
    console.log("hit summary")
})

export default cryptoRouter 