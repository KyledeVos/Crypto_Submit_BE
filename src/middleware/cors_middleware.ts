/**
 * @module cors_middleware.ts
 * This module provides settings for CORS and controls which domain can request from this server
 */

import cors from 'cors'

/**
 * Controls CORS for this applications
 * @returns Object containing the origin URL and allowed methods
 */
export const corsMiddleWare = cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
})