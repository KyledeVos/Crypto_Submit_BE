import {Request, Response} from "express"
import {RedisControl} from "../../redisClient"
import {checkExistingCryptoDataCount, retrieveFilterCryptoMapData} from "../../models/crypto_model"
import { trackLogger } from "../../utilities/logger"
import {cryptoMapDataFilter} from "../../utilities/crypto_filter"
import {fundamentalSummaryFields} from "../../constants/crypto_constants"
import type {cryptoMapDataType} from "../../types/crypto_types"



export const summaryDataRetrieval = async (req: Request, res: Response) => {

    // check row count for quick return on empty - empty is an issue
    const rowCount = await checkExistingCryptoDataCount()
    if(rowCount === undefined){
        trackLogger({action: "error_file", logType: "error", callFunction: "summaryDataController", 
            message: "checkExistingCryptoDataCount returned undefined"})
        res.status(500).json()
    }else if(typeof rowCount === "string"){
        trackLogger({action: "error_file", logType: "error", callFunction: "summaryDataRetrieval -> checkExistingCryptoDataCount", 
            message: rowCount})
        res.status(500).json()
    }else if(rowCount === 0){
        trackLogger({action: "error_file", logType: "error", callFunction: "summaryDataRetrieval -> checkExistingCryptoDataCount", 
            message: "summary data row count of 0 - this should not happen - data populated on server start"})
        res.status(500).json()
    }else{

        const dataResult = await retrieveFilterCryptoMapData()
        if(dataResult == undefined){
            trackLogger({action: "error_file", logType: "error", callFunction: "summaryDataRetrieval -> retrieveFilterCryptoMapData", 
             message: "retrieveFilterCryptoMapData returned undefined"})
            res.status(500).json()
        }else if(!Array.isArray(dataResult) || dataResult.length ===0){
            // returns a 204 for FE to know there isn't data, but this is an issue - data populated on startup
            trackLogger({action: "error_file", logType: "error", callFunction: "summaryDataRetrieval -> retrieveFilterCryptoMapData", 
                message: "retrieveFilterCryptoMapData has no data - this should not happen - data populated on server start "})
                res.status(204).json()
        }else{
            res.status(200).json(dataResult)
        }

        // // create redis client
        // const redisControl = new RedisControl()
        // const redisClient = await redisControl.createRedisClient();
        // if(redisClient === undefined){
        //     console.log(("Failed to Create A Redis Client"))
        //     // no redis, have to return db data
        //     const data = await callForSummaryData();
        //     if(data === undefined){
        //         res.status(500).json()
        //     }else if(data.length == 0){
        //         res.status(204).json()
        //     }else{
        //         res.status(200).json(data)
        //     }
        // }else{
        //     console.log(("Redis Client Created"))
        //     const value = await redisClient.get("summaryDataController")
        //     // no current data
        //     if (value === null){
        //         const data = await callForSummaryData()
        //         if(data && data.length > 0){
        //             const redisData = {data: data, dateStamp: Date.now()}
        //             redisClient.set("summaryDataController", JSON.stringify(redisData))
        //         }else{
        //             res.status(500).json()
        //         }
        //     }else{
        //         //# current data
        //         const currentDate = Date.now()
        //         const redisDataJson = JSON.parse(value)
        //         const timeDiffMilli = currentDate - redisDataJson.dateStamp;

        //         // time diff greater than one minute, get new data and set in redis
        //         if (timeDiffMilli > 60000){
        //             const data = await callForSummaryData()
        //             if(data && data.length > 0){
        //                 const redisData = {data: data, dateStamp: Date.now()}
        //                 redisClient.set("summaryDataController", JSON.stringify(redisData))
        //             }else{
        //                 res.status(500)
        //             }
        //         }
        //         redisClient.quit()
        //         res.status(200).json(redisDataJson.data)
        //     }
        // }
    }
}