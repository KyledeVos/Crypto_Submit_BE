import { getDataBasePoolConnection } from "../controllers/db_controller"
import { CURRENCIES_TABLE_NAME, CURRENT_DATA_TABLE_NAME, PERCENTAGE_CHANGE_RECENT_TABLE_NAME, PERCENTAGE_CHANGE_HISTORY_TABLE_NAME } from "../constants/constants_database"
import { PoolConnection } from "mariadb"
import { cryptoMapDataType, cryptoGeneralResponseType } from "../types/crypto_types"
import { getCryptoCurrencyMapData } from "../services/crypto_service"
import { trackLogger } from "../utilities/logger"
import { validateCryptoMapResponse } from "../validators/crypto_reponse_validator"
import { cryptoMapDataFilter } from "../utilities/crypto_filter"
import { fundamentalSummaryFields } from "../constants/crypto_constants"

/**
 * Determine if there is existing crypto map data or not by returning row count for 'CURRENCIES_TABLE_NAME'
 * @returns count of number of rows, string of error message
 * @remarks - does not perform internal logging
 */
export const checkExistingCryptoDataCount = async (): Promise<number | string> => {
    const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection();

    if (!dbConnection || dbConnection === undefined) {
        return "checkExistingCryptoDataCount has missing dbConnection. Cannot perform count check"
    }

    try {
        const selectQuery = `SELECT COUNT(currency_name) AS COUNT  from ${CURRENCIES_TABLE_NAME}`
        const countResult = await dbConnection.query(selectQuery)
        return Number(countResult[0].COUNT);
    } catch (error) {
        return `checkExistingCryptoDataCount error occurs in SQL Query Execution as: ${error}`
    } finally {
        await dbConnection.release()
    }
}

/**
 * Attempt to retrieve all crypto Map data (this is a summary of data for each crypto currency)
 * Calls for data formatting and filtering of key fields used by this application - see: fundamentalSummaryFields
 * @param apiReturn default false - explicit instruction to return data from the API call and not the DB needed for blank table
 * @returns formatted data array or undefined
 * @remarks this function performs its own internal logging
 */
export const retrieveFilterCryptoMapData = async (apiReturn:boolean = false): Promise<cryptoMapDataType[] | undefined> => {
    try {
        const cryptoMapResponse: cryptoGeneralResponseType | undefined = await getCryptoCurrencyMapData() as cryptoGeneralResponseType | undefined;
        if (cryptoMapResponse === undefined) {
            trackLogger({
                action: "error_file", logType: "error", callFunction: "retrieveCryptoMapData",
                message: "getCryptoCurrencyMapData returned undefined"
            })
            return undefined
        } else {
            if (cryptoMapResponse.status === 200) {
                // call for validation
                const validated = validateCryptoMapResponse(cryptoMapResponse.data.data)
                if (validated !== true) {
                    return undefined
                }
                //format and filter the data
                const responseData = cryptoMapResponse.data.data
                const formattedData = cryptoMapDataFilter(responseData, fundamentalSummaryFields)
                if (typeof formattedData === "string") {
                    trackLogger({
                        action: "error_file", logType: "error", callFunction: "retrieveCryptoMapData -> cryptoMapDataFilter",
                        message: formattedData
                    })
                    return undefined
                }
                const updatedResult = await updateCryptoData(formattedData);

                if (updatedResult !== 'success') {
                    trackLogger({
                        action: "error_file", logType: "error", callFunction: "retrieveFilterCryptoMapData -> updateCryptoData",
                        message: updatedResult
                    })
                    return undefined
                }
                // explicit instruction allowing DB fetc
                if(apiReturn === false){
                    // fetch data from DB and return
                    const dataFromDB = await getCurrenciesSummaryData()
                    return dataFromDB
                }else{
                    return formattedData
                }


            } else {
                return undefined
            }
        }
    } catch (error) {
        trackLogger({
            action: "error_file", logType: "error", callFunction: "retrieveCryptoMapData",
            message: `Error during data retrieval as: ${error}`
        })
        return undefined
    }
}


