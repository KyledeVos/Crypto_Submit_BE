/**
 * @module crypto_controller.ts
 * This module provides a controller used for crypto initial data check
 */
import {retrieveCryptoMapData,populateInitialCryptoData, checkExistingCryptoDataCount, updateCryptoData} from "../models/crypto_model"
import {cryptoMapDataFilter} from "../utilities/crypto_filter"
import {fundamentalSummaryFields} from "../constants/crypto_constants"
import {cryptoUpToDateMapData} from "../types/crypto_types"
import { count } from "console"
import chalk from "chalk"


/**
 * Controller that serves to perform initial data oon crypto data intended for server startup
 * @returns object with message string either as 'success' or specifies an error that occured
 */
export const cryptoInitialCheckController = async():Promise<{message: string}> => {

    // attempt to retrieve the initial crypto data
    const initialCheckResult = await retrieveCryptoMapData()
    // console.log("initial resp", initialCheckResult.data)
    if(initialCheckResult.message !== "success"){
        return {message: initialCheckResult.message}
    }else if(initialCheckResult.data === undefined){
        return {message: "retrieveCryptoMapData did not return an error, but has returned undefined data"}
    }


    //format and filter the data
    const responseData = initialCheckResult.data
    const formattedData = cryptoMapDataFilter(responseData, fundamentalSummaryFields)
    if(typeof formattedData === "string"){
        return {message: formattedData}
    }
    

    // Check if there is existing data
    const countResult = await checkExistingCryptoDataCount()
    if(typeof countResult === "string"){
        console.log(chalk.red(countResult))
    }else{
        // for existing data, cannot write to the table directly but update instead
        if(countResult === 0){
            // blank table, perform full insert
            const populateResult = await populateInitialCryptoData(formattedData)
            if(populateResult.message !== 'success'){
                console.log(chalk.red(populateResult.message))
            }
        }else {
            const updatedResult = await updateCryptoData(formattedData);
            if(updatedResult !== 'success'){
               console.log(chalk.red(updatedResult)) 
            }
        }
    }

    return {message: "success"}


}