import mariaDB from "mariadb"
import {databaseSetUpType} from "./types/server_database_types"

// define database connection values
let dbHostNameValidated: string | undefined = undefined
let dbUserValidated: string | undefined = undefined
let dbPasswordValidated: string | undefined = undefined
let dbConnectionLimitValidated: number | undefined = undefined

/**
 * Function to validate and set database connection values
 */
export const validateSetDatabaseConnectValues = (
    dbHostName: string | undefined,
    dbUser: string | undefined,
    dbPassword: string | undefined,
    dbConnectionLimit: string | undefined 
): string => {

    return "success"

}


// const pool = mariaDB.createPool({
//     host
// })