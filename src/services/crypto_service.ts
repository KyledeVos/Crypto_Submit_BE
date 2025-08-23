/**
 * @module server.ts
 * This module is used to make 3rd Part API calls for cryto currency data
 */
import express from 'express'
import dotenv from 'dotenv'

dotenv.config();
// create a seperate express server for these connections
const crypto_express = express();

// todo - need to get symbols from a table

// define endpoints
const latest_data_base = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"

export const getLatestData = async () => {
    if (process.env.COIN_API_KEY)
    fetch(latest_data_base + "?symbol=BTC", {
        method: "GET",
        headers: {
            "PRO_API_KEY": process.env.COIN_API_KEY
        }
    }).then((response) => {
        return response.json()
    }).then((data) => {
        console.log("received", data.data)
    }).catch((error)=>{
        console.log("error", error)
    })
}