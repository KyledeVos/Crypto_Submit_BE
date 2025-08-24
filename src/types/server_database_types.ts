/**
 * @module server_types.ts
 * This module provides types to be used for server setup
 */

// Defines the mode server is being run in
export type development_env= "development" | "production"

// Fields for Server to Run
export type serverSetUp = {
    server_url: string;
    server_port: number;
    server_mode: development_env
}

// Database Setup Fields
export type databaseSetUpType = {
    dbHostName: string;
    dbUser: string;
    dbPassword:string;
    dbPort: number;
    dbConnectionLimit: number;
}

export type databaseForeignKeyField = {
    keyName: string;
    linkedTableName: string;
}

export type tableColumnDefinition = {
    columnName: string;
    dataType: string;
    allowNull: boolean;
    defaultValue?: string;
    comment?: string;
}

export type databaseDefinitionType = {
    tableName: string;
    foreignKeyData: databaseForeignKeyField | undefined;
    columnDefinitions : tableColumnDefinition[];

}