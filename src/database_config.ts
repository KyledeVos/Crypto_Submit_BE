import mariaDB from "mariadb"
import {databaseSetUpType} from "./types/server_database_types"

// define database connection values
let dbHostNameValidated: string | undefined = undefined
let dbUserValidated: string | undefined = undefined
let dbPasswordValidated: string | undefined = undefined
let dbPortValidated: number | undefined = undefined
let dbConnectionLimitValidated: number | undefined = undefined


export const createDatabasePool = async ():Promise<{hasStarted: boolean, errorMessage?: string}> => {

    try{
        const dbConnection = mariaDB.createPool({
            host: dbHostNameValidated,
            user: dbUserValidated,
            password: dbPasswordValidated,
            port: dbPortValidated,
            connectionLimit: dbConnectionLimitValidated
        })
        return {hasStarted: true}

    }catch(error){
        return {hasStarted: false, errorMessage: `Error occured in Database connection attempt as: ${error}`}
    }
}

export const setDatabaseValues = (data:databaseSetUpType) => {
    dbHostNameValidated = data.dbHostName
    dbUserValidated = data.dbUser
    dbPasswordValidated = data.dbPassword
    dbPortValidated = data.dbPort
    dbConnectionLimitValidated = data.dbConnectionLimit
}
