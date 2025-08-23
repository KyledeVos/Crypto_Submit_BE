import express from 'express'
import { corsMiddleWare } from './src/middleware/cors_middleware'
import dotenv from 'dotenv'
import chalk from 'chalk'
import {serverVariablesCheck} from "./src/middleware/env_check"
import {serverSetUp, development_env} from "./src/types/server_types"

dotenv.config()


/**
 * Create Server
 */
const app = express();
// setup cors middleware
app.use(corsMiddleWare)

// --------------------------------
// Validate Server Start Fields

// server variables
const server_url_env: string = process.env.SERVER_URL || 'localhost'
const server_port_env: string | null = process.env.SERVER_PORT || null
const server_mode_env: development_env | null = (process.env.MODE as development_env) || null

const serverSetUpData: serverSetUp | string  = serverVariablesCheck(server_url_env, server_port_env, server_mode_env)
if(serverSetUpData === null){
    console.log(chalk.red("No Return for Server Data Checks - Process Terminated"))
    process.exit();
}else if(typeof serverSetUpData === "string"){
    if(serverSetUpData.trim() === ""){
      console.log(chalk.red("Server Data Setup check returned blank - Process Terminated"))
      process.exit();  
    }else{
        console.log(chalk.red(serverSetUpData))
        console.log(chalk.red("Process Terminated"))
        process.exit()
    }
}else{
    // Server Setup data must be a json
    if(typeof serverSetUpData !== "object"){
      console.log(chalk.red("Server Data Setup return is non-object - Process Terminated"))
      process.exit();
    }else{
        if(!serverSetUpData.server_url || typeof serverSetUpData.server_url !== "string" || serverSetUpData.server_url.trim() === ""){
            console.log(chalk.red("Server Data Setup server_url not valid but bypassed setup middleware checks - Process Terminated"))
            process.exit();
        }else if(!serverSetUpData.server_port || typeof serverSetUpData.server_port !== "number"){
            console.log(chalk.red("Server Data Setup port is not valid but bypassed setup middleware check - Process Terminated"))
            process.exit();
        }else if(!serverSetUpData.server_mode || typeof serverSetUpData.server_mode !== "string" || serverSetUpData.server_mode.trim() === ""){
            console.log(chalk.red("Server Data Setup mode is not valid but bypassed setup middleware check - Process Terminated"))
            process.exit();
        }
    }
}
// ----------------------

// Start the Server

app.listen(serverSetUpData.server_port, serverSetUpData.server_url, () => {
    console.log(chalk.green("======================"))
    console.log(chalk.green("Server Starting. Details:"))
    console.log(chalk.green("URL:", serverSetUpData.server_url))
    console.log(chalk.green("PORT:", serverSetUpData.server_port))
    console.log(chalk.green("MODE:", serverSetUpData.server_mode))
    console.log(chalk.green("======================"))
})


// simple route for basic testing
app.get('/hello', (req, res) => {
    console.log("HIT ROUTE")
    res.json({message:"connected to server"})
})


