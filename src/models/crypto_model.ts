import {getDataBasePoolConnection} from "../database_config"
import {CURRENCIES_TABLE_NAME, CURRENT_DATA_TABLE_NAME, PERCENTAGE_CHANGE_RECENT_TABLE_NAME, PERCENTAGE_CHANGE_HISTORY_TABLE_NAME} from "../constants/constants_database"
import {databaseDefinitionType} from "../types/server_database_types"
import {PoolConnection} from "mariadb"
import {CRYPTO_CURRENCIES_START} from "../constants/crypto_constants"
import {cryptoMapDataType, cryptoGeneralResponseType} from "../types/crypto_types"
import {getCryptoCurrencyMapData} from "../services/crypto_service"

/**
 * Determine if there is existing crypto map daa or not
 * @returns count of number of rows 
 */
export const checkExistingCryptoDataCount = async():Promise<number | string> => {
    const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection();

    if(!dbConnection || dbConnection === undefined){
        return "checkExistingCryptoDataCount has missing dbConnection. Cannot perform count check"
    }

    try{
        const selectQuery = `SELECT COUNT(currency_name) AS COUNT  from ${CURRENCIES_TABLE_NAME}`
        const countResult = await dbConnection.query(selectQuery)
        return Number(countResult[0].COUNT);
    }catch(error){
        return  `checkExistingCryptoDataCount error occurs in SQL Query Execution as: ${error}`
    }finally{
        await dbConnection.release()
    }
}

/**
 * Attempt to retrieve all crypto Map data (this is a summary of data for each crypto currency)
 * @returns object with message string either as 'success' or specifies an error that occured. data of type cryptoGeneralResponseType or undefined
 */
export const retrieveCryptoMapData = async ():Promise<{message: string, data: cryptoGeneralResponseType | undefined} > =>{

    const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection();

    if(!dbConnection || dbConnection === undefined){
        return {message: "checkCryptoInitial has missing dbConnection. Cannot perform check", data: undefined}
    }

    try{
        const cryptoMapResponse: cryptoGeneralResponseType | undefined = await getCryptoCurrencyMapData() as cryptoGeneralResponseType | undefined;
        if(cryptoMapResponse === undefined){
                return {message: "Failed to get Crypto Map Data", data: undefined}
        }else{
            if (cryptoMapResponse.status && cryptoMapResponse.status === 200){
                    return {message: "success", data: cryptoMapResponse.data.data}
            }else{
                return {message: `Failed to get Crypto Map data with status: ${cryptoMapResponse.status}`, data: undefined}
            }
        } 
    }catch(error){
       return {message: `Error occured in checkCryptoInitial for query as: ${error}`, data: undefined} 
    }finally{
        await dbConnection.release()
    }
}



export const populateInitialCryptoData = async(cryptoData: cryptoMapDataType[]):Promise<{message: string}> => {

    const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection();

    if(!dbConnection || dbConnection === undefined){
        return {message: "checkCryptoInitial has missing dbConnection. Cannot perform check"}
    }else if(cryptoData === undefined || !Array.isArray(cryptoData) || cryptoData.length === 0){
        return {message: "checkCryptoInitial supplied with incorrect / missing data - cannot write to DB"}
    }

    let insertQuery = `INSERT INTO ${CURRENCIES_TABLE_NAME} (currency_id, currency_name, currency_symbol, rank, is_active) VALUES `

    cryptoData.map((currentItem: cryptoMapDataType, outerIndex) => {
        insertQuery += "("
        Object.values(currentItem).map((currentFieldValue, index) => {
            const numberCheck = Number.isNaN(currentItem)
            insertQuery += numberCheck ? currentFieldValue : `'${currentFieldValue}'`
            Number(index) !== Object.keys(currentItem).length - 1 ?
              insertQuery += ", " : 
              Number(outerIndex) !== cryptoData.length -1 ? insertQuery += "), " : insertQuery += ")"
        })
    })
    console.log("BUILT QUERY", insertQuery)
    try{
        const insertResult = dbConnection.query(insertQuery)
        return {message: "success"}
    }catch(error){
        return {message: `populateInitialCryptoData had error during SQL Insert as: ${error}`}
    }finally{
        await dbConnection.release()
    }

}

export const updateCryptoData = async(cryptoData: cryptoMapDataType[]):Promise<string> => {

    const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection();

    if(!dbConnection || dbConnection === undefined){
        return "updateCryptoData has missing dbConnection. Cannot perform check"
    }else if(cryptoData === undefined || !Array.isArray(cryptoData) || cryptoData.length === 0){
        return "updateCryptoData supplied with incorrect / missing data - cannot write to DB"
    }
    let error_final: string = ''
    cryptoData.map(async(currentItem: cryptoMapDataType) => {
        let query = `UPDATE ${CURRENCIES_TABLE_NAME} SET rank = ${currentItem.rank}, is_active = ${currentItem.is_active}
         WHERE currency_name = '${currentItem.name}' AND currency_id = ${currentItem.id}`
         try{
            await dbConnection.query(query)
        
         }catch(error){
            error_final = `updateCryptoData error in SQL as: ${error}`
         }
    })
    await dbConnection.release();

    return 'success'
}