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
const classesCollection = client.db("LinguaCamp").collection("classes");

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
app.get('/users',verifyJWT,verifyAdmin,async(req,res)=>{
    const result=await usersCollection.find().toArray()
    res.send(result)
    
  })

  //admin role api 
app.get('/user/admin/:email',verifyJWT,async(req,res)=>{
  const Email=req.params.email 
  
  const query={email:Email}
  if(Email !== req.decoded.email){
    res.send({admin:false})
  }
  const user=await usersCollection.findOne(query)
  
  const result={admin: user?.role === 'admin'}
  res.send(result)
  
})


 //instructor role api 
app.get('/user/instructor/:email',verifyJWT,async(req,res)=>{
  const Email=req.params.email 

  const query={email:Email}
  if(Email !== req.decoded.email){
    res.send({instructor:false})
  }
  const user=await usersCollection.findOne(query)
  
  const result={instructor: user?.role === 'instructor'}
  res.send(result)
  
})


//when instructor go his classes route by clicking add class btn then this route is called
app.get('/classes/:email',verifyJWT,verifyInstructor,async(req,res)=>{
  const Email=req.params.email 
  const query={instructor_email: Email}
  const result=await classesCollection.find(query).toArray()
  res.send(result)
})

//get all classes for all classes page

app.get('/allClasses',verifyJWT,async(req,res)=>{
  const result=await classesCollection.find().toArray()
  res.send(result)
})

//instructor page data collect from database.and get all instructor data
app.get('/approvedInstructor',verifyJWT,async(req,res)=>{
const query={role:'instructor'}
const result=await usersCollection.find(query).toArray()
res.send(result)
})


//all classes page data collect from database.and get all approved classes data
app.get('/approvedClasses',verifyJWT,async(req,res)=>{
const query={status:'approved'}
const result=await classesCollection.find(query).toArray()
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
    
    
  })

  //instructor add a class then hit this post route 
  //add item from instructor dashboard
app.post('/classes',verifyJWT,verifyInstructor,async(req,res)=>{
  const newClass=req.body 
  const result=await classesCollection.insertOne(newClass)
  res.send(result)
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

//in admin dashboard => manage classes route .when admin click approved btn those class is approved
app.patch('/class/approve/:id',async(req,res)=>{
  const Id=req.params.id
  const filter={_id:new ObjectId(Id)}
  const updateDoc={
    $set:{
      status:'approved'
    }
  }
  const result =await classesCollection.updateOne(filter,updateDoc)
  res.send(result)
})
//in admin dashboard => manage classes route .when admin click approved btn those class is approved
app.patch('/class/deny/:id',async(req,res)=>{
  const Id=req.params.id
  const filter={_id:new ObjectId(Id)}
  const updateDoc={
    $set:{
      status:'denied'
    }
  }
  const result =await classesCollection.updateOne(filter,updateDoc)
  res.send(result)
})


//in admin dashboard => manage classes route .when admin click approved btn those class is approved
app.post('/class/feedback/:id',async(req,res)=>{
  const feed=req.body
 const Id=req.params.id
  
  console.log(Id);
  
  const filter={_id:new ObjectId(Id)}
  const updateDoc={
    $set:{
      feedback:feed.feedbk
    }
  }
  const result =await classesCollection.updateOne(filter,updateDoc)
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