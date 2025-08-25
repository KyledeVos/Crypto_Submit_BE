/**
 * @module crypto_controller.ts
 * This module provides functionality to create a redis Client
 */
import { createClient, RedisClientType } from "redis";

/**
 * Attempt to create a redis client for caching
 */
export class RedisControl {

    redisClient: RedisClientType | undefined = undefined 


    createRedisClient = async ():Promise<RedisClientType | undefined> => {
        try{
            this.redisClient = createClient()
            await this.redisClient.connect();

            return this.redisClient;
        }catch(error){
            console.log("Error occured during creation of Redis Client", error)
            return undefined;
        }
    }

    getRedisClient(){
        return this.redisClient
    }


}
