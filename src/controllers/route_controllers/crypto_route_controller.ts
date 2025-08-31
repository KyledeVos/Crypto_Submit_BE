import { Request, Response } from "express"
import { RedisControl } from "../../redisClient"
import { checkExistingCryptoDataCount, retrieveFilterCryptoMapData } from "../../models/crypto_summary_model"
import { getFormatLatestDataAll, getLatestTableData, updateLatestTableData} from "../../models/cryto_latest_data_model"
import { trackLogger } from "../../utilities/logger"
import {currentDataConformedType} from "../../types/crypto_types"

export const summaryDataRetrieval = async (req: Request, res: Response) => {

    // define key for summaryData - redis
    const redisKey = "SummaryData"

    // check row count for quick return on empty - empty is an issue
    const rowCount = await checkExistingCryptoDataCount()
    if (rowCount === undefined) {
        trackLogger({
            action: "error_file", logType: "error", callFunction: "summaryDataController",
            message: "checkExistingCryptoDataCount returned undefined"
        })
        res.status(500).json()
    } else if (typeof rowCount === "string") {
        trackLogger({
            action: "error_file", logType: "error", callFunction: "summaryDataRetrieval -> checkExistingCryptoDataCount",
            message: rowCount
        })
        res.status(500).json()
    } else if (rowCount === 0) {
        trackLogger({
            action: "error_file", logType: "error", callFunction: "summaryDataRetrieval -> checkExistingCryptoDataCount",
            message: "summary data row count of 0 - this should not happen - data populated on server start"
        })
        res.status(500).json()
    } else {

        // Redis check for existing data - performs early res return before calling for new DB data
        // if redis data present and not expired
        const redisControl = new RedisControl()
        try {

            const reloadNeeded = await redisControl.checkReloadNeeded(redisKey)
            if (reloadNeeded === false) {

                const data = await redisControl.getRedisData(redisKey)
                if (data != "failed") {
                    try {
                        // redis return
                        const JsonData = JSON.parse(data)
                        return res.status(200).json(JsonData.data)
                    } catch (error) {
                        trackLogger({
                            action: "error_file", logType: "error", callFunction: "summaryDataRetrieval",
                            message: `Error during get data conversion as: ${error}`
                        })
                    }
                }
            }
        } catch (error) {
            trackLogger({
                action: "error_file", logType: "error", callFunction: "summaryDataRetrieval -> createRedisClient",
                message: `Error during redis checks as: ${error}`
            })
        }

        const dataResult = await retrieveFilterCryptoMapData()
        if (dataResult == undefined) {
            trackLogger({
                action: "error_file", logType: "error", callFunction: "summaryDataRetrieval -> retrieveFilterCryptoMapData",
                message: "retrieveFilterCryptoMapData returned undefined"
            })
            res.status(500).json()
        } else if (!Array.isArray(dataResult) || dataResult.length === 0) {
            // returns a 204 for FE to know there isn't data, but this is an issue - data populated on startup
            trackLogger({
                action: "error_file", logType: "error", callFunction: "summaryDataRetrieval -> retrieveFilterCryptoMapData",
                message: "retrieveFilterCryptoMapData has no data - this should not happen - data populated on server start "
            })
            res.status(204).json()
        } else {
            await redisControl.checkAndAddToRedis("SummaryData", dataResult)
            res.status(200).json(dataResult)
        }
    }
}

/**
 * Get the latest current_table data. First check redis - if expired then call for new data, update
 * DB and then select data from DB
 * @param req - attempts to get symbol from request body
 */
export const latestDataRetrieval = async (req: Request, res: Response) => {

   // get symbol from request
   const {symbol} = req.body
   if(!symbol || symbol === undefined || typeof symbol !== "string" || symbol.trim() === ""){
    res.status(400).json("missing symbol")
   }

   // define key for summaryData - redis
    const redisKey = `LatestData${symbol}`

   // check redis for existing data
   const redisControl = new RedisControl()
    try {
        //determine if the data is not present or has expired
        const reloadNeeded = await redisControl.checkReloadNeeded(redisKey)
        console.log("reload needed", reloadNeeded)
        if (reloadNeeded === false) {

            const data = await redisControl.getRedisData(redisKey)
            console.log("redis data", data)
            if (data != "failed") {
                try {
                    console.log("retuning from redis")
                    // redis return
                    const JsonData = JSON.parse(data)
                    return res.status(200).json(JsonData.data)
                } catch (error) {
                    trackLogger({
                        action: "error_file", logType: "error", callFunction: "summaryDataRetrieval",
                        message: `Error during get data conversion as: ${error}`
                    })
                }
            }
        }
    } catch (error) {
        trackLogger({
            action: "error_file", logType: "error", callFunction: "summaryDataRetrieval -> createRedisClient",
            message: `Error during redis checks as: ${error}`
        })
    }

    // At this point the data is either not present or has expired in redis

    // API call for new data
    console.log("CALLING FOR NEW LATEST DATA")
    const latestDataFormatted: currentDataConformedType[] | undefined = await getFormatLatestDataAll()
    
    if(latestDataFormatted === undefined || latestDataFormatted.length === 0){
        // failed to get latest data
        trackLogger({
            action: "error_file", logType: "error", callFunction: "latestDataRetrieval -> getFormatLatestDataAll",
            message: `latest data from API was undefined or empty`
        })
        return res.status(500).json("unable to update data")
    }

    const retrievalResult = await getLatestTableData(symbol)
    // add data to redis
    console.log("ADDING TO REDIS")
    const redisResult = await redisControl.checkAndAddToRedis(redisKey, retrievalResult)
    console.log("redisResult", redisResult)
    const updateResult = await updateLatestTableData(latestDataFormatted)
    if(updateResult !== "success"){
        trackLogger({
            action: "error_file", logType: "error", callFunction: "latestDataRetrieval -> updateLatestTableData",
            message: updateResult
        })
    }
    

    // return the latest table data from DB formatted
    return res.status(200).json(retrievalResult)
}

