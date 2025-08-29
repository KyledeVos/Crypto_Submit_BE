/**
 * @module simple_validations.test.ts
 * This is a testing module containing functions to test the validation functions in the simple_validations module
 */

import {describe, test, expect} from "@jest/globals"
import {simpleStringValidator, simpleIntegerValidator} from "../../validators/simpleValidators"

describe('testing simple string validation', ()=>{
    test('Success Test', () => {
        expect(simpleStringValidator("test")).toEqual(true)
    })

    test('Fail Case 1 - blank', () => {
        expect(simpleStringValidator("")).toEqual(false)
    })
})

describe('testing simple integer validation', ()=>{
    test('Success Test 1', () => {
        expect(simpleIntegerValidator(1)).toEqual(true)
    })

    test('Success Test 2 - positive only', () => {
        expect(simpleIntegerValidator(1, true)).toEqual(true)
    })

    test('Fail Case 1 - decimal', () => {
        expect(simpleIntegerValidator(1.25)).toEqual(false)
    })

    
    test('Fail Case 2 - negative output', () => {
        expect(!simpleIntegerValidator(1.25)).toEqual(true)
    })

        test('Fail Case 3 - negative input, positive only', () => {
        expect(simpleIntegerValidator(-1, true)).toEqual(false)
    })
})