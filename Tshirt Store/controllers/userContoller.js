const User = require("../models/user")
const BigPromise = require("../middlewares/bigPromise")
const CustomError = require("../utils/customError")
const cookieToken = require("../utils/cookieToken")
const fileUpload = require("express-fileupload")
const cloudinary = require("cloudinary")

exports.signup = BigPromise(async(req,res,next)=>{
    // let result;
    if(!req.files){
        return next(new CustomError("photo is required for signup",400))
    }

    const { name, email, password } = req.body
    if(!name || !email || !password){
        return next(new CustomError("Name, email and password are required",400))
    }

    let file = req.files.photo
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath,{
            folder:"users",
            width:150,
            crop:"scale"
        })

    const user = await User.create({
        name,
        email,
        password,
        photo:{
            id:result.public_id,
            secure_url:result.secure_url
        }
    })
    cookieToken(user,res)  //because this was repetitive so we made a util for that
})

exports.login = BigPromise(async(req,res,next)=>{
    const {email, password} = req.body
    
    //check for email and password
    if(!email && !password){
        return next(new CustomError("please provide email and password",400))
    }
    //get user from db
    const user=await User.findOne({email}).select("+password")  //select has to be writtten because by default password select is false and + is imp
    // console.log(user)
    // check whether user is there or not
    if(!user){
        return next(new CustomError("Email or Password does not match or exist",400))
    }
    //yes user is there now check the password
    const isPasswordCorrect = await user.isvalidatedPassword(password)
    //if the password is not matching
    if(!isPasswordCorrect){
        return next(new CustomError("Email or Password does not match or exist",400))
    }
    //if all goes good then send the token
    cookieToken(user,res)
})

exports.logout = BigPromise(async(req,res,next)=>{
    res.cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })
    res.status(200).json({
        success:true,
        message:"Logout Success"
    })
})
