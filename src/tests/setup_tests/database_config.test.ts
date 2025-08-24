/**
 * @module server_middleware.test.ts
 * This is a testing module containing functions to test the database_config
 */

import {createDatabaseVerify} from "../../database_config"
import {describe, test, expect, beforeAll} from "@jest/globals"
import { PoolConnection } from "mariadb/*";
import dotenv from "dotenv"
import mariadb, {Pool} from 'mariadb'

dotenv.config()


describe('testing database config', ()=>{
    let dbConnection: PoolConnection | undefined
    let pool: Pool | undefined = undefined
    const testDBName = "testDB"
    const testDBTableName = "TestTable"

    try{
        beforeAll(async() => {
        // CREATE POOL AND CONNECTION
        pool = mariadb.createPool({
            host: process.env.MARIA_DB_HOST,
            user: process.env.MARIA_DB_USER,
            password: process.env.MARIA_DB_PASSWORD,
            port: Number(process.env.MARIA_DB_PORT),
            connectionLimit: 10
        })
        dbConnection = await pool.getConnection();
        })
    }catch(error){
        console.log("Test Connection occured:", error)
    }

    test('Check DB Connection', async () => {
        expect(dbConnection).toBeDefined();
    })

    test('Check Database Creation Success', async () => {
        if(pool !== undefined){
            const creationResult = await createDatabaseVerify(pool, testDBName)
            const expectedResult = {
                error: false
            }
            expect(creationResult).toEqual(expectedResult);
        }
    })
})