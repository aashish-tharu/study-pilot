import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './db/index.js';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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