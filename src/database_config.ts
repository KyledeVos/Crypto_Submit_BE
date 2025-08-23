/**
 * @module database_config.ts
 * This module acts as a governor for the database pool and is called by the server.ts to create
 * a database pool. It is crucial that the server.ts already validated .env data before population here.
 */
import mariaDB, {Pool, PoolConnection} from "mariadb"
import {databaseSetUpType} from "./types/server_database_types"
import {DATABASE_NAME, COIN_TABLE} from "./constants"

// define database connection values
let dbHostNameValidated: string | undefined = undefined
let dbUserValidated: string | undefined = undefined
let dbPasswordValidated: string | undefined = undefined
let dbPortValidated: number | undefined = undefined
let dbConnectionLimitValidated: number | undefined = undefined

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
        // Success Case
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
        const queryStatement = `SELECT table_name from information_schema.tables WHERE table_schema = '${DATABASE_NAME}'`
        connection = await dbPool.getConnection();
        const rows = await connection.query(queryStatement)
        if (rows === undefined){
            return {error: true, errorMessage: `checkDatabaseConnection failed to connect with database as: ${DATABASE_NAME}`}
        }
        return {error: false}

    }catch(error){
        console.log(error)
        return {error:true, errorMessage: `Error occured during attempt to query Database as: ${error}`}
    }   

}
