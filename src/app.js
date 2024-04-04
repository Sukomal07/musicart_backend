import express from 'express'
import cron from 'node-cron'
import axios from 'axios'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import errorMiddleware from './middlewares/error.middleware.js'
import dotenv from 'dotenv'
import userRoutes from './routes/user.routes.js'
import productRoutes from './routes/product.routes.js'
import invoiceRoutes from './routes/invoice.routes.js'

dotenv.config()

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

//routes config
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/product", productRoutes)
app.use("/api/v1/invoice", invoiceRoutes)

app.get("/ping", (req, res) => {
    res.send("Server is working");
});


cron.schedule('*/5 * * * *', async () => {
    try {
        const response = await axios.get(`${process.env.PROD_URL}/ping`);
        console.log('Ping response:', response.data);
    } catch (error) {
        console.error('Error making ping request:', error.message);
    }
});

app.all("*", (req, res) => {
    res.status(404).json({
        status: 404,
        success: false,
        message: "!Oops page not found"
    })
})

app.use(errorMiddleware)
export default app