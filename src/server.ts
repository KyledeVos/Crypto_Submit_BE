/**
 * @module server.ts
 * This module is the starting point of the application and is used to call for:
 * - CORS setup, server fields set, database configuration and project startup
 */

import express from 'express'
import dotenv from 'dotenv'
import chalk from 'chalk'
import { corsMiddleWare} from './middleware/cors_middleware'
import {createDatabasePool, setDatabaseValues} from "./database_config"
import {serverVariablesCheck, validateSetDatabaseConnectValues} from "./middleware/env_check"
import {serverSetUp, development_env, databaseSetUpType} from "./types/server_database_types"

dotenv.config()


/**
 * Create Server
 */
const app = express();
// setup cors middleware
app.use(corsMiddleWare)

console.log(chalk.yellow("=============================="))
console.log(chalk.yellow("SERVER STARTUP HAS BEEN CALLED\n"))


// VARIABLES FROM .ENV
// server variables
const server_url_env: string | undefined = process.env.SERVER_URL || undefined
const server_port_env: string | undefined = process.env.SERVER_PORT || undefined
const server_mode_env: development_env | undefined = (process.env.MODE as development_env) || undefined

// database variables
const databaseHost: string | undefined = process.env.MARIA_DB_HOST || undefined
const databaseUser: string | undefined = process.env.MARIA_DB_USER || undefined
const databasePassword: string | undefined = process.env.MARIA_DB_PASSWORD || undefined
const databasePort: string | undefined = process.env.MARIA_DB_PORT || undefined
const databaseConnectionLimit: string | undefined = process.env.MARIA_DB_CONNECTION_LIMIT || undefined

// --------------------------------
// Validate and assign server fields (URL, PORT and MODE) for server run
console.log(chalk.blue("Called for Server Fields Validation"))
const serverSetUpData: serverSetUp | string  = serverVariablesCheck(server_url_env, server_port_env, server_mode_env)
if(typeof serverSetUpData === "string"){
    if(serverSetUpData.trim() === ""){
      console.log(chalk.red("Server Data Setup check returned blank - Process Terminated"))
      process.exit();  
    }else{
        console.log(chalk.red(serverSetUpData))
        console.log(chalk.red("Process Terminated"))
        process.exit()
    }
}
console.log(chalk.green("Server Fields Validation Completed"))
// ----------------------

// Validate and Configure Database Setup
console.log(chalk.blue("Called for Database Fields Validation"))
const databaseValidation =  validateSetDatabaseConnectValues(databaseHost, databaseUser, databasePassword, databasePort, databaseConnectionLimit);
if(databaseValidation === undefined){
    console.log(chalk.red("validateSetDatabaseConnectValues returned unexpected undefined"))
    console.log(chalk.red("Process Terminated"))
    process.exit()
}else if(typeof databaseValidation !== "object"){
    console.log(chalk.red("validateSetDatabaseConnectValues has not returned an object as expected"))
    console.log(chalk.red("Process Terminated"))
    process.exit()
}else if(databaseValidation.error === true){
    if(databaseValidation.message !== undefined && 
        typeof databaseValidation.message === "string" && 
        databaseValidation.message.trim() !== ""){
            console.log(chalk.red(databaseValidation.message))
            console.log(chalk.red("Process Terminated"))
            process.exit()

    }else{
        console.log(chalk.red("validateSetDatabaseConnectValues has not returned an expected response"))
        console.log(chalk.red("Process Terminated"))
        process.exit()
    }
}else{
    if(!databaseValidation.databaseData || typeof databaseValidation !== "object"){
        console.log(chalk.red("validateSetDatabaseConnectValues data has not returned an expected response"))
        console.log(chalk.red("Process Terminated"))
        process.exit()
    }else{
        setDatabaseValues(databaseValidation.databaseData)
    }
}
console.log(chalk.green("Database Fields Validation Completed"))
// ----------------------

// Start the Server
// If Validations above fail, console logs show the error and server run will terminate
// before this

app.listen(serverSetUpData.server_port, serverSetUpData.server_url, () => {
    console.log(chalk.green("======================"))
    console.log(chalk.green("Server Starting. Details:"))
    console.log(chalk.green("URL:", serverSetUpData.server_url))
    console.log(chalk.green("PORT:", serverSetUpData.server_port))
    console.log(chalk.green("MODE:", serverSetUpData.server_mode))
    console.log(chalk.green("======================"))
    console.log(chalk.yellow("=============================="))
})



// simple route for basic testing
app.get('/hello', (req, res) => {
    console.log("HIT ROUTE")
    res.json({message:"connected to server"})
})


