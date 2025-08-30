/**
 * @module redis.test.ts
 * This is a testing module containing functions to test the functions for Redis Control
 */

import { RedisControl } from "../../redisClient"
import { describe, test, expect } from "@jest/globals"

describe('testing redis controller', () => {
    let redisControl = new RedisControl()
    let redisClient = undefined

    beforeAll(async () => {

        redisClient = await redisControl.createRedisClient();
    })

    test('Verification Add Test - Actual Data', async () => {
        const testKey = "SummaryData"
        const testData = JSON.stringify({ "data": [{ "id": 1, "name": "Bitcoin", "symbol": "BTC", "rank": 1, "is_active": 1 }, { "id": 2, "name": "Litecoin", "symbol": "LTC", "rank": 21, "is_active": 1 }, { "id": 52, "name": "XRP", "symbol": "XRP", "rank": 4, "is_active": 1 }, { "id": 1027, "name": "Ethereum", "symbol": "ETH", "rank": 2, "is_active": 1 }, { "id": 1839, "name": "BNB", "symbol": "BNB", "rank": 5, "is_active": 1 }], "dateStamp": 1756562416176 })

        const expectedResult = true
        expect(redisControl.addToRedisVerification(testKey, testData)).toEqual(expectedResult)

    })

})


