const express = require("express")
require("dotenv").config()  //it is just the way to mention this in both app and index otherwise sometimes it may give some error (no reason)
const app = express()

//import all routes here
const home = require("./routes/home")

//router middleware
app.use("/api/v1",home)


//export app js
module.exports = app