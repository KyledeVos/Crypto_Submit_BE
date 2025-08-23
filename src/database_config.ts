/**
 * @module database_config.ts
 * This module acts as a governor for the database pool and is called by the server.ts to create
 * a database pool. It is crucial that the server.ts already validated .env data before population here.
 */
import mariaDB, {Pool} from "mariadb"
import {databaseSetUpType} from "./types/server_database_types"

// define database connection values
let dbHostNameValidated: string | undefined = undefined
let dbUserValidated: string | undefined = undefined
let dbPasswordValidated: string | undefined = undefined
let dbPortValidated: number | undefined = undefined
let dbConnectionLimitValidated: number | undefined = undefined


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
        return {connectionPool: dbConnection}

    }catch(error){
        return {connectionPool: undefined, errorMessage: `Error occured in Database connection attempt as: ${error}`}
    }
}

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
