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
import {DBController} from "./controllers/db_controller"
import {serverVariablesCheck, validateSetDatabaseConnectValues, validateCoinAPIKey} from "./middleware/env_check"
import {createAllTablesModel} from "../src/models/database_tables_creation"
import {serverSetUp, development_env, databaseSetUpType} from "./types/server_database_types"
import {cryptoInitialCheckController} from "./controllers/crypto_controller"
import {getLatestData} from "../src/services/crypto_service"
import {styledLog} from "./utilities/logger"

// routes import
import crypto_routes from './routes/crypto_routes'
dotenv.config()

// standard termination string
const terminationString = "==== PROCESS TERMINATED ===="

console.log(styledLog("==============================", "warning"))
console.log(styledLog("SERVER STARTUP HAS BEEN CALLED\n", "warning"))

// --------------------------------
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

// database variables after validation

// coinkey
const coinAPIKeyEnv: string | undefined = process.env.COIN_API_KEY || undefined

// --------------------------------
// Validate and assign server fields (URL, PORT and MODE) for server run
const serverSetUpData: serverSetUp | undefined = serverVariablesCheck(server_url_env, server_port_env, server_mode_env)
if(!serverSetUpData || serverSetUpData === undefined){
    console.log(terminationString)
    process.exit();  
}

// Validate and Configure Database Setup Values
const databaseValidation =  validateSetDatabaseConnectValues(databaseHost, databaseUser, databasePassword, databasePort, databaseConnectionLimit);
if(!databaseValidation || databaseValidation === undefined){
    console.log(terminationString)
    process.exit(); 
}

// Validate presence of Coin API Key
const validatedCoinAPIKey = validateCoinAPIKey(coinAPIKeyEnv);
if(validatedCoinAPIKey === undefined){
    console.log(terminationString)
    process.exit(); 
}
// ------------------------

// Create Database Pool
let poolConnection: Pool | undefined = undefined

/**
 * Call database controller to setup pool, create database and confirm connection
 * @returns connectionPool used to create connections or logs an error and then terminates the server run
 */
export const poolConnectionHandler = async () => {
        const connectionPoolResult = await DBController(databaseValidation)
        if(connectionPoolResult === undefined){
            console.log(terminationString)
            process.exit(); 
        }
        return connectionPoolResult
}

/**
 * An async handler to await the promise from 'poolConnectionHandler' and then start up the server
 */
const databaseInitialStarter = async() => {
    // Call for creation of connection pool - also performs a first connection query to validate connection on startup
    poolConnection = await poolConnectionHandler();
    styledLog("Database Connnection Pool Created\n", "success")
    
    // Perform tables creation
    const creationResult = await createAllTablesModel()
    if(creationResult === undefined || creationResult === false){
        console.log(terminationString)
        process.exit();} 
    }

    // // Perform initial data checks
    // const initialCryptoControllerResponse = await cryptoInitialCheckController();
    // if(initialCryptoControllerResponse.message === "succcess"){
    //     console.log(chalk.green("Initial Crypto Data has been retrieved and checked"))
    // }






    // await getLatestData();

const serverStartUp = async () => {
        await databaseInitialStarter();
             // Create Server
    const app = express();
    // setup cors middleware
    app.use(corsMiddleWare)

    // setup routes
    app.use(express.json());
    app.use(crypto_routes);

    // simple route for basic response testing, but project must be in dev mode to run it
    if(process.env.MODE === 'development'){
        app.get('/hello', (req, res) => {
            console.log("HIT HELLO ROUTE")
            res.json({message:"connected to server"})
        })
    }
    
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

    }

// call for server startup
serverStartUp();




