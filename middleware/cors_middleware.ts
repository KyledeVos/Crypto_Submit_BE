import cors from 'cors'

// Define allowed origins to the server
// Current is simply a local FE
export const corsMiddleWare = cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
})