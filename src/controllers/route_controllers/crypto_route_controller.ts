import {Request, Response} from "express"

import {checkExistingCryptoDataCount, retrieveCryptoMapData} from "../../models/crypto_model"
import {cryptoMapDataFilter} from "../../utilities/crypto_filter"
import {fundamentalSummaryFields} from "../../constants/crypto_constants"

export const summaryDataController = async (req: Request, res: Response) => {

    // check row count for quick return on empty
    const rowCount = await checkExistingCryptoDataCount()
    if(rowCount === undefined){
        res.status(500).json()
    }else if(typeof rowCount === "string" || rowCount === 0){
        res.send(204).json()
    }else{
        // data present
        const result = await retrieveCryptoMapData()
        if(!result || result === undefined || result.message !== "success"){
            res.status(500).json();
        }else if(result.data === undefined){
            res.json(204).json();
        }
    
        // call for retrieval of only specified crypto currencies and filter on desired fields
        const formattedData = cryptoMapDataFilter(result.data, fundamentalSummaryFields)
        if(formattedData === undefined || typeof formattedData === "string"){
            return res.status(500).json();
        }else if (Array.isArray(formattedData) && formattedData.length === 0){
            res.json(204).json();
        }
        console.log("FORMMATED DATA", Array.isArray(formattedData))
        // success return
        res.status(200).json(formattedData)
    }
}