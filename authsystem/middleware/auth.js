const jwt = require("jsonwebtoken")
//model is optional

const auth = (req,res,next)=>{
    console.log(req.cookies)
    const token = req.header("Authorization").replace("Bearer ","") || req.cookies.token || req.body.token

    if(!token){
        return res.status(403).send("token is missing")
    }
    try {
        const decode = jwt.verify(token,process.env.SECRET_KEY)
        console.log(decode)
        req.user=decode   //just like other properties you can add your properties in it.
        // Method-2
        //bring info from the DB by searching in the database find the user name with email and get the info what you want
    } catch (error) {
        return res.status(401).send("Invalid token")
    }
    return next()
}

module.exports = auth;