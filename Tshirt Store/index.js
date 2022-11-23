const app = require("./app")
const connectWithDb = require("./config/db")
require("dotenv").config()
const cloudinary = require("cloudinary")
//connect With Database
connectWithDb()

//cloudinary config goes here
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})

app.listen(process.env.PORT,()=>console.log(`Server is running at port: ${process.env.PORT}`)) 