export const latestDataAllRetrieval = async(req: Request, res: Response) => {

   // define key for summaryData - redis
    const redisKey = "LatestData"

   // check redis for existing data
   const redisControl = new RedisControl()
    try {
        //determine if the data is not present or has expired
        const reloadNeeded = await redisControl.checkReloadNeeded(redisKey)
        console.log("reload needed", reloadNeeded)
        if (reloadNeeded === false) {

            const data = await redisControl.getRedisData(redisKey)
            console.log("redis data", data)
            if (data != "failed") {
                try {
                    console.log("retuning from redis")
                    // redis return
                    const JsonData = JSON.parse(data)
                    return res.status(200).json(JsonData.data)
                } catch (error) {
                    trackLogger({
                        action: "error_file", logType: "error", callFunction: "summaryDataRetrieval",
                        message: `Error during get data conversion as: ${error}`
                    })
                }
            }
        }
    } catch (error) {
        trackLogger({
            action: "error_file", logType: "error", callFunction: "summaryDataRetrieval -> createRedisClient",
            message: `Error during redis checks as: ${error}`
        })
    }

    // At this point the data is either not present or has expired in redis

    // API call for new data
    console.log("CALLING FOR NEW LATEST DATA")
    const latestDataFormatted: currentDataConformedType[] | undefined = await getFormatLatestDataAll()
    
    if(latestDataFormatted === undefined || latestDataFormatted.length === 0){
        // failed to get latest data
        trackLogger({
            action: "error_file", logType: "error", callFunction: "latestDataRetrieval -> getFormatLatestDataAll",
            message: `latest data from API was undefined or empty`
        })
        return res.status(500).json("unable to update data")
    }

    const retrievalResult = await getLatestTableData()
    // add data to redis
    console.log("ADDING TO REDIS")
    const redisResult = await redisControl.checkAndAddToRedis(redisKey, retrievalResult)
    console.log("redisResult", redisResult)
    const updateResult = await updateLatestTableData(latestDataFormatted)
    if(updateResult !== "success"){
        trackLogger({
            action: "error_file", logType: "error", callFunction: "latestDataRetrieval -> updateLatestTableData",
            message: updateResult
        })
    }
    
    // return the latest table data from DB formatted
    return res.status(200).json(retrievalResult)
}


// export const allDataHandler = async ():Promise<> => {

//    // define key for summaryData - redis
//     const redisKey = "LatestData"

//    // check redis for existing data
//    const redisControl = new RedisControl()
//     try {
//         //determine if the data is not present or has expired
//         const reloadNeeded = await redisControl.checkReloadNeeded(redisKey)
//         console.log("reload needed", reloadNeeded)
//         if (reloadNeeded === false) {

//             const data = await redisControl.getRedisData(redisKey)
//             console.log("redis data", data)
//             if (data != "failed") {
//                 try {
//                     console.log("retuning from redis")
//                     // redis return
//                     const JsonData = JSON.parse(data)
//                     return res.status(200).json(JsonData.data)
//                 } catch (error) {
//                     trackLogger({
//                         action: "error_file", logType: "error", callFunction: "summaryDataRetrieval",
//                         message: `Error during get data conversion as: ${error}`
//                     })
//                 }
//             }
//         }
//     } catch (error) {
//         trackLogger({
//             action: "error_file", logType: "error", callFunction: "summaryDataRetrieval -> createRedisClient",
//             message: `Error during redis checks as: ${error}`
//         })
//     }

//     // At this point the data is either not present or has expired in redis

//     // API call for new data
//     console.log("CALLING FOR NEW LATEST DATA")
//     const latestDataFormatted: currentDataConformedType[] | undefined = await getFormatLatestDataAll()
    
//     if(latestDataFormatted === undefined || latestDataFormatted.length === 0){
//         // failed to get latest data
//         trackLogger({
//             action: "error_file", logType: "error", callFunction: "latestDataRetrieval -> getFormatLatestDataAll",
//             message: `latest data from API was undefined or empty`
//         })
//         return res.status(500).json("unable to update data")
//     }

//     const retrievalResult = await getLatestTableData(symbol)
//     // add data to redis
//     console.log("ADDING TO REDIS")
//     const redisResult = await redisControl.checkAndAddToRedis(redisKey, retrievalResult)
//     console.log("redisResult", redisResult)
//     const updateResult = await updateLatestTableData(latestDataFormatted)
//     if(updateResult !== "success"){
//         trackLogger({
//             action: "error_file", logType: "error", callFunction: "latestDataRetrieval -> updateLatestTableData",
//             message: updateResult
//         })
//     }
    

//     // return the latest table data from DB formatted
//     return res.status(200).json(retrievalResult)

// }