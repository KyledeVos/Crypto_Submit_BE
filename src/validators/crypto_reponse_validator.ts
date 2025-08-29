/**
 * @module crypto_response_validator
 * This module provides functions used to check responses for 3rd party crypto requests
 * @remarks This module's functions are a crucial part of data conforming and ensuring this application receives data as expected
 */

import { trackLogger } from "../utilities/logger"
import {cryptoMapDataRawType} from "../types/crypto_types"
import {simpleIntegerValidator, simpleStringValidator} from "../validators/simpleValidators"
import { platform } from "os"

// id: 215,
//     rank: 6370,
//     name: 'Rubycoin',
//     symbol: 'RBY',
//     slug: 'rubycoin',
//     is_active: 1,
//     status: 1,
//     first_historical_data: '2014-03-20T05:05:00.000Z',
//     last_historical_data: '2025-08-29T19:35:00.000Z',
//     platform: null

/**
 * Performs validation of raw crypto map data
 * @param mapDataRaw of type any
 * @returns boolean of validation success
 * @remarks this function performs it's own internal logging for errors
 * @remarks it is not wise to call this validation on every request due to the processing needed for large data - worker needed instead at regular intervals
 */
export const validateCryptoMapResponse = (mapDataRaw: any):boolean => {

    // basic checks
    if(!mapDataRaw || mapDataRaw === undefined){
        trackLogger({action: "error_file", logType: "error", callFunction: "validateCryptoMapResponsee", 
             message: "mapData raw is blank"})
        return false
    }else if(!Array.isArray(mapDataRaw)){
        trackLogger({action: "error_file", logType: "error", callFunction: "validateCryptoMapResponsee", 
             message: "mapData raw is not an array"})
        return false
    }

    let dataValid:boolean = true;


    // iterative checks
    mapDataRaw.map((currentValue: cryptoMapDataRawType) => {
        if(simpleIntegerValidator(currentValue.id) === false ||
            simpleIntegerValidator(currentValue.rank) === false ||
            simpleStringValidator(currentValue.name) === false ||
            simpleStringValidator(currentValue.symbol) === false ||
            simpleStringValidator(currentValue.slug) === false ||
            simpleIntegerValidator(currentValue.is_active) === false ||
            simpleIntegerValidator(currentValue.status) === false ||
            simpleStringValidator(currentValue.first_historical_data) === false ||
            simpleStringValidator(currentValue.last_historical_data) === false
        ){
            dataValid = false;
        }
        })

        if(dataValid !== true){
            trackLogger({action: "error_file", logType: "error", callFunction: "validateCryptoMapResponsee", 
             message: "mapData raw has shown invalid data"})
        }
        
        console.log("FINAL", dataValid)
        return dataValid
}