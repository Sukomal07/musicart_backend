import app from "./app.js";
import { connectDb } from "./database/db.js";

connectDb()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server is running on http://localhost:${process.env.PORT || 5000}`)
        })
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error)
    })