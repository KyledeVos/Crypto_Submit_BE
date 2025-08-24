/**
 * @module server_middleware.test.ts
 * This is a testing module containing functions to test the server middleware functions
 */

import {serverVariablesCheck} from "../../middleware/env_check"
import {describe, test, expect} from "@jest/globals"

describe('testing server setup middleware', ()=>{
    test('Success Test', () => {
        const server_url_env = 'localhost';
        const server_port_env = '3006';
        const server_mode_env = 'development'

        const expectedResult = {
            server_url: 'localhost',
            server_port: 3006,
            server_mode: 'development'
        }

        expect(serverVariablesCheck(server_url_env, server_port_env, server_mode_env)).toEqual(expectedResult)
    })

    test('Fail Case 1 - port incorrect type', () => {
        const server_url_env = 'localhost';
        const server_port_env = 'abc';
        const server_mode_env = 'development'

        const expectedResult = "Server port is not a valid int."

        expect(serverVariablesCheck(server_url_env, server_port_env, server_mode_env)).toEqual(expectedResult)
    })

    test('Fail Case 2 - empty url string', () => {
        const server_url_env = '';
        const server_port_env = '3006';
        const server_mode_env = 'development'

        const expectedResult = "Missing Server URL"

        expect(serverVariablesCheck(server_url_env, server_port_env, server_mode_env)).toEqual(expectedResult)
    })

    test('Fail Case 3 - empty port string', () => {
        const server_url_env = 'localhost';
        const server_port_env = '';
        const server_mode_env = 'development'

        const expectedResult = "Missing Server Port"

        expect(serverVariablesCheck(server_url_env, server_port_env, server_mode_env)).toEqual(expectedResult)
    })

    test('Fail Case 4 - empty mode string', () => {
        const server_url_env = 'localhost';
        const server_port_env = '3306';
        const server_mode_env = ''

        const expectedResult = "Server mode is missing / not properly configured"

        expect(serverVariablesCheck(server_url_env, server_port_env, server_mode_env)).toEqual(expectedResult)
    })

    test('Fail Case 5 - unknown server mode', () => {
        const server_url_env = 'localhost';
        const server_port_env = '3306';
        const server_mode_env = 'staging'

        const expectedResult = "Server mode is missing / not properly configured"

        expect(serverVariablesCheck(server_url_env, server_port_env, server_mode_env)).toEqual(expectedResult)
    })

    test('Fail Case 6 - pass undefined to server_url - simulate missing env field', () => {
        const server_url_env = undefined;
        const server_port_env = '3306';
        const server_mode_env = 'staging'

        const expectedResult = "Missing Server URL"

        expect(serverVariablesCheck(server_url_env, server_port_env, server_mode_env)).toEqual(expectedResult)
    })

    test('Fail Case 7 - pass undefined to server_port - simulate missing env field', () => {
        const server_url_env = 'localhost';
        const server_port_env = undefined;
        const server_mode_env = 'staging'

        const expectedResult = "Missing Server Port"

        expect(serverVariablesCheck(server_url_env, server_port_env, server_mode_env)).toEqual(expectedResult)
    })

    test('Fail Case 8 - pass undefined to server_mode - simulate missing env field', () => {
        const server_url_env = 'localhost';
        const server_port_env = '3306';
        const server_mode_env = undefined

        const expectedResult = "Server mode is missing / not properly configured"

        expect(serverVariablesCheck(server_url_env, server_port_env, server_mode_env)).toEqual(expectedResult)
    })

    test('Fail Case 9 - pass undefined to all - simulate missing env field and ask if env was set', () => {
        const server_url_env = undefined;
        const server_port_env = undefined;
        const server_mode_env = undefined

        const expectedResult = "Missing Server ENV values - check if the .env was created with .env_blank template and values added"

        expect(serverVariablesCheck(server_url_env, server_port_env, server_mode_env)).toEqual(expectedResult)
    })
    
})