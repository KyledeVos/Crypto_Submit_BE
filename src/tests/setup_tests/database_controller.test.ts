/**
 * @module database_controller.test.ts
 * This is a testing module containing functions to test the database controller
 */


import mariadb, {Pool, PoolConnection} from 'mariadb'
import dotenv from "dotenv"
import {describe, test, expect, beforeAll} from "@jest/globals"

dotenv.config()

/**
 * Perform Testing of the Database controller
 * @remarks does not validate the presence of the .env values needed for these tests
 * @remarks provides a separate table name to isolate from application tables
 * @remarks Does not perform DB cleanup - results kept if needed for test evaluations
 */
describe("DB Controller Test -> Base Testing", ()=>{

    let pool: Pool | undefined = undefined
    let dbConnection: PoolConnection | undefined = undefined
    const testDBTableName = "test_db"

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

        afterAll(async() => {
            if(dbConnection !== undefined){
                await dbConnection?.release()
            }
            if(pool !== undefined){
                await pool.end()
            }
        })

        test('Check Database Pool Generation', async () => {
            expect(pool).toBeDefined();
        })

        test('Check DB Connection', async () => {
            expect(dbConnection).toBeDefined();
        })

    }catch(error){
        console.log("Test Connection occured:", error)
    }
})



