const User = require("../models/user")
const BigPromise = require("../middlewares/bigPromise")
const CustomError = require("../utils/customError")
const jwt = require("jsonwebtoken")

exports.isLoggedIn = BigPromise(async(req,res,next)=>{
    const token = req.cookies.token || req.header("Authorization").replace("Bearer ","")
    if(!token){
        return next(new CustomError("Login first to access this page",401))
    }
    //decoding the token
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    //this req has lots of properties like cookies etc here we are inserting our one more prop that is user
    //which can be accessed anywhere where this req is present, if you want you can call this as req.superman anything
    //and whatever infor we have stored in token we can access all with the help of  dot notation eg id
    req.user = await User.findById(decoded.id)
    next()
})

exports.customRole = (...roles) =>{ //this is industry level code and it is done in this way by spreading the string and converting
    //it into array as performing operation on array is more easy compared to string
    return (req,res,next) =>{
        if(!roles.includes(req.user.roles)){
            return next(new CustomError("You are not allowed for this resourse",403))
        }
        next()
    }
}