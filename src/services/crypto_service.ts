/**
 * @module server.ts
 * This module is used to make 3rd Part API calls for cryto currency data
 * @remarks the endpoints have been defined here for central control and quick reference
 */
import dotenv from 'dotenv'
import { cryptoMapDataType, cryptoGeneralResponseType } from "../types/crypto_types"
import { trackLogger } from '../utilities/logger';
import { response } from 'express';
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
export const getCryptoCurrencyMapData = async (): Promise<cryptoGeneralResponseType> => {

    if (process.env.COIN_API_KEY && process.env.COIN_API_KEY !== undefined && process.env.COIN_API_KEY.trim() !== "") {
        try {
            trackLogger({
                action: "log_file", logType: "info", callFunction: "getCryptoCurrencyMapData",
                message: "Call Made to get latest crypto map data"
            })
            const result = await fetch(crypto_map_symbol_base, {
                method: "GET",
                headers: {
                    "X-CMC_PRO_API_KEY": process.env.COIN_API_KEY
                }
            })
            const responseData = await result.json()
            return { status: result.status, data: responseData }
        } catch (error) {
            trackLogger({
                action: "error_file", logType: "error", callFunction: "getCryptoCurrencyMapData",
                message: `Error occured during data retrieval as: ${error}`
            })
            return { status: 500, data: undefined }
        }

    } else {
        trackLogger({
            action: "error_file", logType: "error", callFunction: "getCryptoCurrencyMapData",
            message: "missing coing api for call"
        })
        return { status: 500, data: undefined }
    }
}

/**
 * Retrieves full data for a single crypto currency
 * @param crypto_symbol string 
 * @returns status and data for crypto full data, undefined if there is an error
 * @remarks this function performs it's own internal logging for errors
 * @remarks this function logs each call made
 */
export const getLatestData = async (crypto_symbol: string): Promise<cryptoGeneralResponseType> => {
    if (process.env.COIN_API_KEY && process.env.COIN_API_KEY !== undefined && process.env.COIN_API_KEY.trim() !== "") {
        if (crypto_symbol === undefined || crypto_symbol.trim() === "") {
            trackLogger({
                action: "error_file", logType: "error", callFunction: "getLatestData",
                message: "crypto currency symbol not provided"
            })
            return { status: 500, data: undefined }
        }

        try {
            // log the call
            trackLogger({
                action: "log_file", logType: "info", callFunction: "getLatestData",
                message: `Call made for getLatestDats for crypto symbol; ${crypto_symbol}`
            })
            // fetch data
            const latestDataResult = await fetch(latest_data_base + `?symbol=${crypto_symbol}`, {
                method: "GET",
                headers: {
                    "X-CMC_PRO_API_KEY": process.env.COIN_API_KEY
                }
            })
            const responseData = await latestDataResult.json()
            console.log("latest", responseData)
            return { status: responseData.status, data: responseData }
        } catch (error) {
            trackLogger({
                action: "error_file", logType: "error", callFunction: "getLatestData",
                message: `Error occured during data retrieval as: ${error}`
            })
            return { status: 500, data: undefined }
        }

    } else {
        trackLogger({
            action: "error_file", logType: "error", callFunction: "getLatestData",
            message: "missing coing api for call"
        })
        return { status: 500, data: undefined }
    }

}

// {
//   status: {
//     timestamp: '2025-08-31T08:20:30.628Z',
//     error_code: 0,
//     error_message: null,
//     elapsed: 27,
//     credit_count: 1,
//     notice: null
//   },
//   data: {
//     BTC: {
//       id: 1,
//       name: 'Bitcoin',
//       symbol: 'BTC',
//       slug: 'bitcoin',
//       num_market_pairs: 12326,
//       date_added: '2010-07-13T00:00:00.000Z',
//       tags: [Array],
//       max_supply: 21000000,
//       circulating_supply: 19914109,
//       total_supply: 19914109,
//       is_active: 1,
//       infinite_supply: false,
//       platform: null,
//       cmc_rank: 1,
//       is_fiat: 0,
//       self_reported_circulating_supply: null,
//       self_reported_market_cap: null,
//       tvl_ratio: null,
//       last_updated: '2025-08-31T08:18:00.000Z',
//       quote: [Object]
//     }
//   }
// }
