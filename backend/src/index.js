import dotenv from 'dotenv';
import connectDB from './db/index.js';
import app from './app.js';

dotenv.config();

connectDB()
.then(()=>{
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, ()=>{
        console.log(`Server is running at ${PORT}`);
    });
})
.catch((error)=>{
    console.log('Connection failed: ', error)
})