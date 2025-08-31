import { Request, Response } from "express"
import { RedisControl } from "../../redisClient"
import { checkExistingCryptoDataCount, retrieveFilterCryptoMapData } from "../../models/crypto_summary_model"
import { getFormatLatestDataAll, formatLatestSymbolToId } from "../../models/cryto_latest_data_model"
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

// export const latestDataRetrieval = async (req: Request, res: Response) => {

//     const formattedData: currentDataConformedType[] = await getFormatLatestDataAll()

//     console.log('symbolMatchedData', formattedData)
//     if(symbolMatchedData === undefined){

//     }
//     if (symbolMatchedData) {
//         const formattedData = await formatLatestSymbolToId(symbolMatchedData)
//         console.log("formatted controller", formattedData)
//     }
// }