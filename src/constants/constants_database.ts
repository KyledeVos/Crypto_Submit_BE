/**
 * @module server.ts
 * This module serves as a holder for database related constants to maintain consistency across
 * the application with the intention of reference by constant name
 */

import {tableColumnDefinition} from "../types/server_database_types"

// DATABASE
export const DATABASE_NAME_CONST = "crypto_database"

// TABLES - Named here to force consistency
export const CURRENCIES_TABLE_NAME = "currencies"
export const CURRENT_DATA_TABLE_NAME = "current_data"
export const PERCENTAGE_CHANGE_RECENT_TABLE_NAME = "percentage_change_recent"
export const PERCENTAGE_CHANGE_HISTORY_TABLE_NAME = "percentage_change_history"



