/**
 * @module env_check.ts
 * This module provides functions to validate data used by the server during setup
 * Imports types for data consistency and safeguarding returns
 */

import {serverSetUp, databaseSetUpType} from '../types/server_database_types'

/**
 * Validates the .env fields used to start the server
 * @param server_url_env - could be string or null
 * @param server_port_env - could be string or null
 * @param server_mode_env - could be string or null
 * @returns String if there is an error, Object containing server_url (string), server_port (number), server_mode of type 'development_env'
 * @throws an error if types are mismatched or conversion of port from string to number fails. Returns a string
 */
export const serverVariablesCheck = (
        server_url_env: string | undefined, 
        server_port_env: string | undefined, 
        server_mode_env: string | undefined 
    ):serverSetUp | string => {
    try{
        //server_port conversion
        let server_port_number_env: number | undefined = undefined

        // dev check if env values were simply not set
        if(server_url_env === undefined && server_port_env === undefined && server_mode_env === undefined){
            return "Missing Server ENV values - check if the .env was created with .env_blank template and values added"
        }

        // check url
        if(!server_url_env || typeof server_url_env === undefined || server_url_env.trim() === ""){
            return "Missing Server URL";
        }

        // check port
        if(!server_port_env || typeof server_port_env === undefined || server_port_env.trim() === ""){
            return "Missing Server Port"
        }

        // ensure server port is a valid number
        try{
            server_port_number_env = Number(server_port_env)
            if(!Number.isInteger(server_port_number_env) || Number.isNaN(server_port_number_env)){
                return "Server port is not a valid int."
            }
        }catch(error){
            return `Error occured casting server port to number as: ${error}`
        }

        // check mode has been set
        if(!server_mode_env || typeof server_mode_env === undefined || 
            typeof server_mode_env !== "string" || server_mode_env.trim() === "" ||
            (server_mode_env !== "development" && server_mode_env !== "production")){
            return "Server mode is missing / not properly configured"
        }

        // success return
        const dataReturn: serverSetUp = {
            server_url: server_url_env,
            server_port: server_port_number_env,
            server_mode: server_mode_env
        }
        return dataReturn

    }catch(error){
        return `Error occured during server env checks as: ${error}`
    }
}

/**
 * Validates the .env fields used to create a database connection
 * @param dbHostName - could be string or null
 * @param dbUser - could be string or null
 * @param dbPassword - could be string or null
 * @param dbPort - could be string or null
 * @param dbConnectionLimit - could be string or null
 * @returns boolean error, message describing the error. If success, object called 'databaseData' with host, user, password, port and connection limit
 */
export const validateSetDatabaseConnectValues = (
    dbHostName: string | undefined,
    dbUser: string | undefined,
    dbPassword: string | undefined,
    dbPort: string | undefined,
    dbConnectionLimit: string | undefined 
): {error: boolean, message?: string, databaseData?: databaseSetUpType} => {

    // dev quick check that the .env was created and populated
    if(dbHostName === undefined && dbUser === undefined && dbPassword === undefined && dbPort === undefined && dbConnectionLimit === undefined){
        return {error: true, message: "Missing Server ENV values - check if the .env was created with .env_blank template and values added"}
    }

    try{
        // blank or missing checks
        if(!dbHostName || dbHostName === undefined || typeof dbHostName !== "string" || dbHostName.trim() === ""){
            return {error: true, message: "Missing DB Host Name"}
        }else if(!dbUser || dbUser === undefined || typeof dbUser !== "string" || dbUser.trim() === ""){
            return {error: true, message: "Missing DB User"}
        }else if(!dbPassword || dbPassword === undefined || typeof dbPassword !== "string" || dbPassword.trim() === ""){
            return {error: true, message: "Missing DB Password"}
        }else if(!dbPort || dbPort === undefined || typeof dbPort !== "string" || dbPort.trim() === ""){
            return {error: true, message: "Missing DB Port"}
        }else if(!dbConnectionLimit || dbConnectionLimit === undefined || typeof dbConnectionLimit !== "string" || dbConnectionLimit.trim() === ""){
            return {error: true, message: "Missing DB Connection Limit"}
        }

        let dbPortNumber: number | undefined = undefined
        let dbConnectionLimitNumber: number | undefined = undefined

        // attempt to cast database port to an integer
        try{
            dbPortNumber = Number(dbPort)
            if(!Number.isInteger(dbPortNumber) || Number.isNaN(dbPortNumber)){
                return {error: true, message: "Database Port is not a Valid Integer"}
            }else if(dbPortNumber <= 0){
                return {error: true, message: "Database Port is less than or equal to 0"}
            }
        }catch(error){
            return {error: true, message: `Error occured in validateSetDatabaseConnectValues for database port cast as: ${error}`}
        }

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
        return{
            error: false,
            databaseData: {
                dbHostName: dbHostName,
                dbUser: dbUser,
                dbPassword: dbPassword,
                dbPort: dbPortNumber,
                dbConnectionLimit: dbConnectionLimitNumber
            }
        }
    }catch(error){
        return {error: true, message: `Error occured in validateSetDatabaseConnectValues as: ${error}`}
    }
}

/**
 * Validates the .env field for the Coin API Key
 * @param coinKey - could be string or null
 * @returns boolean error, message describing the error
 */
export const validateCoinAPIKey = (
    coinKey: string | undefined,
): {error: boolean, message?: string} => {

    if(coinKey === undefined || typeof coinKey !== 'string' || coinKey.trim() === ""){
        return {error: true, message: "Coin API key is missing / blank"}
    }else{
        return{error: false}
    }
}