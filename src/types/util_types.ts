/**
 * @module util_types.ts
 * This module desribes types used by utility functions, but can apply to other modules
 */

export type LogType = "success" | "info" | "warning" | "error"

/**
 * Conform detailed logging for this application
 * @remarks action - 'none' is intended to just log to console. file log values differentiate from general vs error
 */
export type LoggerType = {
    action: "none" | "log_file" |"error_file"
    logType: LogType,
    callFunction: string,
    message: string} 