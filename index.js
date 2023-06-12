const { MongoClient, ServerApiVersion } = require('mongodb');

const express=require('express')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const cors=require('cors')
const app=express()
const port=process.env.PORT || 7000


//==================
//middleware
app.use(cors())
app.use(express.json())


//JWT meddleware
const verifyJWT=(req,res,next)=>{
    const authorization=req.headers.authorization
    if(!authorization){
        return  res.status(401).send({error:true,message:'unauthorized access'})
    }
//Bearer token
const token=authorization.split(' ')[1]
jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
        return res.status(401).send({error:true,message:'unauthorized access'})
    }
    req.decoded=decoded
    next()
})
}
//===================


//===================
//testing server
app.get('/',(req,res)=>{
    res.send('linguaCamp is running')
})
//====================


//======================
//MongoDb Configure start



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ruywwtc.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();
//database all collection
//***********************
const usersCollection = client.db("LinguaCamp").collection("users");







//*********************************
//all server routes here


//*********************************













    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
//======================






//connet check in console
app.listen(port,()=>{
    console.log(`LinguaCamp is running with port:${port}`);
    
})