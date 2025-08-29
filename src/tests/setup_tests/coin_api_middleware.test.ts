/**
 * @module database_middleware.test.ts
 * This is a testing module containing functions to test the coin api key
 */

import { error } from "console"
import {validateCoinAPIKey} from "../../middleware/env_check"
import {describe, test, expect} from "@jest/globals"

describe('testing coin api validation checks', ()=>{
    test('Success Test', () => {
        const expectedResult = "1234-AOR"
        expect(validateCoinAPIKey('1234-AOR')).toEqual(expectedResult)
    })

    test('Fail Case 1 - No API Key', () => {
        const expectedResult = undefined
        expect(validateCoinAPIKey(undefined)).toEqual(expectedResult)
    })

    test('Fail Case 2 - API Key as a blank string', () => {
        const expectedResult = undefined
        expect(validateCoinAPIKey("")).toEqual(expectedResult)
    })
})