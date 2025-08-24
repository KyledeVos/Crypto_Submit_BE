/**
 * @module server.ts
 * This module is used to make 3rd Part API calls for cryto currency data
 */
import dotenv from 'dotenv'

dotenv.config();

// todo - need to get symbols from a table

// define endpoints
const latest_data_base = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"
const crypto_map_symbol_base = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map"

export const getLatestData = async () => {
    if (process.env.COIN_API_KEY)
    fetch(latest_data_base + "?symbol=BTC", {
        method: "GET",
        headers: {
            "X-CMC_PRO_API_KEY": process.env.COIN_API_KEY
        }
    }).then((response) => {
        return response.json()
    }).then((data) => {
        console.log("received", data.data)
    }).catch((error)=>{
        console.log("error", error)
    })
}