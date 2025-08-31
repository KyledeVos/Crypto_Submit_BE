/**
 * @module crypto_latest_data_model.ts
 * This odule provided functions to retrieve and interact with the latest data for a crypto currency
 */

import {PoolConnection} from "mariadb"
import { getDataBasePoolConnection } from "../controllers/db_controller"
import { getLatestData } from "../services/crypto_service"
import { CRYPTO_CURRENCIES_NAME_SYMBOL } from "../constants/crypto_constants"
import {CURRENCIES_TABLE_NAME} from "../constants/constants_database"
import { currentDataType, currentDataConformedType } from "../types/crypto_types"
import { trackLogger, styledLog } from "../utilities/logger"
import {filterLatestData} from "../utilities/crypto_filter"


/**
 * Retrieves the latest data for specified crypto currencies matching 'CRYPTO_CURRENCIES_NAME_SYMBOL'
 * @returns array of currentDataType, undefined for error
 * @remarks this function performs its own internal logging
 * @remarks data note: this function returns data matched by symbol needs formatting ext. for proper table insertion
 */
export const getFormatLatestDataAll = async (): Promise<currentDataType[] | undefined> => {

    try {
        let  dataFilterError: boolean = false
        const filteredDataSymbolMatch: currentDataType[] = []
        // Gets latest data for each currency and filters out non-desired fields one-by-one
        for(const symbol of Object.values(CRYPTO_CURRENCIES_NAME_SYMBOL)) {

            const latestDataRaw = await getLatestData(symbol);
            if (latestDataRaw === undefined) {
                trackLogger({
                    action: "error_file", logType: "error", callFunction: "getFormatLatestDataAll->getLatestData",
                    message: "getLatestData Service returned undefined"
                })
            }

            // filter desired fields
            const dataFiltered = filterLatestData(symbol, latestDataRaw.data)
            if(dataFiltered === undefined || typeof  dataFiltered === "string"){
                // error tracking during filter process
                dataFilterError = true
                trackLogger({
                    action: "error_file", logType: "error", callFunction: "getFormatLatestDataAll->filterLatestData",
                    message: dataFiltered
                })
            }else{
                filteredDataSymbolMatch.push(dataFiltered)
            }
        }

        if(dataFilterError){
            styledLog("Latest Data Error flagged, returning no data", "error")
            return undefined
        }else{
            return filteredDataSymbolMatch
        }

    } catch (error) {
        trackLogger({
            action: "error_file", logType: "error", callFunction: "getLatestDataAll",
            message: `Error occured as: ${error}`
        })
        return undefined;
    }
}

/**
 * 
 */
export const formatLatestSymbolToId = async(rawData: currentDataType[] ):Promise<currentDataConformedType[] | string> => {
    
    const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection();
    // Get symbol and currency_id from currencies table

    if (!dbConnection || dbConnection === undefined) {
        return "formatLatestSymbolToId has missing dbConnection. Cannot perform data modificaition"
    }

    try {
        const formattedData:currentDataConformedType[] = []
        const selectQuery = `SELECT currency_id, currency_symbol from ${CURRENCIES_TABLE_NAME}`
        const selectionResult = await dbConnection.query(selectQuery)
        if(!selectionResult || !Array.isArray(selectionResult)){
           return "formatLatestSymbolToId failed to get currency data" 
        }else if(selectionResult.length == 0){
            return "formatLatestSymbolToId retrieved no data, cannot perform mapping transform"
        }else{
            for (const item of rawData){
                const foundInSelection = selectionResult.find((selectionItem)=>{
                    console.log("SELECTION ITEM", selectionItem)
                    return selectionItem.currency_symbol === item.symbol
                })
                console.log("ITEM", item)
                console.log("FOUND IN SELECTION", foundInSelection)

                if(foundInSelection){
                    formattedData.push({
                        "currencyId": foundInSelection.currency_id,
                        "currentPrice": item.currentPrice,
                        "volume24h": item.volume24h,
                        "marketCap": item.marketCap,
                        "marketCapDominance": item.marketCapDominance
                    })
                }
            }
            console.log("after",formattedData )
        }
        console.log('selectionResult', selectionResult)
        return formattedData
    } catch (error) {
        return `checkExistingCryptoDataCount error occurs in SQL Query Execution as: ${error}`
    } finally {
        await dbConnection.release()
    }


}