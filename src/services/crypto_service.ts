/**
 * @module server.ts
 * This module is used to make 3rd Part API calls for cryto currency data
 */
import dotenv from 'dotenv'
import {cryptoMapDataType} from "../types/crypto_types"
import { response } from 'express';
dotenv.config();

// define endpoints
const latest_data_base = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"
const crypto_map_symbol_base = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map"

/**
 * Retrieves crypto map data (a summary of data for all crypto currencies)
 * @returns status and data for crypto map data, undefined if there is an error
 */
export const getCryptoCurrencyMapData = async() => {

    if (process.env.COIN_API_KEY){
        try{
            const result = await fetch(crypto_map_symbol_base, {
                method: "GET",
                headers: {
                    "X-CMC_PRO_API_KEY": process.env.COIN_API_KEY
                }
            })
            const responseData = await result.json()
            return {status: result.status, data: responseData}
        }catch(error){
            return undefined
        }

    }else{
        return undefined
    }
}

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
        // console.log("received", data.data)
    }).catch((error)=>{
        console.log("error", error)
    })
}