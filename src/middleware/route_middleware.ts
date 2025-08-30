import { Request, Response, NextFunction } from "express"
import {trackLogger} from "../utilities/logger"

/**
 * Checks for general required content for all routes
 * Middleware based and will pass to next function from call if no issues are found
 */
export const generalRouteMiddleWare = async (req: Request, res:Response, next: NextFunction) => {

    try{
        const method = req.method
        const contentType = req.headers['content-type'];

        if(method !== "GET" && contentType !== 'application/json'){
            trackLogger({
                action: "error_file", logType: "error", callFunction: "generalRouteMiddleWare",
                message: "request does not have valid content type in headers"
            })
            res.status(400).json({message: "header content not valid"});
        }else{
           next()
        }
    }catch(error){
        trackLogger({
            action: "error_file", logType: "error", callFunction: "generalRouteMiddleWare",
            message: `Error during check as: ${error}`
        })
        return res.send(500).json()
    }
    
}