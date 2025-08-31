/**
 * @module server.ts
 * This module serves as a holder for crypto-based constants and acts as a central control to reference them
 */

// Define the names of desired crypto currencies for startup population
export const CRYPTO_CURRENCIES_START: string[] = [
    'Bitcoin',
    'Litecoin',
    'Ethereum',
    'XRP',
    'BNB'
]

// Map of Crypto Names to their symbols
export const CRYPTO_CURRENCIES_NAME_SYMBOL: Record<string, string> = {
    'Bitcoin' : "BTC",
    'Litecoin' : "LTC",
    'Ethereum' : "ETH",
    'XRP' : "XRP",
    'BNB': "BNB"
}

export const fundamentalSummaryFields: string[] = ['id', 'name', 'symbol', 'rank', 'is_active']
