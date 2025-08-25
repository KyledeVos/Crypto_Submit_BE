import {Request, Response} from "express"
import {RedisControl} from "../../redisClient"
import {checkExistingCryptoDataCount, retrieveCryptoMapData} from "../../models/crypto_model"
import {cryptoMapDataFilter} from "../../utilities/crypto_filter"
import {fundamentalSummaryFields} from "../../constants/crypto_constants"
import type {cryptoMapDataType} from "../../types/crypto_types"

export const summaryDataController = async (req: Request, res: Response) => {


    // check row count for quick return on empty
    const rowCount = await checkExistingCryptoDataCount()
    if(rowCount === undefined){
        res.status(500).json()
    }else if(typeof rowCount === "string" || rowCount === 0){
        res.status(204).json()
    }else{

        // create redis client
        const redisControl = new RedisControl()
        const redisClient = await redisControl.createRedisClient();
        if(redisClient === undefined){
            console.log(("Failed to Create A Redis Client"))
            // no redis, have to return db data
            const data = await callForSummaryData();
            if(data === undefined){
                res.status(500).json()
            }else if(data.length == 0){
                res.status(204).json()
            }else{
                res.status(200).json(data)
            }
        }else{
            console.log(("Redis Client Created"))
            const value = await redisClient.get("summaryDataController")
            // no current data
            if (value === null){
                const data = await callForSummaryData()
                if(data && data.length > 0){
                    const redisData = {data: data, dateStamp: Date.now()}
                    redisClient.set("summaryDataController", JSON.stringify(redisData))
                }else{
                    res.status(500).json()
                }
            }else{
                //# current data
                const currentDate = Date.now()
                console.log("current time", currentDate)
                const redisDataJson = JSON.parse(value)
                console.log("redisDataJson time", redisDataJson.dateStamp)
                const timeDiffMilli = currentDate - redisDataJson.dateStamp;
                console.log("TIMEDIFF", timeDiffMilli
                )
                // time diff greater than one minute, get new data and set in redis
                if (timeDiffMilli > 60000){
                    const data = await callForSummaryData()
                    if(data && data.length > 0){
                        const redisData = {data: data, dateStamp: Date.now()}
                        redisClient.set("summaryDataController", JSON.stringify(redisData))
                    }else{
                        res.status(500)
                    }
                }
                redisClient.quit()
                res.status(200).json(redisDataJson.data)
            }
        }
    }
}

const callForSummaryData = async ():Promise<cryptoMapDataType[] | undefined> => {
        // data present
        const result = await retrieveCryptoMapData()
        if(!result || result === undefined || result.message !== "success"){
            return undefined
        }else if(result.data === undefined){
            return undefined
        }
    
        // call for retrieval of only specified crypto currencies and filter on desired fields
        const formattedData = cryptoMapDataFilter(result.data, fundamentalSummaryFields)
        if(formattedData === undefined || typeof formattedData === "string"){
            return undefined
        }else if (Array.isArray(formattedData) && formattedData.length === 0){
            return []
        }
        console.log("FORMMATED DATA", Array.isArray(formattedData))
        // success return
        return formattedData
    }