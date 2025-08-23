// SERVER CONFIG TYPES
export type development_env= "development" | "production"

export type serverSetUp = {
    server_url: string;
    server_port: number;
    server_mode: development_env
}