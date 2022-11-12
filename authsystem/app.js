require("dotenv").config()
require("./config/database").connect()  //requiring the db and calling connect func

const bcrypt = require("bcryptjs")
const express = require("express")
const User = require("./model/user")
const app = express()

app.use(express.json())   //for req.body using inbuilt body parser and this is an middleware it will do it by themselve

app.get("/",(req,res)=>{
    res.send("<h1>Hello from auth system - Ritik</h1>")
})

//step-1 get all info
app.post("/register",async(req,res)=>{
    const {firstname,lastname,email,password} = req.body
    //to apply check we can use the mongoose also but this is very simple so we will be using our own validations for this

    //step-2 check mandatory fields
    if(!(firstname && lastname && password && email))
    res.status(400).send("all fields are requried")

    //step-3 already registered 
    const existingUser =await User.findOne({email})  //this will return a promise cause of await
    if(existingUser){
        res.status(401).send("User already exists")
    }
    
    //step-4 take care of password
    //here we will use await bcz it go throughs many algos so it may take time
    const myEncPassword = await bcrypt.hash(password,10)   //await bcz it is a database operation
    const user = await User.create({
        firstname,
        lastname,
        email:email.toLowerCase(),
        password:myEncPassword
    })
    
    //both the above method and below method both are fine you can use anyone while creating
    // User.create({
    //     firstname,
    //     lastname,
    //     email:email.toLowerCase(),
    //     password:myEncPassword
    // })
    // .then(console.log(`Created successfully`))
    // .catch(error =>{
    //     console.log(`Can't create the user`)
    //     console.log(error)
    //     process.exit(1)
    // })
    
})


module.exports = app