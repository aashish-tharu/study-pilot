import express from "express";
import dotenv from "dotenv";
const app = express();

app.use(express.json())

app.post('/', (req, res)=>{
    res.status(200).json({
        status: true,
        message: "This api is working."
    })
})

export default app