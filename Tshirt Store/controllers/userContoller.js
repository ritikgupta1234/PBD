const User = require("../models/user")
const BigPromise = require("../middlewares/bigPromise")
const CustomError = require("../utils/customError")
const cookieToken = require("../utils/cookieToken")
const fileUpload = require("express-fileupload")
const cloudinary = require("cloudinary")
const mailHelper = require("../utils/emailHelper")
const crypto = require("crypto")

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

exports.forgotPassword = BigPromise(async(req,res,next)=>{
    //collect email
    const {email} = req.body
    //find user in database
    const user = await User.findOne({email})
    //if user not found in email
    if(!user){
        return next(new CustomError("email not found as registered",400))
    }
    //creating token
    const forgotToken = user.getForgotPasswordToken()
    //save user feilds in DB
    await user.save({validateBeforeSave:false})   //temp not check anything and will save whatever you are sending
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}` //crafting our url
    const message = `Copy paste this link in your URL and hit enter \n \n ${myUrl}`

    //attempt to send email
    try {
        await mailHelper({
            email:user.email,
            subject:"Password reset email - Tshirt Store",
            message:message
        })
        //json response if email is successful
        res.status(200).json({
            success:true,
            message:"email sent successfully"
        })
        //reset user feilds if things goes wrong
    } catch (error) {
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save({validateBeforeSave:false})   //temp not check anything and will save whatever you are sending
        return next(new CustomError(error.message,500))
    }

})

exports.passwordreset = BigPromise(async(req,res,next)=>{
    const token = req.params.token
    const encryToken =  crypto.createHash("sha256").update(token).digest("hex")
    console.log(encryToken)
    const user = await User.findOne({
        forgotPasswordToken:encryToken,
        forgotPasswordExpiry:{$gt:Date.now()}
    })
    if(!user){
        return next(new CustomError("Token is invalid or expired",400))
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new CustomError("Password and confirm password do not match",400))
    }
    user.password = req.body.password
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined

    await user.save()

    //send json response or send token
    cookieToken(user,res)
})

exports.getLoggedInUserDetails = BigPromise(async(req,res,next)=>{
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success:true,
        user,
    })
})

exports.changePassword = BigPromise(async(req,res,next)=>{
    const userId = req.user.id
    const user = await User.findById(userId).select("+password")
    const isCorrectOldPassword = await user.isvalidatedPassword(req.body.oldPassword)
    if(!isCorrectOldPassword){
        return next(new CustomError("old password is incorrect",400))
    }
    user.password = req.body.newPassword
    await user.save()
    cookieToken(user,res)
})

exports.updateUserDetails = BigPromise(async(req,res,next)=>{
    if(!req.body.name || !req.body.email){
        return next(new CustomError("Please enter name and email",400))
    }
    const newData = {
        name:req.body.name,
        email:req.body.email,
        //add other fields whatever you want
    }
    if(req.files && req.files.photo !==""){
        const user = await User.findById(req.user.id)
        //storing the image id in a var
        const imageId = user.photo.id
        //deleting photo in the cloudinary
        const resp = await cloudinary.v2.uploader.destroy(imageId)
        // upload the new photo 
        let file = req.files.photo
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath,{
            folder:"users",
            width:150,
            crop:"scale"
        })
        newData.photo = {
            id:result.public_id,
            secure_url:result.secure_url
        }
    }
    const user = await User.findByIdAndUpdate(req.user.id,newData,{
        new:true,
        runValidators:true,
        useFindAndModify:false, //always turn this flag as false

    })
    res.status(200).json({
        success:true,
        user
    })
})

