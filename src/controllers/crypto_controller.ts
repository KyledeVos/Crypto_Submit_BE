/**
 * @module crypto_controller.ts
 * This module provides a controller used for crypto initial data check
 */
import {retrieveFilterCryptoMapData,populateInitialCryptoData, checkExistingCryptoDataCount, updateCryptoData} from "../models/crypto_model"
import {cryptoMapDataFilter} from "../utilities/crypto_filter"
import {validateCryptoMapResponse} from "../validators/crypto_reponse_validator"
import {fundamentalSummaryFields} from "../constants/crypto_constants"
import {cryptoMapDataType, cryptoGeneralResponseType} from "../types/crypto_types"
import { count } from "console"
import { trackLogger } from "../utilities/logger"
import chalk from "chalk"


/**
 * Controller that serves to perform initial data on crypto data intended for server startup
 * and then insert / update data for map summary in the db
 * @returns object with message string either as 'success' or specifies an error that occured
 * @remarks this function performs its own internal logging
 */
export const cryptoInitialCheckController = async():Promise<string> => {

    // retrieve latest crypto summary data for currencies - formatted and filtered for this application
    const cryptoDataFormatted = await retrieveFilterCryptoMapData()
    if(cryptoDataFormatted === undefined){
        return "failure"
    }

    // Check if there is existing data
    const countResult = await checkExistingCryptoDataCount()
    if(typeof countResult === "string"){
        console.log(chalk.red(countResult))
    }else{
        // for existing data, cannot write to the table directly but update instead
        if(countResult === 0){
            // blank table, perform full insert
            const populateResult = await populateInitialCryptoData(cryptoDataFormatted)
            if(populateResult.message !== 'success'){
                console.log(chalk.red(populateResult.message))
            }
        }else {
            const updatedResult = await updateCryptoData(cryptoDataFormatted);
            if(updatedResult !== 'success'){
               console.log(chalk.red(updatedResult)) 
            }
        }
    }

    return "success"
}
