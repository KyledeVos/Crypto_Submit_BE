/**
 * @module database_config.ts
 * This module acts as a governor for the database pool and is called by the server.ts to create
 * a database pool. It is crucial that the server.ts already validated .env data before population here.
 */
import mariaDB, {Pool, PoolConnection} from "mariadb"
import {createAllTablesController} from "../src/models/database_tables_creation"
import {databaseSetUpType} from "./types/server_database_types"
import {DATABASE_NAME_CONST} from "./constants/constants_database"

// define database connection values
let dbHostNameValidated: string | undefined = undefined
let dbUserValidated: string | undefined = undefined
let dbPasswordValidated: string | undefined = undefined
let dbPortValidated: number | undefined = undefined
let dbConnectionLimitValidated: number | undefined = undefined

// database connection pool
let globalDbConnectionPool: Pool | undefined = undefined

/**
 * Sets database values in this module, but relies on validation being completed first
 * @param data of type databaseSetUpType containing validated host, user, password, port and connection limit for database pool
 */
export const setDatabaseValues = (data:databaseSetUpType) => {
    dbHostNameValidated = data.dbHostName
    dbUserValidated = data.dbUser
    dbPasswordValidated = data.dbPassword
    dbPortValidated = data.dbPort
    dbConnectionLimitValidated = data.dbConnectionLimit
}

/**
 * Attempts to create a maria DB Connection
 * @returns object with connectionPool used to create connections or undefined if failed, errorMessage if failure
 */
export const createDatabasePool = async ():Promise<{connectionPool: Pool | undefined, errorMessage?: string}> => {

    try{
        const dbConnection:Pool = mariaDB.createPool({
            host: dbHostNameValidated,
            user: dbUserValidated,
            password: dbPasswordValidated,
            port: dbPortValidated,
            connectionLimit: dbConnectionLimitValidated
        })

        // attempt a connection to the DB on startup
        const connectionCheck = await checkDatabaseConnection(dbConnection)
        if(connectionCheck === undefined){
            return {connectionPool: undefined, errorMessage: "Failed to validate Database Connection, returned undefined"}
        }else if(connectionCheck.error && connectionCheck.errorMessage){
            return {connectionPool: undefined, errorMessage: connectionCheck.errorMessage} 
        }

        // attempt to create database
        const databaseCreationResult = await createDatabaseVerify(dbConnection);
        if(databaseCreationResult === undefined){
            return {connectionPool: undefined, errorMessage: "Failed to create database"}
        }else if(databaseCreationResult.error && databaseCreationResult.message){
            return {connectionPool: undefined, errorMessage: connectionCheck.errorMessage} 
        }

        // Success Case
        globalDbConnectionPool = dbConnection
        return {connectionPool: dbConnection}

    }catch(error){
        return {connectionPool: undefined, errorMessage: `Error occured in Database connection attempt as: ${error}`}
    }
}

/**
 * Helper Function performing a check of the database connection on server startup
 * @returns object with error boolean and message if an error does occur
 */
export const checkDatabaseConnection = async(dbPool: Pool):Promise<{error: boolean, errorMessage? :string}> => {
    if(!dbPool || dbPool === undefined){
        return {error: true, errorMessage: "Database connection pool passed to checkDatabaseConnection is undefined"}
    }

    let connection: PoolConnection | undefined = undefined

    try{
        const queryStatement = `SELECT table_name from information_schema.tables WHERE table_schema = '${DATABASE_NAME_CONST}'`
        connection = await dbPool.getConnection();
        const rows = await connection.query(queryStatement)
        if (rows === undefined){
            return {error: true, errorMessage: `checkDatabaseConnection failed to connect with database as: ${DATABASE_NAME_CONST}`}
        }
        return {error: false}

    }catch(error){
        console.log(error)
        return {error:true, errorMessage: `Error occured during attempt to query Database as: ${error}`}
    }   

}

export const createDatabaseVerify = async(dbConnectionPool: Pool, testDBName?: string):Promise<{error: boolean, message?:string}> => {
    if (!dbConnectionPool || dbConnectionPool === undefined){
        return {error: true, message: "createDataBase was not given a connection pool"}
    }

    if(!testDBName && (!DATABASE_NAME_CONST || DATABASE_NAME_CONST === undefined || typeof DATABASE_NAME_CONST !== "string" || DATABASE_NAME_CONST.trim() === "")){
        return {error: true, message: "Database name in constants is missing"}
    }

    let connection: PoolConnection | undefined = undefined

    try{
        let queryStatement: string = ""
        if(testDBName !== undefined && typeof testDBName === "string" && testDBName.trim() !== ""){
            queryStatement = `CREATE DATABASE IF NOT EXISTS ${testDBName}`
        }else{
            queryStatement = `CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME_CONST}`
        }
        
        connection = await dbConnectionPool.getConnection();
        await connection.query(queryStatement)

        // confirm database does exist
        const existsStatement = `SHOW DATABASES LIKE '${testDBName? testDBName : DATABASE_NAME_CONST}'`
        const existsCheckResult = await connection.query(existsStatement)
        if(existsCheckResult && Array.isArray(existsCheckResult) && existsCheckResult.length > 0){
            return {error: false}
        }else{
            return {error: true, message: "Failed to get a result for database creation. Server run will be terminated, check databases"}
        }
        

    }catch(error){
        console.log(error)
        return {error:true, message: `Error occured during attempt to create database as: ${error}`}
    } 
}

// return a new connection
export const getDataBasePoolConnection = async ():Promise<PoolConnection | undefined> => {
    const connection = await globalDbConnectionPool?.getConnection();
    connection?.query(`USE ${DATABASE_NAME_CONST}`)
    return connection
}