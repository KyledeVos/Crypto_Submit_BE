import {getDataBasePoolConnection} from "../../src/database_config"
import {CURRENCIES_TABLE_NAME, CURRENT_DATA_TABLE_NAME, PERCENTAGE_CHANGE_RECENT_TABLE_NAME} from "../constants/constants_database"
import {databaseDefinitionType} from "../types/server_database_types"
import {PoolConnection} from "mariadb"
import chalk from "chalk"


    // define table creation queries
const currencyTableCreationQuery = `CREATE TABLE IF NOT EXISTS ${CURRENCIES_TABLE_NAME} (
        id INT NOT NULL AUTO_INCREMENT,
        bitcoin_id INT NOT NULL UNIQUE,
        currency_name VARCHAR(100) NOT NULL UNIQUE,
        currency_symbol VARCHAR(50) NOT NULL UNIQUE,
        rank INT NOT NULL,
        total_coins BIGINT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    )`

// CONTROLLER
export const createAllTablesController = async ():Promise<{error: boolean, message?: string}> => {
    // attempt to get DB Connection
    const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection()
    if(!dbConnection || dbConnection === undefined){
        return {error: true, message: 'createAllTablesController has a missing dbConnection'}
    }
    // log tracking
    try{

        // create currency table
        const currenyCreateResult = await tableCreationHelper(dbConnection, CURRENCIES_TABLE_NAME, currencyTableCreationQuery)
        if(currenyCreateResult.error !== undefined && currenyCreateResult.error === true){
            return {error: true, message: currenyCreateResult.message ? currenyCreateResult.message : "Error occured in creation of currency table"}
        }else{
            console.log(chalk.green(' - Currency Table created / present in Database'))
        }
        
        return {error: false}
        

        
        
    }catch(error){
        return {error: true, message: `An Error occured during tables creation as: ${error}`}
    }

}

// HELPER - Execute table creation and log presence in Database
const tableCreationHelper = async (dbConnection: PoolConnection, tableName: string, tableCreationQuery: string) => {

        const tableCreationResult = await dbConnection.query(tableCreationQuery)
        // confirm table presence
        const tableCreatedPresenceResult = await dbConnection.query(`SHOW TABLES LIKE '${tableName}'`)
        if(tableCreatedPresenceResult && Array.isArray(tableCreatedPresenceResult) && tableCreatedPresenceResult.length > 0){
            return {error: false}
        }else{
            return {error: true, message: `Failed to get a result for table present in DB as : ${tableName}. Server run will be terminated, check databases`}
        }

}