/**
 * Attempts to populate currencies table with summary data of desired currencies
 * @param cryptoData array
 * @returns string as 'success' or an error message
 * @remarks This function does not check for existing data, intended to be called on startup and insert / update managed externally
 */
export const populateInitialCryptoData = async (cryptoData: cryptoMapDataType[]): Promise<string> => {

    // establish connection
    const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection();

    if (!dbConnection || dbConnection === undefined) {
        return "checkCryptoInitial has missing dbConnection. Cannot perform check"
    } else if (cryptoData === undefined || !Array.isArray(cryptoData) || cryptoData.length === 0) {
        return "checkCryptoInitial supplied with incorrect / missing data - cannot write to DB"
    }

    // Query builder
    let insertQuery = `INSERT INTO ${CURRENCIES_TABLE_NAME} (currency_id, currency_name, currency_symbol, rank, is_active) VALUES `

    cryptoData.map((currentItem: cryptoMapDataType, outerIndex) => {
        insertQuery += "("
        Object.values(currentItem).map((currentFieldValue, index) => {
            const numberCheck = Number.isNaN(currentItem)
            insertQuery += numberCheck ? currentFieldValue : `'${currentFieldValue}'`
            Number(index) !== Object.keys(currentItem).length - 1 ?
                insertQuery += ", " :
                Number(outerIndex) !== cryptoData.length - 1 ? insertQuery += "), " : insertQuery += ")"
        })
    })
    try {
        const insertResult = dbConnection.query(insertQuery)
        return "success"
    } catch (error) {
        return `populateInitialCryptoData had error during SQL Insert as: ${error}`
    } finally {
        await dbConnection.release()
    }

}

/**
 * Performs an update of crypto summmary data - rank and is_active field
 * @param cryptoData array
 * @returns string as 'success' or an error message
 * @remarks row matching for update is based on currency name and currency id
 * @remarks symbol is not updated
 */
export const updateCryptoData = async (cryptoData: cryptoMapDataType[]): Promise<string> => {

    const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection();

    if (!dbConnection || dbConnection === undefined) {
        return "updateCryptoData has missing dbConnection. Cannot perform check"
    } else if (cryptoData === undefined || !Array.isArray(cryptoData) || cryptoData.length === 0) {
        return "updateCryptoData supplied with incorrect / missing data - cannot write to DB"
    }
    let internalError: string = ''
    try {
        cryptoData.forEach(async (currentItem: cryptoMapDataType) => {
            let query = `UPDATE ${CURRENCIES_TABLE_NAME} SET rank = ${currentItem.rank}, is_active = ${currentItem.is_active}
            WHERE currency_name = '${currentItem.name}' AND currency_id = '${currentItem.id}' AND currency_symbol = '${currentItem.symbol}'`
            try {
                await dbConnection.query(query)
            } catch (error) {
                internalError = `${error}`
            }
        })
        return internalError === "" ? 'success' : internalError
    } catch (error) {
        return `Error during summary data update as: ${error}`
    } finally {
        await dbConnection.release();
    }
}


/**
 * Retrieve all 
 * @returns 
 */
export const getCurrenciesSummaryData = async (): Promise<cryptoMapDataType[]> => {
    const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection();
    if (!dbConnection || dbConnection === undefined) {
        trackLogger({
            action: "error_file", logType: "error", callFunction: "retrieveCryptoMapData",
            message: "updateCryptoData has missing dbConnection. Cannot perform check"
        })
        return []
    }


    try {
        const query = `SELECT currency_id, currency_name,currency_symbol, rank, is_active FROM  ${CURRENCIES_TABLE_NAME} ORDER BY rank`
        const dataResult = await dbConnection.query(query)
        return dataResult
    } catch (error) {
        return []
    } finally {
        await dbConnection.release();
    }

}