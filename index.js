const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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

//admin middleware
const verifyAdmin=async(req,res,next)=>{
    const email=req.decoded.email 
    const query={email:email}
    const user=await usersCollection.findOne(query)
    console.log(user);
    
    if(user?.role!=='admin'){
      
      
      return res.status(403).send({error:true,message:'forbidden access hota hei'})
    }
    next()
  }

//Instructor middleware
const verifyInstructor=async(req,res,next)=>{
    const email=req.decoded.email 
    const query={email:email}
    const user=await usersCollection.findOne(query)
    console.log(user);
    
    if(user?.role!=='instructor'){
      
      
      return res.status(403).send({error:true,message:'forbidden access hota hei'})
    }
    next()
  }



//**************************all server routes here******************/
//****get routes*****/

//get all users data
app.get('/users',async(req,res)=>{
    const result=await usersCollection.find().toArray()
    res.send(result)
    
  })

//******************/







//*****************/
//post routes

//when a user logged in .user data will be stored database with this request
app.post('/user',async(req,res)=>{
    const newUser=req.body 
    const query={email: newUser.email}
    const existingUser= await usersCollection.findOne(query)
    if(existingUser){
     return res.send({message:'user already exist!'})
    }
    const result=await usersCollection.insertOne(newUser) 
    res.send(result)
    console.log(newUser);
    
    
  })
//******************/

//******************/
//all patch routes

//for patch to create admin role
app.patch('/users/admin/:id',async(req,res)=>{
  const Id=req.params.id 
  const filter={_id: new ObjectId(Id)}
  const updateDoc = {
    $set: {
      role: 'admin'
    },
  };
  const result=await usersCollection.updateOne(filter,updateDoc)
  res.send(result)
})


//for patch to create instructor role
app.patch('/users/instructor/:id',async(req,res)=>{
  const Id=req.params.id 
  const filter={_id: new ObjectId(Id)}
  const updateDoc = {
    $set: {
      role: 'instructor'
    },
  };
  const result=await usersCollection.updateOne(filter,updateDoc)
  res.send(result)
})












//********/
//jwt token 
app.post('/jwt',(req,res)=>{
    const user=req.body
     
    const token= jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'2h'})
    res.send({token})
  }) 
//*********************************













    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
//======================






//connet check in console
app.listen(port,()=>{
    console.log(`LinguaCamp is running with port:${port}`);
    
})