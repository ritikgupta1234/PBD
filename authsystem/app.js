require("dotenv").config()
require("./config/database").connect()  //requiring the db and calling connect func

const bcrypt = require("bcryptjs")
const express = require("express")
const User = require("./model/user")
const jwt = require("jsonwebtoken")
const app = express()

app.use(express.json())   //for req.body using inbuilt body parser and this is an middleware it will do it by themselve

app.get("/",(req,res)=>{
    res.send("<h1>Hello from auth system - Ritik</h1>")
})

//step-1 get all info
app.post("/register",async(req,res)=>{
    try {  //use try catch since it is a promise as are using await everywhere and since we are not using promise so use try and catch it is a safe way
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
    
    //step-5 Token creation
    const token = jwt.sign(
        {user_id:user._id, email},  //here we are accessing the unique object id that mongoose has assigned to the user
        process.env.SECRET_KEY,
        {
            expiresIn:"2h"
        }
    )
    user.token=token
    //update or not in the database is your choice
    
    res.status(201).json(user)
    } catch (error) {
        console.log(error)
    }
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
    


module.exports = app