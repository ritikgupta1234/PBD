const express=require("express")
const app=express()

app.set("view engine","ejs")

//midddleware 
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.get("/myget",(req,res)=>{
    //postman - {name:ritik}  website - {}
    // console.log(req.body)
    // res.send(req.body)
    //postman - {} website - {name:ritik}
    console.log(req.query)
    res.send(req.query)
})

app.get("/mygetform",(req,res)=>{
    res.render('getform')
})
app.get("/mypostform",(req,res)=>{
    res.render('postform')
})

app.listen("4000",()=>console.log(`server is running on port 4000`))
