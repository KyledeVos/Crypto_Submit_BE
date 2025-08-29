/**
 * @module crypto_controller.ts
 * This module provides a controller used for crypto initial data check
 */
import {retrieveCryptoMapData,populateInitialCryptoData, checkExistingCryptoDataCount, updateCryptoData} from "../models/crypto_model"
import {cryptoMapDataFilter} from "../utilities/crypto_filter"
import {validateCryptoMapResponse} from "../validators/crypto_reponse_validator"
import {fundamentalSummaryFields} from "../constants/crypto_constants"
import {cryptoUpToDateMapData, cryptoGeneralResponseType} from "../types/crypto_types"
import { count } from "console"
import { trackLogger } from "../utilities/logger"
import chalk from "chalk"


/**
 * Controller that serves to perform initial data on crypto data intended for server startup
 * @returns object with message string either as 'success' or specifies an error that occured
 */
export const cryptoInitialCheckController = async():Promise<string> => {

    // attempt to retrieve the initial crypto data
    const initialCheckResult = await retrieveCryptoMapData()
    console.log("initial resp", initialCheckResult.data)
    if(initialCheckResult.message !== "success" || initialCheckResult.data === undefined){
        return "failed"
    }


    //format and filter the data
    const responseData = initialCheckResult.data
    const formattedData = cryptoMapDataFilter(responseData, fundamentalSummaryFields)
    if(typeof formattedData === "string"){
        return formattedData
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

    return "success"
}

export const CryptoMapRetrieveAndFormat = async (validate:boolean = false):Promise<{message: string, data: cryptoGeneralResponseType | undefined }> => {
    // attempt to retrieve the crypto map data
    const initialCheckResult = await retrieveCryptoMapData()
    console.log("initial data", initialCheckResult)
    // console.log("initial resp", initialCheckResult.data)
    if(initialCheckResult.message !== "success" || initialCheckResult.data === undefined){
        return {message: "failed", data: undefined}
    }

    if(validate === true){
        try{
            const validated = validateCryptoMapResponse(initialCheckResult.data)
            if(validated !== true){
                return {message: "failed", data: undefined}
            }
        }catch(error){
            trackLogger({action: "error_file", logType: "error", callFunction: "CryptoMapRetrieveAndFormat", 
                         message: `Error occured during validation call as: ${error}`})
            return {message: "failed", data: undefined}
        }
    }

    //format and filter the data
    const responseData = initialCheckResult.data
    const formattedData = cryptoMapDataFilter(responseData, fundamentalSummaryFields)
    if(typeof formattedData === "string"){
        return {message: "failed", data: undefined}
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

    return {message:"success", data: {status: 200, data: initialCheckResult}}

}