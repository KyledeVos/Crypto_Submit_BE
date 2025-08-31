/**
 * @module crypto_controller.ts
 * This module provides a controller used for crypto initial data check
 */
import { retrieveFilterCryptoMapData, populateInitialCryptoData, checkExistingCryptoDataCount, updateCryptoData } from "../models/crypto_summary_model"
import {getFormatLatestDataAll, checkLatestDataEmpty, startUpInsertLatestData, updateLatestTableData} from "../models/cryto_latest_data_model"
import { validateCryptoMapResponse } from "../validators/crypto_reponse_validator"
import { fundamentalSummaryFields } from "../constants/crypto_constants"
import { currentDataConformedType } from "../types/crypto_types"
import { RedisControl } from "../redisClient"
import { trackLogger, styledLog } from "../utilities/logger"
import chalk from "chalk"


/**
 * Controller that serves to perform initial data on crypto data intended for server startup
 * and then insert / update data for map summary in the db
 * @returns object with message string either as 'success' or specifies an error that occured
 * @remarks this function performs its own internal logging
 */
export const cryptoInitialSummaryCheckController = async(): Promise<string> => {

    styledLog("Starting initial summary data check, insert / update")

    // retrieve latest crypto summary data for currencies - formatted and filtered for this application
    const cryptoDataFormatted = await retrieveFilterCryptoMapData(true)
    if (cryptoDataFormatted === undefined) {
        return "failure"
    }

    // add to redis
    const redisControl = new RedisControl()
    await redisControl.checkAndAddToRedis("SummaryData", cryptoDataFormatted)

    // Check if there is existing data
    const countResult = await checkExistingCryptoDataCount()
    if (typeof countResult === "string") {
        trackLogger({
            action: "error_file", logType: "error", callFunction: "cryptoInitialSummaryCheckController",
            message: countResult
        })
        return "failure"
    } else {
        // for existing data, cannot write to the table directly but update instead
        if (countResult === 0) {
            trackLogger({
                action: "log_file", logType: "info", callFunction: "cryptoInitialSummaryCheckController -> populateInitialCryptoData",
                message: "StartUp -> currency table row count 0 - performing data insert"
            })
            // blank table, perform full insert
            const populateResult = await populateInitialCryptoData(cryptoDataFormatted)
            if (populateResult !== 'success') {
                trackLogger({
                    action: "error_file", logType: "error", callFunction: "cryptoInitialSummaryCheckController -> populateInitialCryptoData",
                    message: populateResult
                })
                return "failure"
            }
            return 'success'
        } else {
            const updatedResult = await updateCryptoData(cryptoDataFormatted);
            if (updatedResult !== 'success') {
                trackLogger({
                    action: "error_file", logType: "error", callFunction: "cryptoInitialSummaryCheckController -> updateCryptoData",
                    message: updatedResult
                })
                return "failure"
            }
            return 'success'
        }
    }
}

/**
 * 
 */
export const cryptoInitialLatestCheckController = async():Promise<string> => {
    styledLog("Starting initial latest data check, insert / update")
    //retrieve latest formatted data for current crypto currencies
    const latestDataFormatted: currentDataConformedType[] | undefined = await getFormatLatestDataAll()
    // failure for no return or empty array
    if(latestDataFormatted === undefined || latestDataFormatted.length === 0){
        trackLogger({
            action: "error_file", logType: "error", callFunction: "cryptoInitialLatestCheckController -> getFormatLatestDataAll",
            message: "failed to get / format lastest crypto data for currencies"
        })
        return "failure"
    }

    //check for existing data to determine insert vs update query
    const dataCount = await checkLatestDataEmpty()
    if(dataCount === undefined || typeof dataCount === "string"){
        trackLogger({
            action: "error_file", logType: "error", callFunction: "cryptoInitialLatestCheckController -> checkLatestDataEmpty",
            message: "failed to check for empty data on latest crypto data"
        })
        return "failure"
    }

    if(dataCount === 0){
        // no data - perform insert
        const insertResult = await startUpInsertLatestData(latestDataFormatted)
        if(insertResult !== "success"){
        trackLogger({
            action: "error_file", logType: "error", callFunction: "cryptoInitialLatestCheckController -> startUpInsertLatestData",
            message: insertResult
        })
        }
        return insertResult
    }else{
        const updateResult = await updateLatestTableData(latestDataFormatted)
        if(updateResult !== "success"){
        trackLogger({
            action: "error_file", logType: "error", callFunction: "cryptoInitialLatestCheckController -> startUpInsertLatestData",
            message: updateResult
        })
        }
        return updateResult
    }





    
}
