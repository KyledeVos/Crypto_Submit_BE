/**
 * @module database_tables_creation.test.ts
 * This is a database tables creation module intended to be called on server startup
 * @remarks Table Creation queries are defined in this module
 */

import {getDataBasePoolConnection} from "../controllers/db_controller"
import {CURRENCIES_TABLE_NAME, CURRENT_DATA_TABLE_NAME, PERCENTAGE_CHANGE_RECENT_TABLE_NAME, PERCENTAGE_CHANGE_HISTORY_TABLE_NAME} from "../constants/constants_database"
import {PoolConnection} from "mariadb"
import {trackLogger, styledLog} from "../utilities/logger"


// define table creation queries
const userTableCreationQuery:string = `CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT,
        userName VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    )`

const currencyTableCreationQuery:string = `CREATE TABLE IF NOT EXISTS ${CURRENCIES_TABLE_NAME} (
        id INT NOT NULL AUTO_INCREMENT,
        currency_id INT NOT NULL UNIQUE,
        currency_name VARCHAR(100) NOT NULL UNIQUE,
        currency_symbol VARCHAR(50) NOT NULL UNIQUE,
        rank INT NOT NULL,
        is_active INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    )`

    const currentDataTableCreationQuery:string =  `CREATE TABLE IF NOT EXISTS ${CURRENT_DATA_TABLE_NAME} (
        id INT NOT NULL AUTO_INCREMENT,
        ${CURRENCIES_TABLE_NAME}_id INT NOT NULL,
        current_price DECIMAL (20,5) NOT NULL,
        volume_24h DECIMAL(20,5) NOT NULL,
        market_cap DECIMAL(20,5) NOT NULL,
        market_cap_dominance DECIMAL (20,5) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_${CURRENCIES_TABLE_NAME}
            FOREIGN KEY (${CURRENCIES_TABLE_NAME}_id) REFERENCES ${CURRENCIES_TABLE_NAME} (currency_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
    )`

    const percentageChangeTableCreationQuery:string =  `CREATE TABLE IF NOT EXISTS ${PERCENTAGE_CHANGE_RECENT_TABLE_NAME} (
        id INT NOT NULL AUTO_INCREMENT,
        ${CURRENCIES_TABLE_NAME}_id INT NOT NULL,
        percentage_one_hour DECIMAL NOT NULL,
        percentage_twenty_four_hour DECIMAL NOT NULL,
        percentage_seven_day DECIMAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_percentage_${CURRENCIES_TABLE_NAME}
            FOREIGN KEY (${CURRENCIES_TABLE_NAME}_id) REFERENCES ${CURRENCIES_TABLE_NAME} (currency_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
    )`

    const percentageChangeHistoryTableCreationQuery:string =  `CREATE TABLE IF NOT EXISTS ${PERCENTAGE_CHANGE_HISTORY_TABLE_NAME} (
        id INT NOT NULL AUTO_INCREMENT,
        ${CURRENCIES_TABLE_NAME}_id INT NOT NULL,
        percentage_third_day DECIMAL NOT NULL,
        percentage_sixty_day DECIMAL NOT NULL,
        percentage_ninety_day DECIMAL NOT NULL,
        PRIMARY KEY (id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_percentage_history_${CURRENCIES_TABLE_NAME}
            FOREIGN KEY (${CURRENCIES_TABLE_NAME}_id) REFERENCES ${CURRENCIES_TABLE_NAME} (currency_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
    )`

/**
/ * The only function allowed to perform table creations on server startup
/* @returns boolean for success
/* @remarks failure cases on this function are intended to stop the server running
 */
export const createAllTablesModel = async ():Promise<boolean> => {
    styledLog("Performing Tables Creation if none exist", "info")

    // attempt to retrieve DB Connection
    const dbConnection: PoolConnection | undefined = await getDataBasePoolConnection()
    if(!dbConnection || dbConnection === undefined){
        trackLogger({action: "error_file", logType: "error", callFunction: "createAllTablesModel", 
            message: "createAllTablesController has a missing dbConnection"})
        return false
    }

    try{

        // create userTable
        const userCreateResult = await tableCreationHelper(dbConnection, "users", userTableCreationQuery)
        if(userCreateResult === false){
            return false
        }else{
            styledLog(' - User Table created / present in Database', "success")
        }

        // create currency table
        const currenyCreateResult = await tableCreationHelper(dbConnection, CURRENCIES_TABLE_NAME, currencyTableCreationQuery)
        if(currenyCreateResult === false){
            return false
        }else{
            styledLog(' - Currency Table created / present in Database', "success")
        }

        // create current data table
        const currentDataCreateResult = await tableCreationHelper(dbConnection, CURRENT_DATA_TABLE_NAME, currentDataTableCreationQuery)
        if(currentDataCreateResult === false){
            return false
        }else{
            styledLog(' - Current Data Table created / present in Database', "success")
        }

        // create percentage recent table
        const percentageRecentCreateResult = await tableCreationHelper(dbConnection, PERCENTAGE_CHANGE_RECENT_TABLE_NAME, percentageChangeTableCreationQuery)
        if(percentageRecentCreateResult === false){
            return false
        }else{
            styledLog(' - Percentage Recent Table created / present in Database', "success")
        }

        // create percentage history table
        const percentageHistoryCreateResult = await tableCreationHelper(dbConnection, PERCENTAGE_CHANGE_HISTORY_TABLE_NAME, percentageChangeHistoryTableCreationQuery)
        if(percentageHistoryCreateResult === false){
            return false
        }else{
            styledLog(' - Percentage History Table created / present in Database', "success")
        }
        
        // success
        styledLog("Tables Creation Completed", "success")
        return true
    }catch(error){
        trackLogger({action: "error_file", logType: "error", callFunction: "createAllTablesModel", 
                message: `An Error occured during tables creation as: ${error}`})
         return false
    }finally{
        if(dbConnection !== undefined){
            await dbConnection.release();
        }
    }
}

/** Helper Function to check for table presence and execute creation query
 * @param dbConnection connection to DB
 * @param tableName for creation and error logging
 * @param tableCreationQuery creation query to execute
 * @returns boolean for success
 * @remarks this function is intended to use a reusable db connection and relies on the caller to release it
 */
const tableCreationHelper = async (dbConnection: PoolConnection, tableName: string, tableCreationQuery: string):Promise<boolean> => {

    try{    
        await dbConnection.query(tableCreationQuery)
        // confirm table presence
        const tableCreatedPresenceResult = await dbConnection.query(`SHOW TABLES LIKE '${tableName}'`)
        if(tableCreatedPresenceResult && Array.isArray(tableCreatedPresenceResult) && tableCreatedPresenceResult.length > 0){
            return true
        }else{
            trackLogger({action: "error_file", logType: "error", callFunction: "tableCreationHelper", 
                message: `Failed to get a result for table present in DB as : ${tableName}. Check Database Tables`})
            return false
        }
    }catch(error){
        trackLogger({action: "error_file", logType: "error", callFunction: "tableCreationHelper", 
            message: `Error occured during table creation as: ${error}`})
        return false
    }
}


