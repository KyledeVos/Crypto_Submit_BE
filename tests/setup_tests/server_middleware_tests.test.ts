import {serverVariablesCheck} from "../../src/middleware/env_check"
import {development_env, serverSetUp} from '../../src/types/server_types'
import {describe, it, test, expect} from "@jest/globals"

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
})