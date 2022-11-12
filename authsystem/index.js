const app = require("./app")
const {PORT} = process.env   //this is same as saying process.env we are just writing for simplification
app.listen(PORT,()=> console.log(`Server is running on port ${PORT}...`))