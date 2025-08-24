import {getDataBasePoolConnection} from "../../src/database_config"
import {CURRENCIES_TABLE_NAME, CURRENT_DATA_TABLE_NAME, PERCENTAGE_CHANGE_RECENT_TABLE_NAME, PERCENTAGE_CHANGE_HISTORY_TABLE_NAME} from "../constants/constants_database"
import {databaseDefinitionType} from "../types/server_database_types"
import {PoolConnection} from "mariadb"
import chalk from "chalk"


// define table creation queries
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
        current_price DECIMAL NOT NULL,
        market_cap DECIMAL NOT NULL,
        total_coins INTEGER NOT NULL,
        market_cap_dominance DECIMAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_${CURRENCIES_TABLE_NAME}
            FOREIGN KEY (${CURRENCIES_TABLE_NAME}_id) REFERENCES ${CURRENCIES_TABLE_NAME} (id)
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
            FOREIGN KEY (${CURRENCIES_TABLE_NAME}_id) REFERENCES ${CURRENCIES_TABLE_NAME} (id)
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
            FOREIGN KEY (${CURRENCIES_TABLE_NAME}_id) REFERENCES ${CURRENCIES_TABLE_NAME} (id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
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

        // create current data table
        const currentDataCreateResult = await tableCreationHelper(dbConnection, CURRENT_DATA_TABLE_NAME, currentDataTableCreationQuery)
        if(currentDataCreateResult.error !== undefined && currentDataCreateResult.error === true){
            return {error: true, message: currentDataCreateResult.message ? currentDataCreateResult.message : "Error occured in creation of current data table"}
        }else{
            console.log(chalk.green(' - Currenct Data Table created / present in Database'))
        }

        // create percentage recent table
        const percentageRecentCreateResult = await tableCreationHelper(dbConnection, PERCENTAGE_CHANGE_RECENT_TABLE_NAME, percentageChangeTableCreationQuery)
        if(percentageRecentCreateResult.error !== undefined && percentageRecentCreateResult.error === true){
            return {error: true, message: percentageRecentCreateResult.message ? percentageRecentCreateResult.message : "Error occured in creation of percentage recent table"}
        }else{
            console.log(chalk.green(' - Percentage Recent Table created / present in Database'))
        }

        // create percentage history table
        const percentageHistoryCreateResult = await tableCreationHelper(dbConnection, PERCENTAGE_CHANGE_HISTORY_TABLE_NAME, percentageChangeHistoryTableCreationQuery)
        if(percentageHistoryCreateResult.error !== undefined && percentageHistoryCreateResult.error === true){
            return {error: true, message: percentageHistoryCreateResult.message ? percentageHistoryCreateResult.message : "Error occured in creation of percentage history table"}
        }else{
            console.log(chalk.green(' - Percentage History Table created / present in Database'))
        }
        
        return {error: false}
    }catch(error){
        return {error: true, message: `An Error occured during tables creation as: ${error}`}
    }finally{
        await dbConnection.release();
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


