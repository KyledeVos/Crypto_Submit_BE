/**
 * @module database_middleware.test.ts
 * This is a testing module containing functions to test the database middleware functions
 */

import {validateSetDatabaseConnectValues} from "../../src/middleware/env_check"
import {describe, test, expect} from "@jest/globals"

describe('testing database connection middleware', ()=>{
    test('Success Test', () => {
        const expectedResult = {
            error: false, 
            databaseData: {
                    dbHostName: 'localhost',
                    dbUser: "root",
                    dbPassword: "12345",
                    dbPort: 3306,
                    dbConnectionLimit: 10
            }}
        expect(validateSetDatabaseConnectValues('localhost', 'root', '12345', '3306', '10')).toEqual(expectedResult)
    })

    test('Fail Case 1 - missing host', () => {
        const expectedResult = {error: true, message: "Missing DB Host Name"}
        expect(validateSetDatabaseConnectValues(undefined, 'root', '12345', '3306','10')).toEqual(expectedResult)
    })

    test('Fail Case 2 - missing user', () => {
        const expectedResult = {error: true, message: "Missing DB User"}
        expect(validateSetDatabaseConnectValues("localhost", undefined, '12345', '3306', '10')).toEqual(expectedResult)
    })

    test('Fail Case 3 - missing password', () => {
        const expectedResult = {error: true, message: "Missing DB Password"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', undefined, '3306', '10')).toEqual(expectedResult)
    })

    test('Fail Case 4 - missing port', () => {
        const expectedResult = {error: true, message: "Missing DB Port"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', undefined, '10')).toEqual(expectedResult)
    })

    test('Fail Case 5 - missing connection limit', () => {
        const expectedResult = {error: true, message: "Missing DB Connection Limit"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', '3306', undefined)).toEqual(expectedResult)
    })

    test('Fail Case 6 - blank host name', () => {
        const expectedResult = {error: true, message: "Missing DB Host Name"}
        expect(validateSetDatabaseConnectValues("", 'root', '12345', '3306', '10')).toEqual(expectedResult)
    })

    test('Fail Case 7 - blank user', () => {
        const expectedResult = {error: true, message: "Missing DB User"}
        expect(validateSetDatabaseConnectValues("localhost", '', '12345', '3306', '10')).toEqual(expectedResult)
    })

    test('Fail Case 8 - blank password', () => {
        const expectedResult = {error: true, message: "Missing DB Password"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '', '3306', '10')).toEqual(expectedResult)
    })

    test('Fail Case 9 - blank database port', () => {
        const expectedResult = {error: true, message: "Missing DB Port"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', '', '10')).toEqual(expectedResult)
    })

    test('Fail Case 10 - blank connection limit', () => {
        const expectedResult = {error: true, message: "Missing DB Connection Limit"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', '3306', '')).toEqual(expectedResult)
    })

    test('Fail Case 11 - database port as non-number', () => {
        const expectedResult = {error: true, message: "Database Port is not a Valid Integer"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', 'abc', '10')).toEqual(expectedResult)
    })

    test('Fail Case 12 - connection limit as non-number', () => {
        const expectedResult = {error: true, message: "Database Connection Limit is not a Valid Integer"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', '3306', 'abc')).toEqual(expectedResult)
    })

    test('Fail Case 13 - database port as 0', () => {
        const expectedResult = {error: true, message: "Database Port is less than or equal to 0"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', '0', '10')).toEqual(expectedResult)
    })

    test('Fail Case 14 - connection limit as 0', () => {
        const expectedResult = {error: true, message: "Database Connection Limit is less than or equal to 0"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', '3306', '0')).toEqual(expectedResult)
    })

    test('Fail Case 15 - database port as less than 0', () => {
        const expectedResult = {error: true, message: "Database Port is less than or equal to 0"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', '-10', '10')).toEqual(expectedResult)
    })

    test('Fail Case 16 - connection limit as less than 0', () => {
        const expectedResult = {error: true, message: "Database Connection Limit is less than or equal to 0"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', '3306', '-10')).toEqual(expectedResult)
    })

    test('Fail Case 17 - all fields undefined - show helpful dev messaage', () => {
        const expectedResult = {error: true, message: "Missing Server ENV values - check if the .env was created with .env_blank template and values added"}
        expect(validateSetDatabaseConnectValues(undefined, undefined, undefined, undefined, undefined)).toEqual(expectedResult)
    })
})