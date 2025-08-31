/**
 * @module crypto_latest_data_model.ts
 * This odule provided functions to retrieve and interact with the latest data for a crypto currency
 */

import {PoolConnection} from "mariadb"
import { getDataBasePoolConnection } from "../controllers/db_controller"
import { getLatestData } from "../services/crypto_service"
import { CRYPTO_CURRENCIES_NAME_SYMBOL } from "../constants/crypto_constants"
import {CURRENCIES_TABLE_NAME, CURRENT_DATA_TABLE_NAME} from "../constants/constants_database"
import { currentDataType, currentDataConformedType } from "../types/crypto_types"
import { trackLogger, styledLog } from "../utilities/logger"
import {filterLatestData} from "../utilities/crypto_filter"


/**
 * Retrieves the latest data for specified crypto currencies matching 'CRYPTO_CURRENCIES_NAME_SYMBOL'
 * @returns array of currentDataType, undefined for error
 * @remarks this function performs its own internal logging
 * @remarks data note: this function returns data matched by symbol needs formatting ext. for proper table insertion
 */
export const getFormatLatestDataAll = async (): Promise<currentDataConformedType[] | undefined> => {

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
            styledLog("Latest Data Raw Error flagged, returning no data", "error")
            return undefined
        }else{
            const conformedLatestData = await formatLatestSymbolToId(filteredDataSymbolMatch)
            if(conformedLatestData === undefined){
                styledLog("Latest Data Conformed returned undefined", "error")
            }else if(typeof conformedLatestData === "string"){
                 styledLog(conformedLatestData, "error")
                 return undefined
            }else{
                return conformedLatestData
            }
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
 * Converts latest data from reference by currency symbol to currency id for db table confirming
 * @param rawData of currentDataType
 * @returns currentDataConformedType array, string for error
 * @remarks function does not perform its own internal logging
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
                    return selectionItem.currency_symbol === item.symbol
                })

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
        }
        return formattedData
    } catch (error) {
        return `checkExistingCryptoDataCount error occurs in SQL Query Execution as: ${error}`
    } finally {
        await dbConnection.release()
    }
}

/**
 * Determine if there is existing data in the current_data table
 * @returns count of present rows, string for error
 */
export const checkLatestDataEmpty = async():Promise<number | string> => {

        const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection();
    // Get symbol and currency_id from currencies table

    if (!dbConnection || dbConnection === undefined) {
        return "checkLatestDataEmpty has missing dbConnection. Cannot perform data count"
    }

    try {
        const selectQuery = `SELECT COUNT(currencies_id) AS COUNT  from ${CURRENT_DATA_TABLE_NAME}`
        const countResult = await dbConnection.query(selectQuery)
        return Number(countResult[0].COUNT);

    } catch (error) {
        return `checkLatestDataEmpty error occurs in SQL Query Execution as: ${error}`
    } finally {
        await dbConnection.release()
    }

}

/**
 * Insert latestData for Currencies into table
 * @param data array
 * @returns string success, failure if error occurs
 */
export const startUpInsertLatestData = async(data: currentDataConformedType[]):Promise<string> => {

        // establish connection
        const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection();
    
        if (!dbConnection || dbConnection === undefined) {
            return "startUpInsertLatestData has missing dbConnection. Cannot write to DB"
        } else if (data === undefined || !Array.isArray(data) || data.length === 0) {
            return "startUpInsertLatestData supplied with incorrect / missing data - cannot write to DB"
        }
    
        // Query builder
        let insertQuery = `INSERT INTO ${CURRENT_DATA_TABLE_NAME} (currencies_id, current_price, volume_24h, market_cap, market_cap_dominance) VALUES `
    
        data.map((currentItem: currentDataConformedType, outerIndex) => {
            insertQuery += "("
            Object.values(currentItem).map((currentFieldValue, index) => {
                const numberCheck = Number.isNaN(currentItem)
                insertQuery += numberCheck ? currentFieldValue : `'${currentFieldValue}'`
                Number(index) !== Object.keys(currentItem).length - 1 ?
                    insertQuery += ", " :
                    Number(outerIndex) !== data.length - 1 ? insertQuery += "), " : insertQuery += ")"
            })
        })
        try {
            const insertResult = dbConnection.query(insertQuery)
            return "success"
        } catch (error) {
            return `startUpInsertLatestData had error during SQL Insert as: ${error}`
        } finally {
            await dbConnection.release()
        }
}

/**
 * Perform an udpdae to existing current_table data
 * @param data of type currentDataConformedType
 * @returns success string, error
 */
export const updateLatestTableData = async(data: currentDataConformedType[]):Promise<string> => {
    
    const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection();

    if (!dbConnection || dbConnection === undefined) {
        return "updateLatestTableData has missing dbConnection. Cannot perform check"
    } else if (data === undefined || !Array.isArray(data) || data.length === 0) {
        return "updateLatestTableData supplied with incorrect / missing data - cannot write to DB"
    }
    let internalError: string = ''
    try {
        data.forEach(async (currentItem: currentDataConformedType) => {
            let query = `UPDATE ${CURRENT_DATA_TABLE_NAME} SET current_price = ${currentItem.currentPrice}, volume_24h = ${currentItem.volume24h},
            market_cap = ${currentItem.marketCap}, market_cap_dominance = ${currentItem.marketCapDominance}
            WHERE currencies_id = '${currentItem.currencyId}'`
            try {
                await dbConnection.query(query)
            } catch (error) {
                internalError = `${error}`
            }
        })
        return internalError === "" ? 'success' : internalError
    } catch (error) {
        return `Error during latest data update as: ${error}`
    } finally {
        await dbConnection.release();
    }

}

export const getLatestTableData = async(symbol?: string):Promise<currentDataConformedType[] | string> => {
    console.log("CALLED")
    const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection();

    if (!dbConnection || dbConnection === undefined) {
        return "getLatestTableData has missing dbConnection. Cannot perform check"
    }else if(symbol === undefined || symbol.trim() === "" ){
        return"getLatestTableData has missing symbol"
    }
    try {
        let selectionQuery = `SELECT 
        currencies.currency_name,
        currencies.currency_symbol,
        currencies.rank,
        current.current_price,
        current.volume_24h,
        current.market_cap,
        current.market_cap_dominance
        FROM ${CURRENT_DATA_TABLE_NAME} AS current 
        JOIN ${CURRENCIES_TABLE_NAME} ON 
        current.currencies_id = currencies.currency_id`
        if(symbol && symbol !== undefined){
            selectionQuery += ` WHERE currencies.currency_symbol =  '${symbol}'`
        }
        


        const selectionResult = await dbConnection.query(selectionQuery)
        if(selectionResult.length > 0){
            selectionResult[0].rank = Number(selectionResult[0].rank)
            selectionResult[0].current_price = Number(selectionResult[0].current_price)
            selectionResult[0].volume_24h = Number(selectionResult[0].volume_24h)
            selectionResult[0].market_cap = Number(selectionResult[0].market_cap)
            selectionResult[0].market_cap_dominance = Number(selectionResult[0].market_cap_dominance)
            return selectionResult[0]
        }

        return "failed"
    } catch (error) {
        return `Error during latest data update as: ${error}`
    } finally {
        await dbConnection.release();
    }
}

export const getAllLatestData = () => {

}