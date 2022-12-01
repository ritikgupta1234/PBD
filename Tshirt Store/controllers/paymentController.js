import { nanoid } from 'nanoid'
const BigPromise = require("../middlewares/bigPromise");
const stripe = require('stripe')(process.env.STRIPE_SECRET)
exports.sendStripeKey = BigPromise(async(req,res,next)=>{
    res.status(200).json({
        stipekey:process.env.STRIPE_KEY,    // we can give these key no problem in this but not the secret key
    })
})


exports.captureStripePayment = BigPromise(async(req,res,next)=>{
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',

        //optional 
        metadata:{integration_check:"accept_a_payment"} //there are a lot of metadatas that you can add
    });
    res.status(200).json({
        success:true,
        amount:req.body.amount,
        client_secret:paymentIntent.client_secret
        //you can optionally send id as well
    })
})

exports.sendRazorpayKey = BigPromise(async(req,res,next)=>{
    res.status(200).json({
        stipekey:process.env.RAZORPAY_API_KEY,    // we can give these key no problem in this but not the secret key
    })
})


exports.captureRazorpayPayment = BigPromise(async(req,res,next)=>{
    const instance = new Razorpay({ key_id: process.env.RAZORPAY_API_KEY, key_secret: process.env.RAZORPAY_SECRET })
    instance.orders.create({
    amount: req.body.amount,
    currency: "INR",
    receipt:nanoid(),
    })
    const myOrder = await instance.orders.create(options)
    res.status(200).json({
        success:true,
        amount:req.body.amount,
        order:myOrder
    })
})