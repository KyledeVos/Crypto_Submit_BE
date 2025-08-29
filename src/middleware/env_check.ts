/**
 * @module env_check.ts
 * This module provides functions to validate data used by the server during setup
 * Imports types for data consistency and safeguarding returns
 */

import {serverSetUp, databaseSetUpType} from '../types/server_database_types'
import {trackLogger, styledLog} from "../utilities/logger"

/**
 * Validates the .env fields used to start the server
 * @param server_url_env - could be string or undefined
 * @param server_port_env - could be string or undefined
 * @param server_mode_env - could be string or undefined
 * @returns String if there is an error, Object containing server_url (string), server_port (number), server_mode of type 'development_env'
 * @throws an error if types are mismatched or conversion of port from string to number fails. Returns a string
 * @remarks this function will perform its own logging calls for internal errors
 */
export const serverVariablesCheck = (
        server_url_env: string | undefined, 
        server_port_env: string | undefined, 
        server_mode_env: string | undefined 
    ):serverSetUp | undefined => {
    try{
        styledLog("Called for Server Fields Validation", "info")
        //server_port conversion
        let server_port_number_env: number | undefined = undefined

        // dev check if env values were simply not set
        if(server_url_env === undefined && server_port_env === undefined && server_mode_env === undefined){
            trackLogger({action: "error_file", logType: "error", callFunction: "serverVariablesCheck", 
                message: "Missing Server .env variables - check for missing or not-setup .env"})
            return undefined
        }

        // check url
        if(!server_url_env || typeof server_url_env === undefined || server_url_env.trim() === ""){
            trackLogger({action: "error_file", logType: "error", callFunction: "serverVariablesCheck", message: "Missing server url"})
            return undefined    
        }

        // check port
        if(!server_port_env || typeof server_port_env === undefined || server_port_env.trim() === ""){
            trackLogger({action: "error_file", logType: "error", callFunction: "serverVariablesCheck", message: "Missing Server Port"})
            return undefined
        }

        // ensure server port is a valid number
        try{
            server_port_number_env = Number(server_port_env)
            if(!Number.isInteger(server_port_number_env) || Number.isNaN(server_port_number_env)){
                trackLogger({action: "error_file", logType: "error", callFunction: "serverVariablesCheck", message: "Server port is not a valid int"})
                return undefined
            }
        }catch(error){
                trackLogger({action: "error_file", logType: "error", callFunction: "serverVariablesCheck", 
                    message: `Error occured casting server port to number as: ${error}`})
                return undefined
        }

        // check mode has been set
        if(!server_mode_env || typeof server_mode_env === undefined || 
            typeof server_mode_env !== "string" || server_mode_env.trim() === "" ||
            (server_mode_env !== "development" && server_mode_env !== "production")){
                trackLogger({action: "error_file", logType: "error", callFunction: "serverVariablesCheck", 
                    message: "Server mode is missing / not properly configured"})
                return undefined
        }
        styledLog(`Server .env fields valid. Checked at: ${new Date()}`, "success")
        // success return
        const dataReturn: serverSetUp = {
            server_url: server_url_env,
            server_port: server_port_number_env,
            server_mode: server_mode_env
        }
        return dataReturn

    }catch(error){
        trackLogger({action: "error_file", logType: "error", callFunction: "serverVariablesCheck", 
            message: `Error occured during server env checks as: ${error}`})
        return undefined
    }
}

/**
 * Validates the .env fields used to create a database connection
 * @param dbHostName - could be string or undefined
 * @param dbUser - could be string or undefined
 * @param dbPassword - could be string or undefined
 * @param dbPort - could be string or undefined
 * @param dbConnectionLimit - could be string or undefined
 * @returns data of type 'databaseSetUpType' if valid, undefined if not
 * @remarks this function will perform its own logging calls for internal errors
 */
