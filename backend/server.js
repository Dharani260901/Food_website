import express from 'express'
import cors from 'cors'
// import dotenv from 'dotnev'
import {connectDB} from './config/db.js'


//app config

const app = express()
const port = 4000

//middleware

app.use(express.json())
app.use(cors())

app.get("/",(req,res)=>{
    res.send("API Working!")
})

//DB connection
connectDB()

app.listen(port,()=>{
    console.log(`Server started on http://localhost:${port}`)
})