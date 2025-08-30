/**
 * @module crypto_controller.ts
 * This module provides functionality to create a redis Client
 * Differs from remaining application by using OOP
 */
import { createClient, RedisClientType } from "redis";
import { trackLogger } from "./utilities/logger";
import type { addDataToRedisResponse } from "./types/redis_types";

/**
 * Attempt to create a redis client for caching
 */
export class RedisControl {
  // Serves as both the time allowed before a refresh of data can be called for
  // and to store keys allowed to use redis
  private refreshTimes: Record<string, number> = {
    "SummaryData": 60000,
  };

  public createRedisClient = async (): Promise<RedisClientType | undefined> => {
    try {
      const redisClient: RedisClientType = createClient();
      if (redisClient !== undefined) {
        await redisClient.connect();
        return redisClient;
      } else {
        return undefined;
      }
    } catch (error) {
      trackLogger({
        action: "error_file", logType: "error", callFunction: "createRedisClient",
        message: `Error occured during create client as: ${error}`,
      });
      return undefined;
    }
  };

  /**
   * Adds provided to redis under supplied key
   * @param key string for identification - must have a match in 'refreshTimes'
   * @param data data to be saved in redis
   * @remarks this function performs its own logging of errors
   */
  public checkAndAddToRedis = async (
    key: string,
    data: any
  ): Promise<addDataToRedisResponse> => {
    let redisClient: RedisClientType | undefined = undefined;

    // verification
    const convertedData = JSON.stringify(data)
    const verified = this.addToRedisVerification(key, convertedData);
    if (verified === false) {
      return "failed";
    }

    try {
      redisClient = await this.createRedisClient();
      if (redisClient === undefined) {
        return "failed";
      }
      const redisData = { data: data, dateStamp: Date.now() };
      try {
        redisClient.set("SummaryData", JSON.stringify(redisData));
        return "success";
      } catch (error) {
        trackLogger({
          action: "error_file", logType: "error", callFunction: "addDataToRedis",
          message: `Error occured during redis set as: ${error}`,
        });
        return "failed"
      }

    } catch (error) {
      trackLogger({
        action: "error_file", logType: "error", callFunction: "addDataToRedis",
        message: `Error occured as: ${error}`,
      });
      return "failed";
    } finally {
      // cleanup
      if (redisClient !== undefined) {
        redisClient.quit();
      }
    }
  };

  /**
   * Verify key and data for addition of new data to redis
   * @param key string for identification - must have a match in 'refreshTimes'
   * @param data string of data that will be checked for JSON parsing success
   * @returns boolean success
   * @remarks this function performs its own logging of errors
   */
  public addToRedisVerification = (key: string, data: string): boolean => {
    let errorMessage = "";
    if (key === undefined) {
      errorMessage = "missing key";
    } else if (data === undefined) {
      errorMessage = "missing key";
    } else if (!Object.keys(this.refreshTimes).includes(key)) {
      errorMessage = "unknown key has been given";
    }

    try {
      const jsonCheck = JSON.parse(data);
    } catch (error) {
      errorMessage = "Failed to pass data";
    }

    if (errorMessage !== "") {
      trackLogger({
        action: "error_file",
        logType: "error",
        callFunction: "addToRedisVerification",
        message: errorMessage,
      });
      return false;
    }
    return true;
  };

  /**
   * Attempts to get current redis data 
   * @param key string for identification - must have a match in 'refreshTimes'
   * @returns stringified data
   * @remarks this function performs its own logging of errors
   * @remarks does not check for data expiary
   */
  public getRedisData = async (key: string): Promise<string> => {
    if (key === undefined) {
      trackLogger({
        action: "error_file",
        logType: "error",
        callFunction: "redis->getRedisData",
        message: "key is undefined",
      });
      return "failed"
    }

    let redisClient: RedisClientType | undefined = undefined

    try {
      redisClient = await this.createRedisClient();
      if (redisClient === undefined) {
        return "failed";
      }

      if (!Object.keys(this.refreshTimes).includes(key)) {
        trackLogger({
          action: "error_file", logType: "error", callFunction: "redis->getRedisData",
          message: "refresh times does not include given key",
        });
        return "failed";
      }

      const data = await redisClient.get(key)
      return typeof data === "string" ? data : "failed"

    } catch (error) {
      trackLogger({
        action: "error_file", logType: "error", callFunction: "redis->getRedisData",
        message: `Error during redis data retrieval as: ${error}`,
      });
      return "failed"
    } finally {
      // cleanup
      if (redisClient !== undefined) {
        redisClient.quit();
      }
    }

  }

  /**
   * Determine if current data for a key in redis is expired or not present
   * @param key string for identification - must have a match in 'refreshTimes'
   * @returns true means new data is needed, false for data is present, undefined for an error
   * @remarks this function performs its own logging of errors
   */
  public checkReloadNeeded = async (
    key: string
  ): Promise<boolean | undefined> => {
    if (key === undefined) {
      trackLogger({
        action: "error_file",
        logType: "error",
        callFunction: "redis->checkDataPresent",
        message: "redis present data check not given a key",
      });
      return undefined;
    }

    let redisClient: RedisClientType | undefined = undefined

    try {
      redisClient = await this.createRedisClient();
      if (redisClient === undefined) {
        return undefined;
      }

      if (!Object.keys(this.refreshTimes).includes(key)) {
        trackLogger({
          action: "error_file", logType: "error", callFunction: "redis->checkDataPresent",
          message: "refresh times does not include given key",
        });
        return undefined;
      } else {
        // Attempt to get existing data
        const result = await redisClient.get(key);
        if (result === null) {
          // no present data
          return true;
        } else {
          // time values
          const redisDataJson = JSON.parse(result)
          const timeDiffMilli = Date.now() - redisDataJson.dateStamp;
          const allowedTime = this.refreshTimes[key]

          // incase of badly formatted redisJSON - undefined return should trigger caller
          // to perform a db select
          if (Number.isNaN(timeDiffMilli)) {
            return undefined;
          }

          // determine if new data needed or not
          if (timeDiffMilli > allowedTime) {
            return true
          } else {
            return false
          }
        }
      }

    } catch (error) {
      trackLogger({
        action: "error_file", logType: "error", callFunction: "redis->getRedisData",
        message: `Error during redis data retrieval as: ${error}`,
      });
      return undefined
    } finally {
      // cleanup
      if (redisClient !== undefined) {
        redisClient.quit();
      }
    }
  };
}
