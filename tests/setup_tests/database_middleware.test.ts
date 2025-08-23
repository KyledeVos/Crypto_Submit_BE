/**
 * @module database_middleware.test.ts
 * This is a testing module containing functions to test the database middleware functions
 */

import {validateSetDatabaseConnectValues} from "../../src/database_config"
import {describe, test, expect} from "@jest/globals"

describe('testing database connection middleware', ()=>{
    test('Success Test', () => {
        const expectedResult = {error: false}
        expect(validateSetDatabaseConnectValues('localhost', 'root', '12345', '10')).toEqual(expectedResult)
    })

    test('Fail Case 1 - missing host', () => {
        const expectedResult = {error: true, message: "Missing DB Host Name"}
        expect(validateSetDatabaseConnectValues(undefined, 'root', '12345', '10')).toEqual(expectedResult)
    })

    test('Fail Case 2 - missing user', () => {
        const expectedResult = {error: true, message: "Missing DB User"}
        expect(validateSetDatabaseConnectValues("localhost", undefined, '12345', '10')).toEqual(expectedResult)
    })

    test('Fail Case 3 - missing password', () => {
        const expectedResult = {error: true, message: "Missing DB Password"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', undefined, '10')).toEqual(expectedResult)
    })

    test('Fail Case 4 - missing connection limit', () => {
        const expectedResult = {error: true, message: "Missing DB Connection Limit"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', undefined)).toEqual(expectedResult)
    })

    test('Fail Case 5 - blank host name', () => {
        const expectedResult = {error: true, message: "Missing DB Host Name"}
        expect(validateSetDatabaseConnectValues("", 'root', '12345', '10')).toEqual(expectedResult)
    })

    test('Fail Case 6 - blank user', () => {
        const expectedResult = {error: true, message: "Missing DB User"}
        expect(validateSetDatabaseConnectValues("localhost", '', '12345', '10')).toEqual(expectedResult)
    })

    test('Fail Case 7 - blank password', () => {
        const expectedResult = {error: true, message: "Missing DB Password"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '', '10')).toEqual(expectedResult)
    })

    
    test('Fail Case 8 - blank connection limit', () => {
        const expectedResult = {error: true, message: "Missing DB Connection Limit"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', '')).toEqual(expectedResult)
    })

    test('Fail Case 9 - connection limit as non-number', () => {
        const expectedResult = {error: true, message: "Database Connection Limit is not a Valid Integer"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', 'abc')).toEqual(expectedResult)
    })

    test('Fail Case 10 - connection limit as 0', () => {
        const expectedResult = {error: true, message: "Database Connection Limit is less than or equal to 0"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', '0')).toEqual(expectedResult)
    })

    test('Fail Case 11 - connection limit as less than 0', () => {
        const expectedResult = {error: true, message: "Database Connection Limit is less than or equal to 0"}
        expect(validateSetDatabaseConnectValues("localhost", 'root', '12345', '-10')).toEqual(expectedResult)
    })
})