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
): {error: boolean, message?: string} => {

    try{
        // blank or missing checks
        if(!dbHostName || dbHostName === undefined || typeof dbHostName !== "string" || dbHostName.trim() === ""){
            return {error: true, message: "Missing DB Host Name"}
        }else if(!dbUser || dbUser === undefined || typeof dbUser !== "string" || dbUser.trim() === ""){
            return {error: true, message: "Missing DB User"}
        }else if(!dbPassword || dbPassword === undefined || typeof dbPassword !== "string" || dbPassword.trim() === ""){
            return {error: true, message: "Missing DB Password"}
        }else if(!dbConnectionLimit || dbConnectionLimit === undefined || typeof dbConnectionLimit !== "string" || dbConnectionLimit.trim() === ""){
            return {error: true, message: "Missing DB Connection Limit"}
        }

        let dbConnectionLimitNumber: number | undefined = undefined

        // attempt to cast connection limit to an integer
        try{
            dbConnectionLimitNumber = Number(dbConnectionLimit)
            if(!Number.isInteger(dbConnectionLimitNumber) || Number.isNaN(dbConnectionLimitNumber)){
                return {error: true, message: "Database Connection Limit is not a Valid Integer"}
            }else if(dbConnectionLimitNumber <= 0){
                return {error: true, message: "Database Connection Limit is less than or equal to 0"}
            }
        }catch(error){
            return {error: true, message: `Error occured in validateSetDatabaseConnectValues for connection limit cast as: ${error}`}
        }

        // Data is Valid - set data and return no error
        dbHostNameValidated = dbHostName
        dbUserValidated = dbUser
        dbPasswordValidated = dbPassword
        dbConnectionLimitValidated = dbConnectionLimitNumber

        return {error: false}

    }catch(error){
        return {error: true, message: `Error occured in validateSetDatabaseConnectValues as: ${error}`}
    }




}


// const pool = mariaDB.createPool({
//     host
// })