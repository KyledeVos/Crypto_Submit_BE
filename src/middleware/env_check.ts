import dotenv from 'dotenv'
import {development_env, serverSetUp} from '../types/server_types'

dotenv.config()



/**
 * Validates the .env fields used to start the server
 * @returns An object containing the data to start the server or an error message string if an error occurs
 */
export const serverVariablesCheck = (server_url_env: string, server_port_env: string | null, server_mode_env: string | null ):serverSetUp | string => {

    try{
        

        //server_port conversion
        let server_port_number_env: number | null = null

        // check url
        if(!server_url_env || typeof server_url_env === null || server_url_env.trim() === ""){
            return "Missing Server URL - Process Terminated";
        }

        // check port
        if(!server_port_env || typeof server_port_env === null || server_port_env.trim() === ""){
            return "Missing Server Port - Process Terminated"
        }

        // ensure server port is a valid number
        try{
            server_port_number_env = Number(server_port_env)
            if(!Number.isInteger){
                return "Server port is not a valid int."
            }
        }catch(error){
            return `Error occured casting server port to number as: ${error}`
        }

        // check mode has been set
        if(!server_mode_env || typeof server_mode_env === null || 
            typeof server_mode_env !== "string" || server_mode_env.trim() === "" ||
            (server_mode_env !== "development" && server_mode_env !== "production")){
            return "Server mode is missing / not properly configured"
        }

        // success return
        return {
            server_url: server_url_env,
            server_port: server_port_number_env,
            server_mode: server_mode_env
        }

    }catch(error){
        return `Error occured during server env checks as: ${error}`
    }



}