export const validateSetDatabaseConnectValues = (
    dbHostName: string | undefined,
    dbUser: string | undefined,
    dbPassword: string | undefined,
    dbPort: string | undefined,
    dbConnectionLimit: string | undefined 
): databaseSetUpType | undefined => {
    styledLog("Called for Database Fields Validation", "info")

    // dev quick check that the .env was created and populated
    if(dbHostName === undefined && dbUser === undefined && dbPassword === undefined && dbPort === undefined && dbConnectionLimit === undefined){
        trackLogger({action: "error_file", logType: "error", callFunction: "validateSetDatabaseConnectValues", 
            message: "Missing DB .env values - check for missing or not-setup .env"})
        return
    }

    try{
        // blank or missing checks
        if(!dbHostName || dbHostName === undefined || typeof dbHostName !== "string" || dbHostName.trim() === ""){
            trackLogger({action: "error_file", logType: "error", callFunction: "validateSetDatabaseConnectValues", 
            message: "Missing .env DB Host Name"})
            return undefined
        }else if(!dbUser || dbUser === undefined || typeof dbUser !== "string" || dbUser.trim() === ""){
            trackLogger({action: "error_file", logType: "error", callFunction: "validateSetDatabaseConnectValues", 
            message: "Missing .env DB User"})
            return undefined
        }else if(!dbPassword || dbPassword === undefined || typeof dbPassword !== "string" || dbPassword.trim() === ""){
            trackLogger({action: "error_file", logType: "error", callFunction: "validateSetDatabaseConnectValues", 
            message: "Missing .env dbPassword"})
            return undefined
        }else if(!dbPort || dbPort === undefined || typeof dbPort !== "string" || dbPort.trim() === ""){
            trackLogger({action: "error_file", logType: "error", callFunction: "validateSetDatabaseConnectValues", 
            message: "Missing .env dbPort"})
            return undefined
        }else if(!dbConnectionLimit || dbConnectionLimit === undefined || typeof dbConnectionLimit !== "string" || dbConnectionLimit.trim() === ""){
            trackLogger({action: "error_file", logType: "error", callFunction: "validateSetDatabaseConnectValues", 
            message: "Missing .env dbConnectionLimit"})
            return undefined
        }

        let dbPortNumber: number | undefined = undefined
        let dbConnectionLimitNumber: number | undefined = undefined

        // attempt to cast database port to an integer
        try{
            dbPortNumber = Number(dbPort)
            if(!Number.isInteger(dbPortNumber) || Number.isNaN(dbPortNumber)){
                trackLogger({action: "error_file", logType: "error", callFunction: "validateSetDatabaseConnectValues", 
                message: "Database Port is not a Valid Integer"})
                return undefined
            }else if(dbPortNumber <= 0){
                trackLogger({action: "error_file", logType: "error", callFunction: "validateSetDatabaseConnectValues", 
                message: "Database Port is less than or equal to 0"})
                return undefined
            }
        }catch(error){
            trackLogger({action: "error_file", logType: "error", callFunction: "validateSetDatabaseConnectValues", 
            message: `Error occured for database port cast as: ${error}`})
            return undefined
        }

        // attempt to cast connection limit to an integer
        try{
            dbConnectionLimitNumber = Number(dbConnectionLimit)
            if(!Number.isInteger(dbConnectionLimitNumber) || Number.isNaN(dbConnectionLimitNumber)){
                trackLogger({action: "error_file", logType: "error", callFunction: "validateSetDatabaseConnectValues", 
                message: "Database Connection Limit is not a Valid Integer"})
                return undefined
            }else if(dbConnectionLimitNumber <= 0){
                trackLogger({action: "error_file", logType: "error", callFunction: "validateSetDatabaseConnectValues", 
                message: "Database Connection Limit is less than or equal to 0"})
                return undefined
            }
        }catch(error){
                trackLogger({action: "error_file", logType: "error", callFunction: "validateSetDatabaseConnectValues", 
                message: `Error occured for connection limit cast as: ${error}`})
                return undefined
        }

        // Data is Valid
        styledLog(`Database .env fields valid. Checked at: ${new Date()}`, "success")
        return {
                dbHostName: dbHostName,
                dbUser: dbUser,
                dbPassword: dbPassword,
                dbPort: dbPortNumber,
                dbConnectionLimit: dbConnectionLimitNumber
            }
    }catch(error){
        trackLogger({action: "error_file", logType: "error", callFunction: "validateSetDatabaseConnectValues", 
        message: `Error occured as: ${error}`})
        return undefined
    }
}

/**
 * Validates the .env field for the Coin API Key
 * @param coinKey - could be string or undefined
 * @returns string if valid, undefined if not
 * @remarks this function will perform its own logging calls for internal errors
 */
export const validateCoinAPIKey = (
    coinKey: string | undefined,
): string | undefined => {
    styledLog("Called for Coin API Present Validation", "info")
    if(coinKey === undefined || typeof coinKey !== 'string' || coinKey.trim() === ""){
        trackLogger({action: "error_file", logType: "error", callFunction: "validateSetDatabaseConnectValues", 
        message: "Coin API key is missing / blank"})
        return undefined
    }
    styledLog(`Coin API Key valid. Checked at: ${new Date()}`,'success')
    return coinKey
}