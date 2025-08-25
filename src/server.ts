/**
 * @module server.ts
 * This module is the starting point of the application and is used to call for:
 * - CORS setup, server fields set, database configuration and project startup
 */

import express from 'express'
import dotenv from 'dotenv'
import chalk from 'chalk'
import {Pool} from 'mariadb'
import { corsMiddleWare} from './middleware/cors_middleware'
import {createDatabasePool, setDatabaseValues, checkDatabaseConnection} from "./database_config"
import {serverVariablesCheck, validateSetDatabaseConnectValues, validateCoinAPIKey} from "./middleware/env_check"
import {createAllTablesController} from "../src/models/database_tables_creation"
import {serverSetUp, development_env, databaseSetUpType} from "./types/server_database_types"
import {cryptoInitialCheckController} from "./controllers/crypto_controller"
import {getLatestData} from "../src/services/crypto_service"

// routes import
import crypto_routes from './routes/crypto_routes'

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

// coinkey
const coinAPIKeyEnv: string | undefined = process.env.COIN_API_KEY || undefined

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
console.log(chalk.green("Server Fields Validation Completed\n"))
// ----------------------

// Validate and Configure Database Setup Values
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
        // Success Case - Set the DB values from .env
        setDatabaseValues(databaseValidation.databaseData)
    }
}
console.log(chalk.green("Database Fields Validation Completed\n"))
// ----------------------

// Validate presence of Coin API Key
console.log(chalk.blue("Called for Coin API Present Validation"))
const validatedCoinAPIKey = validateCoinAPIKey(coinAPIKeyEnv);
if(validateCoinAPIKey === undefined){
    console.log(chalk.red("validateCoinAPIKey returned undefined"))
    console.log(chalk.red("Process Terminated"))
    process.exit()
}else if(typeof validatedCoinAPIKey !== "object" || validatedCoinAPIKey.error === undefined){
    console.log(chalk.red("validateCoinAPIKey return of unknown type"))
    console.log(chalk.red("Process Terminated"))
    process.exit()
}else if(validatedCoinAPIKey.error === true){
    if(validatedCoinAPIKey.message && typeof validatedCoinAPIKey.message === "string" && validatedCoinAPIKey.message.trim() !== ""){
        console.log(chalk.red(validatedCoinAPIKey.message))
    }else{
        console.log(chalk.red("validateCoinAPIKey has an error, but did not return a message"))
    }
    console.log(chalk.red("Process Terminated"))
    process.exit() 
}
console.log(chalk.green("Coin API Present Validation Completed\n"))
// ------------------------

// Create Database Pool
let poolConnection: Pool | undefined = undefined

/**
 * Attempts to retrieve a connectionPool from mariaDB
 * @returns connectionPool used to create connections or logs an error and then terminates the server run
 */
export const poolConnectionHandler = async () => {
    console.log(chalk.blue("Called for Database Connection Pool Creation"))
    try{
        const connectionPoolResult = await createDatabasePool()
        if(connectionPoolResult.connectionPool === undefined){
            if(connectionPoolResult.errorMessage !== "undefined" && typeof connectionPoolResult.errorMessage === "string" && connectionPoolResult.errorMessage.trim() !== ""){
                console.log(chalk.red(connectionPoolResult.errorMessage))
            }else{
                console.log("Error during DB Connection pool creation, no error message provided.")
            }
            console.log(chalk.red("Process Terminated"))
            process.exit()
        }else{
            // Success Case
            return connectionPoolResult.connectionPool;
            
        }
    }catch(error){
        console.log(chalk.red(`Error occurred trying to create database connection pool as: ${error}`))
        console.log(chalk.red("Process Terminated"))
        process.exit()
    }
}

/**
 * An async handler to await the promise from 'poolConnectionHandler' and then start up the server
 */
const serverStart = async() => {
    // Call for creation of connection pool - also performs a first connection query to validate connection on startup
    poolConnection = await poolConnectionHandler();

    console.log(chalk.green("Database Connnection Pool Created\n"))
    
    // Perform tables creation
    console.log(chalk.blue("Performing Tables Creation if none exist"))
    const creationResult = await createAllTablesController()
    if(creationResult === undefined){
        console.log(chalk.red('Error occurred trying to create database tables. No Result recieved'))
        console.log(chalk.red("Process Terminated"))
        process.exit() 
    }else if(creationResult.error && creationResult.message){
        if(typeof creationResult.message === 'string' && creationResult.message.trim() !== ""){
            console.log(chalk.red(creationResult.message))
        }else{
            console.log(chalk.red("Error occured during tables creation but no message was received"))
        }
        console.log(chalk.red("Process Terminated"))
        process.exit() 
    }
    console.log(chalk.blue("Tables Creation completed"))

    // Perform initial data checks
    const initialCryptoControllerResponse = await cryptoInitialCheckController();
    if(initialCryptoControllerResponse.message === "succcess"){
        console.log(chalk.green("Initial Crypto Data has been retrieved and checked"))
    }else {
        console.log(chalk.red(initialCryptoControllerResponse.message))
        console.log(chalk.blue("The above is not a breaking error, but needs to be checked - server will run"))
    }

    // setup routes
    app.use(crypto_routes)
    
    // Start the Server and display running info
    app.listen(serverSetUpData.server_port, serverSetUpData.server_url, () => {
        console.log(chalk.yellow("======================"))
        console.log(chalk.green("Server Starting. Details:"))
        console.log(chalk.green("URL:", serverSetUpData.server_url))
        console.log(chalk.green("PORT:", serverSetUpData.server_port))
        console.log(chalk.green("MODE:", serverSetUpData.server_mode))
        console.log(chalk.green("======================"))
        console.log(chalk.yellow("=============================="))
        console.log(chalk.green("\n ---- SERVER IS LISTENING --- \n"))
    })

    // await getLatestData();
}

// call for server startup
serverStart();

// simple route for basic response testing, but project must be in dev mode to run it
if(process.env.MODE === 'development'){
    app.get('/hello', (req, res) => {
        console.log("HIT HELLO ROUTE")
        res.json({message:"connected to server"})
    })
}


