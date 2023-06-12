const express=require('express')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const cors=require('cors')
const app=express()
const port=process.env.PORT || 7000


//middleware
app.use(cors())
app.use(express.json())

//testing server
app.get('/',(req,res)=>{
    res.send('linguaCamp is running')
})






//connet check in console
app.listen(port,()=>{
    console.log(`LinguaCamp is running with port:${port}`);
    
})