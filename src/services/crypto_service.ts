/**
 * @module server.ts
 * This module is used to make 3rd Part API calls for cryto currency data
 * @remarks the endpoints have been defined here for central control and quick reference
 */
import dotenv from 'dotenv'
import {cryptoMapDataType, cryptoGeneralResponseType} from "../types/crypto_types"
import { trackLogger } from '../utilities/logger';
import { response } from 'express';
import { error } from 'console';
dotenv.config();

// define endpoints
const latest_data_base = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"
const crypto_map_symbol_base = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map"

/**
 * Retrieves crypto map data (a summary of data for all crypto currencies)
 * @returns status and data for crypto map data, undefined if there is an error
 * @remarks this function performs it's own internal logging for errors
 * @remarks this function logs each call made to the map symbol endpoint
 */
export const getCryptoCurrencyMapData = async():Promise<cryptoGeneralResponseType> => {

    if (process.env.COIN_API_KEY && process.env.COIN_API_KEY !== undefined && process.env.COIN_API_KEY.trim() !== ""){
        try{
            trackLogger({action: "log_file", logType: "info", callFunction: "getCryptoCurrencyMapData", 
                message: "Call Made to get latest crypto map data"})
            const result = await fetch(crypto_map_symbol_base, {
                method: "GET",
                headers: {
                    "X-CMC_PRO_API_KEY": process.env.COIN_API_KEY
                }
            })
            const responseData = await result.json()
            return {status: result.status, data: responseData}
        }catch(error){
            trackLogger({action: "error_file", logType: "error", callFunction: "getCryptoCurrencyMapData", 
                message: `Error occured during data retrieval as: ${error}`})
            return {status: 500, data: undefined}
        }

    }else{
        trackLogger({action: "error_file", logType: "error", callFunction: "getCryptoCurrencyMapData", 
            message: ""})
        return {status: 500, data: undefined}
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