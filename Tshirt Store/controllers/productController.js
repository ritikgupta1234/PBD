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

    req.body.photos = imagesArray   //populating the photos array with the image url and id so that we can store them in the database
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

exports.adminGetAllProduct = BigPromise(async(req,res,next)=>{
    const products = await Product.find()
    
    res.status(200).json({
        success:true,
        products
    })
})

exports.getOneProduct = BigPromise(async(req,res,next)=>{
    const product = await Product.findById(req.params.id)
    if(!product){
        return next(new CustomError("No product found with this Id",400))
    }
    res.status(200).json({
        success:true,
        product
    })
})

exports.addReview = BigPromise(async(req,res,next)=>{
    const {rating, comment, productId} = req.body

    const review = {
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment:comment
    }
    //find the product with the id
    const product = await Product.findById(productId)

    //check whether this has made a review for this product in the past or not. if yes then update it 
    //AlreadyReviewed is a boolean
    const AlreadyReviewed = product.reviews.find(
        (rev)=>rev.user.toString() === req.user._id.toString()    //user_id is a bson field so for comparing it we need to convert it into the string both side then check it
        //rev is the individual element in the array
    )
    if(AlreadyReviewed){
        product.reviews.forEach((rev)=>{
            if(rev.user.toString() === req.user._id.toString()){
                review.comment = comment
                review.rating = rating
            }
        })
    }
    else{
        product.reviews.push(review)
        product.numberOfReviews = product.reviews.length
    }

    //now we need to adjust ratings
    product.ratings = product.reviews.reduce((acc,item)=>item.rating+acc,0) / product.reviews.length

    //save
    await product.save({validateBeforeSave:false})
    res.status(200).json({
        success:true,
        message:"Thanks for rating the product!"
    })

})

exports.deleteReview = BigPromise(async(req,res,next)=>{
    const { productId } = req.query.productId

    //find the product with the id
    const product = await Product.findById(productId)

    //filter will filter the array reviews by removing the value desired value which matches the condition
    const reviews = product.reviews.filter(
        (rev)=>rev.user.toString() === req.user._id.toString()    
    )
    
    const numberOfReviews = reviews.length
    
    //now we need to adjust ratings
    product.ratings = product.reviews.reduce((acc,item)=>item.rating+acc,0) / product.reviews.length

    //update the product
    await Product.findByIdAndUpdate(productId,{
        reviews,
        ratings,
        numberOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    
    res.status(200).json({
        success:true,
        message:"Deletion Successful!"
    })
})

//our frontend team asked to design a route where he can get the reviews for that product just by giving the id so this is  that method
//now if frontend team asks to give only the brand name or similarly the other info about the product you can design the route in the similar way
exports.getOnlyReviewsForOneProduct = BigPromise(async(req,res,next)=>{
    const product = await Product.findById(req.query.id)
    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
})

exports.adminUpdateOneProduct = BigPromise(async(req,res,next)=>{
    let product = await Product.findById(req.params.id)
    if(!product){
        return next(new CustomError("No product found with this Id",400))
    }
    let imagesArray = []
    if(req.files){
        //destroy the existing images 
        for (let index = 0; index < product.photos.length; index++) {
            const result = await cloudinary.v2.uploader.destroy(product.photos[index].id)          
        }

        //upload and save the new images
        
        
    for(let index=0;index<req.files.photos.length;index++){
        let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
            folder:"products"
        })
    }
        imagesArray.push({
            id:result.public_id,
            secure_url:result.secure_url
        })
    }
    req.body.photos = imagesArray  //populating the photos array with the image url and id so that we can store them in the database
    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,   //ensuring that we receive the response with the new entries not the old ones
        runValidators:true,  //running validators
        useFindAndModify:false
    })
    res.status(200).json({
        success:true,  
        product
    })
})

exports.adminDeleteOneProduct = BigPromise(async(req,res,next)=>{
    const product = await Product.findById(req.params.id)
    if(!product){
        return next(new CustomError("No product found with this Id",400))
    }
    //destroy the existing images 
    for (let index = 0; index < product.photos.length; index++) {
        const result = await cloudinary.v2.uploader.destroy(product.photos[index].id)          
    }
    await product.remove()
    
    res.status(200).json({
        success:true,  
        message:"product was deleted !"
    })
})