const express = require("express")
const app = express()
app.use(express.json())
app.use(express.static("./public"));
const Razorpay = require("razorpay")
// app.get("/",(req,res)=>{
//     res.send("hi")
// })

app.post("/order",async(req,res)=>{
    const amount = req.body.amount
    
    var instance = new Razorpay({
        key_id:"rzp_test_YVPTM4WLXLTXB8",
        key_secret:"wC84FvjqtnKUepizzdIboD7V",
    })
    var options={
        amount : amount*100,   //amount in the smallest currency
        currency:"INR",
        receipt:"order_rcptid_11"
    }
    const myOrder=await instance.orders.create(options)
    res.status(200).json({
        success:true,
        amount,
        order:myOrder
    })
})

app.listen("4000",()=>console.log(`server is running on port 4000`))
