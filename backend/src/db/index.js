import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") })
const DB_NAME = "studyPilot"

const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL
        if (!mongoUrl) {
            throw new Error("MONGODB_URL is not defined in .env")
        }

        await mongoose.connect(`${mongoUrl}/${DB_NAME}`)
        console.log("Database connected")
    } catch (error) {
        console.error('Connection failed.', error)
        process.exit(1)
    }
}

export default connectDB;