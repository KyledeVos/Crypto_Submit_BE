/**
 * @module database_middleware.test.ts
 * This is a testing module containing functions to test the database middleware functions
 */

import {validateSetDatabaseConnectValues} from "../../src/database_config"
import {describe, test, expect} from "@jest/globals"

describe('testing database connection middleware', ()=>{
    test('Success Test', () => {

        expect(validateSetDatabaseConnectValues('localhost', 'root', '12345', '10')).toEqual("success")

    })})