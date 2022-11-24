const express = require("express")
const router = express.Router()

const {signup,login,logout,forgotPassword,passwordreset,getLoggedInUserDetails,changePassword,updateUserDetails} = require("../controllers/userContoller")
const { isLoggedIn } = require("../middlewares/user")
const { update } = require("../models/user")

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/forgotPassword").post(forgotPassword)
router.route("/password/reset/:token").post(passwordreset)
router.route("/userdashboard").get(isLoggedIn,getLoggedInUserDetails)
router.route("/password/update").post(isLoggedIn,changePassword)
router.route("/userdashboard/update").post(isLoggedIn,updateUserDetails)

module.exports = router