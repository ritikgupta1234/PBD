//responsible for handling all the routes to home
const express = require("express")
const router = express.Router()

const { home, homeDummy } = require("../controllers/homeController")
router.route("/").get(home)  //whenever the home route is get the home will be executed in the homeController.js
router.route("/dummy").get(homeDummy)


module.exports = router


//in app.js we only bring the routes not the contollers