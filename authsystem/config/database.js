const mongoose = require("mongoose")
const {MONGODB_URL} = process.env


//now anyone can import this export to connect mongo
exports.connect = () =>{
    mongoose.connect(MONGODB_URL,{
        useNewUrlParser:true,         //this was updated later by mongodb so we have to add this since they want to maintain legacy so didn't change in the codebase
        useUnifiedTopology: true,
    })
    .then(console.log(`DB CONNECTED SUCCESSFULLY`))
    .catch(error =>{
        console.log(`DB CONNECTION FAILED`)
        console.log(error)
        process.exit(1)
    })
}