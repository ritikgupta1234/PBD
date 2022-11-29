const Product = require("../models/product")
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError")
const cloudinary = require("cloudinary");
const WhereClause = require("../utils/whereClause");

//we just need to handle the images
//we can add our own check for each field indivdually also but here we are majorly depeneding on the model that they will be throwing the error
exports.addProduct = BigPromise(async(req,res,next)=>{
    //images 
    console.log(req.user.id)
    let imagesArray = []
    if(!req.files){
        return next(new CustomError("images are required",401))
    }
    if(req.files){
        for(let index=0;index<req.files.photos.length;index++){
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
                folder:"products"
            })
            imagesArray.push({
                id:result.public_id,
                secure_url:result.secure_url
            })
        }
    }

    req.body.photos = imagesArray   //we are just over writing the photos with the imagesArray
    req.body.user = req.user.id
    const product = await Product.create(req.body)

    res.status(200).json({
        success:true,
        product
    })
})

exports.getAllProduct = BigPromise(async(req,res,next)=>{
    
    const resultPerPage = 6
    const totalcountProduct = await Product.countDocuments()
    

    const productsObj = new WhereClause(Product.find(),req.query).search().filter() //this will not return a promise here we are creating a object while the execution is happening in below line where we are using await

    let products = await productsObj.base
    const filteredProductNumber = products.length
    
    
    productsObj.pager(resultPerPage)
    products = await productsObj.base.clone()



    res.status(200).json({
        success:true,
        products,
        filteredProductNumber,
        totalcountProduct
    })
})