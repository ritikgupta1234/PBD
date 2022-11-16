const express=require("express")
const fileUpload=require("express-fileupload")
const cloudinary=require("cloudinary").v2
const app=express()

cloudinary.config({ 
    // cloud_name:process.env.CLOUDNAME
    cloud_name: 'dnid3luri',  
    api_key: '856566746138961', 
    api_secret: '8xTYuSDQndrMo_bgmMicu8KYC4g' 
  });
app.set("view engine","ejs")

//midddleware 
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/",
}))
app.get("/myget",(req,res)=>{
    //postman - {name:ritik}  website - {}
    console.log(req.body)
    res.send(req.body)
    //postman - {} website - {name:ritik}
    // console.log(req.query)
    // res.send(req.query)
})

app.post("/mypost",async(req,res)=>{
    console.log(req.body)
    console.log(req.files)
    let file=req.files.samplefile
    result=await cloudinary.uploader.upload(file.tempFilePath,{
        folder:"users"
    })
    console.log(result)
    details={
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        result,
    }
    res.send(details)
})

app.get("/mygetform",(req,res)=>{
    res.render('getform')
})
app.get("/mypostform",(req,res)=>{
    res.render('postform')
})

app.listen("4000",()=>console.log(`server is running on port 4000`))
