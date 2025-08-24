/**
 * @module crypto_types.ts
 * This module provides types used for crypto related data
 */

// Define a general response data type
export type cryptoGeneralResponseType = {
    status: number;
    data: any;
}


export type cryptoMapDataType = {
    id: number,
    symbol: string,
    name: string,
    rank: number,
    is_active: number
}

// THIS IS THE MOST UP TO DATA CRYPTO MAP RESPONSE DATA
export type cryptoUpToDateMapData = {
    id: number,
    rank: number,
    name: string,
    symbol: string,
    slug: string,
    is_active: number,
    status: number,
    first_historical_data: Date,
    last_historical_data: Date,
    platform: null
}

// THIS IS THE FUNDAMENTAL CRYPTO DATA USED BY THE APPLICATION
export type cryptoMapDataFundamental = {
    id: string,
    symbol: string,
    name: string,
    rank: string,
    isActive: string
}

