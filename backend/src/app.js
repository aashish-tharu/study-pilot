import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json())

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter)

app.post('/', (req, res)=>{
    res.status(200).json({
        status: true,
        message: "All working."
    })
})

export default app