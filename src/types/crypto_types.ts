/**
 * @module crypto_types.ts
 * This module provides types used for crypto related data
 */

// Define a general response data type
export type cryptoGeneralResponseType = {
    status: number;
    data: any;
}

/**
 * @remarks Describes and conforms application to the map data types for each object
 */
export type cryptoMapDataRawType = {
    id: number,
    rank: number,
    name: string,
    symbol: string,
    slug: string,
    is_active: number,
    status: number,
    first_historical_data: string,
    last_historical_data: string,
    platform: null
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
    platform: any
}

// THIS IS THE FUNDAMENTAL CRYPTO DATA USED BY THE APPLICATION
export type cryptoMapDataFundamental = {
    id: string,
    symbol: string,
    name: string,
    rank: string,
    isActive: string
}

// Current Data to track for each crypto currency
export type currentDataType = {
    symbol: string,
    currentPrice: number,
    volume24h: number,
    marketCap: number,
    marketCapDominance: number,
}


export type currentDataConformedType = {
    currencyId: number,
    currentPrice: number,
    volume24h: number,
    marketCap: number,
    marketCapDominance: number,
}

