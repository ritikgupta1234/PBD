const express = require("express")
const router = express.Router()

const {signup,login,logout,forgotPassword,passwordreset,getLoggedInUserDetails} = require("../controllers/userContoller")
const { isLoggedIn } = require("../middlewares/user")

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/forgotPassword").post(forgotPassword)
router.route("/password/reset/:token").post(passwordreset)
router.route("/userdashboard").get(isLoggedIn,getLoggedInUserDetails)

module.exports = router