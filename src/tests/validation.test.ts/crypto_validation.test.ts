/**
 * @module crypto_validation.test.ts
 * This is a testing module containing functions to test the validation functions in the crypto_validation module
 */

import { retrieveFilterCryptoMapData } from "../../models/crypto_summary_model"
import { describe, test, expect } from "@jest/globals"
import { validateCryptoMapResponse } from "../../validators/crypto_reponse_validator"
import { cryptoMapDataRawType } from "../../types/crypto_types"

describe('testing validateCryptoMapResponse with pre-created data', () => {
    test('Success Test', () => {
        const sampleData: cryptoMapDataRawType[] = [
            {
                id: 1,
                rank: 1,
                name: 'Test Name 1',
                symbol: 'T1',
                slug: 't1',
                is_active: 1,
                status: 1,
                first_historical_data: '2014-08-05T05:40:00.000Z',
                last_historical_data: '2025-08-29T19:35:00.000Z',
                platform: null
            },
            {
                id: 2,
                rank: 2,
                name: 'Test Name 2',
                symbol: 'T2',
                slug: 't2',
                is_active: 0,
                status: 1,
                first_historical_data: '2014-08-05T05:40:00.000Z',
                last_historical_data: '2025-08-29T19:35:00.000Z',
                platform: null
            }
        ]

        const expectedResult = true
        console.log("res", validateCryptoMapResponse(sampleData))

        expect(validateCryptoMapResponse(sampleData)).toEqual(expectedResult)
    })


    test('Fail Test 1', () => {
        const sampleData = [
            {
                id: 1,
                rank: 1,
                name: 'Test Name 1',
                symbol: 'T1',
                slug: 't1',
                is_active: "abc",
                status: 1,
                first_historical_data: '2014-08-05T05:40:00.000Z',
                last_historical_data: '2025-08-29T19:35:00.000Z',
                platform: null
            },
            {
                id: 1,
                rank: 1,
                name: 'Test Name 1',
                symbol: 'T1',
                slug: 't1',
                is_active: 1,
                status: 1,
                first_historical_data: '2014-08-05T05:40:00.000Z',
                last_historical_data: '2025-08-29T19:35:00.000Z',
                platform: null
            }
        ]

        const expectedResult = false
        console.log("res", validateCryptoMapResponse(sampleData))

        expect(validateCryptoMapResponse(sampleData)).toEqual(expectedResult)
    })
})

describe('testing validateCryptoMapResponse with data call', () => {
    test('Success Test', async () => {
        const data = await retrieveFilterCryptoMapData()

        const expectedResult = true
        console.log("res", validateCryptoMapResponse(data))

        expect(validateCryptoMapResponse(data)).toEqual(expectedResult)
    })
})