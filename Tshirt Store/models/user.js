const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please provide a name"],
        maxlength:[40,"Name should be under 40 characters"]
    },
    email:{
        type:String,
        required:[true,"Please provide an email"],
        validator:[validator.isEmail,"Please enter email in correct format"],
        unique:true
    },
    password:{
        type:String,
        required:[true,"Please provide a password"],
        minlength:[6,"Password should be atleast 6 char"],
        select:false   //now by default password feild will not come bydefault if you want ask for it explicitly
    },
    role:{
        type:String,
        default:'user',

    },
    photo:{
        id:{
            type:String,
            required:true
        },
        secure_url:{
            type:String,
            required:true
        },
    },
    forgotPasswordToken:String,
    forgotPasswordExpiry:Date,
    createdAt:{
        type:Date,
        default:Date.now,
    },
})

//encrypting the password before save
userSchema.pre('save',async function(next){
    if(!this.isModified("password")){  //making sure this runs only first time not always
        return next()
    }
    this.password = await bcrypt.hash(this.password,10)
})

//validate the password with passed on user password
userSchema.methods.isvalidatedPassword = async function(usersendPassword){
    return await bcrypt.compare(usersendPassword,this.password)
}

//create and return jwt token
userSchema.methods.getJwtToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,
       { expiresIn:process.env.JWT_EXPIRY})
}

//generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = function(){
    //generate a long and random string
    const forgotToken = crypto.randomBytes(20).toString("hex")
    // this.forgotPasswordToken = forgotToken  //this line is completely fine but we will go to a one more level of security
    //generating a hash - make sure to get a hash on backend when the user is sending token for comparison
    this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex")  //storing hashed value in the backend

    // time of token
    this.forgotPasswordExpiry = Date.now() + process.env.FORGOT_PASS_TIME
    return forgotToken
}

module.exports = mongoose.model("User",userSchema)