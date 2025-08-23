import express from 'express'
import { corsMiddleWare } from './middleware/cors_middleware'
import dotenv from 'dotenv'
import chalk from 'chalk'
import {development_env} from './types/global_types'

dotenv.config()

// .env constants
const server_port: string | null = process.env.SERVER_PORT || null
const server_mode: development_env | null = (process.env.MODE as development_env) || null

// env checks before server run
if(!server_port || typeof server_port === null || server_port.trim() === ""){
    console.log(chalk.red("Missing Server Port - Process Terminated"))
    process.exit();
}

if(!server_mode || typeof server_mode === null || 
    typeof server_mode !== "string" || server_mode.trim() === "" ||
    (server_mode !== "development" && server_mode !== "production")){

    console.log(chalk.red("Server mode is missing / not properly configured - Process Terminated"))
    process.exit();
}


// # CREATE THE SERVER
const app = express();
// setup cors middleware
app.use(corsMiddleWare)

// simple route for basic testing
app.get('/hello', (req, res) => {
    console.log("HIT ROUTE")
    res.json({message:"connected to server"})
})

// Start the Server
app.listen(server_port, () => {
    console.log(chalk.green(`Sever Running on Port: ${server_port}`))
})
