const BigPromise = require("../middlewares/bigPromise")
exports.home = BigPromise((req,res)=>{
    res.status(200).json({
        success:true,
        greeting:"Hello from API",
    })
})


exports.homeDummy = BigPromise((req,res)=>{
    res.status(200).json({
        success:true,
        greeting:"This is another dummy route",
    })
})













//METHOD-1
// exports.home = BigPromise((req,res)=>{
//     res.status(200).json({
//         success:true,
//         greeting:"Hello from API",
//     })
// })


//METHOD-2
//using async-await and trycatch
// exports.home = async(req,res)=>{
//     try {
//         // const db = await something()
//         res.status(200).json({
//             success:true,
//             greeting:"Hello from API",
//         })
//     } catch (error) {
//         console.log(error)
//     }
// }

//feel free to use any of them both are same and will do the same thing and there is third version in which use the promise whenever necessary 
