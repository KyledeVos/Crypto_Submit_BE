/**
 * @module crypto_filter.ts
 * This module provides util functions for crypto data filtering
 */

import {cryptoUpToDateMapData, cryptoMapDataType} from "../types/crypto_types"
import {CRYPTO_CURRENCIES_START} from "../constants/crypto_constants"

/**
 * Formats raw crypto data into desired fields and filters based on desired currencies to show
 * @param cryptoDataRaw - defined as any
 * @param fundamentalFields - array of strings of desired crypto currencies
 * @returns string for error or filtered results of type cryptoMapDataType
 */
export const cryptoMapDataFilter = (cryptoDataRaw: any, fundamentalFields: string[]): string | cryptoMapDataType[]=> {

    if(cryptoDataRaw === undefined){
        return "cryptoMapDataFilter has been given no raw data"
    }else if(fundamentalFields.length === 0){
        return "cryptoMapDataFilter has been given an empty fundamental fields array"
    }

    try{
        // iterate through all crypto map data, check if included in desired currencies and retrieve
        // desired sub-field (such as name and symbol)
        const filteredResults = cryptoDataRaw.map((currentCryptoVal: any) => {
            if(currentCryptoVal !== undefined && typeof currentCryptoVal === 'object'){
                const currentItem: any = {}
                fundamentalFields.map((field)=> {
                    
                    if(currentCryptoVal[field] && CRYPTO_CURRENCIES_START.includes(currentCryptoVal.name)){
                        currentItem[field] = currentCryptoVal[field]
                    }
                })
                return currentItem;
            }  
        }).filter((item: object) => {
            if(item !== null && item!== undefined && Object.keys(item).length > 0) return item
        })
        return filteredResults;
    }catch(error){
        return `An error occured during cryptoMapDataFilter filtering as: ${error}`
    }
}