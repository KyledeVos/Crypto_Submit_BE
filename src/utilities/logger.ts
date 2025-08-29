/**
 * @module provides wrapper functions for console logs and to trigger db logs and file writing
 */

import {LogType, LoggerType} from "../types/util_types"
import chalk from "chalk"
import { simpleStringValidator } from "../validators/simpleValidators"

/**
 * Centralise control of console log colors
 * @package chalk
 * @param value type of log of LogType that links to a desired color
 * @returns instance of chalk color function, unknown value triggers a console log
 * @default value unknown returns red for console log
 * @example logColourHandler("success") - returns chalk.green -> result green text
 */
export const logColorHandler = (value: LogType) => {

    if(!value || value === undefined){
        console.log("\n ====================")
        console.log(chalk.red("logColorHandler did not pass a colour"))
        console.log("\n ====================")
        return chalk.red
    }

    switch(value){
        case "success":
            return chalk.green
        case "info":
            return chalk.blue
        case "warning":
            return chalk.yellow
        case "error":
            return chalk.red
        default:
            return chalk.white
    }
}

/**
 *Provides a function to provide styled console logs
 * @param message message to log
 * @param logType desired console log type
 * @default logType set to 'info'
 * @example styledLog("this is a styled log", "error")
 */
export const styledLog = (message: string, logType: LogType = "info") => {
    if(!simpleStringValidator(message)){
        const logColorError = logColorHandler("error")
        console.log(logColorError(`Style log failed - message is invalid occurred at ${new Date()}`))
    }else{
        const logColor = logColorHandler(logType)
        console.log(logColor(message))
    }

}

/**
 *Formats and simplifies console logs to include filewriting and database writing if requested
 * @param action desired action as "none" | "file" | "db" | "file_db"
 * @param logType desired console log type as "success" | "info" | "warning" | "error"
 * @param callFunction the name of the function that called a log
 * @param message message to be logged / written 
 * @returns void
 * @example trackLogger("file", "info", "serverStartHandler", "test log")
 */
export const trackLogger = ({action = "none", logType = "info", callFunction = "", message}: LoggerType) => {
    // validate a message was provided
    if(!simpleStringValidator){
        loggerBreakHandle(`trackLogger has missing message. Other data - Action: ${action}, Type: ${logType}, Call Function: ${callFunction}`)
        return;
    }

    const logMessage = `\nLogger:
    Source: ${callFunction}, 
    Message: ${message}, 
    Action: ${action},
    Type: ${logType}
    Time: ${new Date()}`

    const logColor = logColorHandler(logType)

    // always performs a console log
    console.log(logColor(logMessage))
    if(action === "none"){
        return
    }

    // add logic for database entry

    if(action.toLowerCase().includes("log_file")){
        // add logic for log file writing
    }else if(action.toLowerCase().includes("error_file")){
        // add logic for error log file writing
    }
}

/**
 *Attempts to provide any information if 'trackLogger' is given a blank / invalid message
 * @param message used to provide any meaniingful data to track the 'trackLogger' missing data
 * @returns void
 * @example loggerBreakHandle("trackLogger failed to get a message. caller function was 'getData'")
 */
export const loggerBreakHandle = (message: string) => {
    console.log(`\ntrackLogger break detected at ${new Date()} with invalid message`)
    console.log('Data here may be blank')
    console.log(chalk.red(message) + "\n")

    // add logic for file writing and db log
}