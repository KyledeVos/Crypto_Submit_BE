/**
 * @module env_check.ts
 * This module provides functions to validate data used by the server during setup
 * Imports types for data consistency and safeguarding returns
 */

import {serverSetUp} from '../types/server_types'

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