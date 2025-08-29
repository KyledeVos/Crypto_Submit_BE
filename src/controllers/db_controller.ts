import mariaDB, {Pool, PoolConnection} from "mariadb"
// import {createAllTablesController} from "../src/models/database_tables_creation"
import {databaseSetUpType} from "../types/server_database_types"
import {DATABASE_NAME_CONST} from "../constants/constants_database"
import {styledLog, trackLogger} from "../utilities/logger"

// database connection pool
let globalDbConnectionPool: Pool | undefined = undefined

/**
 * Controls database processes on application startup following steps as
 * 1) Create Pool
 * 2) Check for Database - create if not found
 * 3) Confirm connection to the database
 * @param dbConnectionInfo type databaseSetUpType
 * @returns Connection Pool for connection creation, undefined in there is an error
 * @remarks this function performs its own internal logging
 */
export const DBController = async (dbConnectionInfo: databaseSetUpType):Promise<Pool | undefined> => {

    try{
        
        // call for pool creation
        const dbPool = await createDBPool(dbConnectionInfo)
        if(dbPool === undefined){
            return undefined
        }
        
        // create database if not already present
        const databaseCreationResult = await createDatabase(dbPool)
        if(databaseCreationResult === undefined){
            trackLogger({action: "error_file", logType: "error", callFunction: "DBController -> createDatabase", 
                message: "Failed to create / check database"})
            return undefined
        }else if(databaseCreationResult !== "success"){
            trackLogger({action: "error_file", logType: "error", callFunction: "DBController -> createDatabase", 
                message: databaseCreationResult})
            return undefined
        }

        // confirm connection to database
        const databaseConnectionResult = await checkDatabaseConnection(dbPool)
        if(databaseConnectionResult === undefined){
            trackLogger({action: "error_file", logType: "error", callFunction: "DBController -> checkDatabaseConnection", 
                message: "Failed to confirm database connection"})
            return undefined
        }else if(databaseConnectionResult !== "success"){
            trackLogger({action: "error_file", logType: "error", callFunction: "DBController -> checkDatabaseConnection", 
                message: databaseConnectionResult})
            return undefined
        }
        
        // Success Case
        globalDbConnectionPool = dbPool
        return dbPool

    }catch(error){
        trackLogger({action: "error_file", logType: "error", callFunction: "DBController", 
            message: `Error occured in Database connection attempt as: ${error}`})
        return undefined
    }
}

/**
 * Helper - create a database pool
 * @param dbConnectionInfo type databaseSetUpType
 * @returns Connection Pool for connection creation, undefined in there is an error
 * @remarks this function performs its own internal logging for an error
 */
export const createDBPool = async(dbConnectionInfo: databaseSetUpType):Promise<Pool | undefined> => {
    try{
    const dbConnection:Pool = mariaDB.createPool({
        host: dbConnectionInfo.dbHostName,
        user: dbConnectionInfo.dbUser,
        password: dbConnectionInfo.dbPassword,
        port: dbConnectionInfo.dbPort,
        connectionLimit: dbConnectionInfo.dbConnectionLimit
    })
    return dbConnection
    }catch(error){
        trackLogger({action: "error_file", logType: "error", callFunction: "createDBPool", 
            message: `Error occured as: ${error}`})
        return undefined
    }
}

/**
 * Creates the database (if already present then simply skips with query)
 * @param dbPool instance of database connection pool
 * @param testDBName - optional - pass in for unit tests
 * @returns string - 'success' or description of error
 */
export const createDatabase = async(dbConnectionPool: Pool, testDBName?: string):Promise<string> => {
    if (!dbConnectionPool || dbConnectionPool === undefined){
        return "Missing dbPool, cannot create database"
    }

    if(!testDBName && (!DATABASE_NAME_CONST || DATABASE_NAME_CONST === undefined || typeof DATABASE_NAME_CONST !== "string" || DATABASE_NAME_CONST.trim() === "")){
        return  "Database name in constants is missing"
    }

    let connection: PoolConnection | undefined = undefined 
    try{
        connection = await dbConnectionPool.getConnection();
        let queryStatement: string = ""
        if(testDBName !== undefined && typeof testDBName === "string" && testDBName.trim() !== ""){
            queryStatement = `CREATE DATABASE IF NOT EXISTS ${testDBName}`
        }else{
            queryStatement = `CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME_CONST}`
        }
        await connection.query(queryStatement)
        return "success";
    }catch(error){
        console.log(error)
        return `Error occured during attempt to create database as: ${error}`
    }finally{
        connection?.release();
    }
}

/**
 * Helper Function - Checks if the current database for this application exists
 * @param dbPool instance of database connection pool
 * @returns boolean
 */
export const checkDatabaseConnection = async(dbPool: Pool, testDBName?: string):Promise<string> => {
    if(!dbPool || dbPool === undefined){
        return "false"
    }

    let connection: PoolConnection | undefined = undefined 
    try{
        const queryStatement = `SHOW DATABASES LIKE '${testDBName? testDBName : DATABASE_NAME_CONST}'`
        connection = await dbPool.getConnection();
        const existsCheckResult = await connection.query(queryStatement)
        if(existsCheckResult && Array.isArray(existsCheckResult) && existsCheckResult.length > 0){
            return "success"
        }else{
            return "Failed to get a result for database creation."
        }

    }catch(error){
        return `{Error during checkDatabaseConnection as ${error}}`
    }finally{
        connection?.release()
    } 
}


export const getDataBasePoolConnection = async():Promise<PoolConnection | undefined> => {
    try{
        if(globalDbConnectionPool === undefined){
            trackLogger({action: "error_file", logType: "error", callFunction: "getDataBasePoolConnection", 
                message: "global connection pool is undefined"})
            return undefined
        }
        const dbConnection = await globalDbConnectionPool.getConnection();
        if(dbConnection === undefined){
            trackLogger({action: "error_file", logType: "error", callFunction: "getDataBasePoolConnection", 
                message: "Failed to create a db connection"})
            return undefined
            }
        return dbConnection
    }catch(error){
        trackLogger({action: "error_file", logType: "error", callFunction: "getDataBasePoolConnection", 
            message: `Error during db connection creation as: ${error}`})
        return undefined
        }
}
