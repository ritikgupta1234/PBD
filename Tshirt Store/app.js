const express = require("express")
require("dotenv").config()  //it is just the way to mention this in both app and index otherwise sometimes it may give some error (no reason)
const app = express()
const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const fileUpload = require("express-fileupload")

//for swagger documentation
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//regular middleware
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//cookies and file middleware
app.use(cookieParser())
app.use(fileUpload())

//morgan middleware
app.use(morgan("tiny"))

//import all routes here
const home = require("./routes/home")

//router middleware
app.use("/api/v1",home)


//export app js
module.exports = app