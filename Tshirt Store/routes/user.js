const express = require("express")
const router = express.Router()

const {signup,login,logout,forgotPassword,passwordreset,getLoggedInUserDetails,changePassword,updateUserDetails,
    adminAllUser,managerAllUser,admingetOneUser,adminupdateOneUserDetails,adminDeleteOneUser
} = require("../controllers/userContoller")
const { isLoggedIn,customRole, } = require("../middlewares/user")
const { update } = require("../models/user")

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/forgotPassword").post(forgotPassword)
router.route("/password/reset/:token").post(passwordreset)
router.route("/userdashboard").get(isLoggedIn,getLoggedInUserDetails)
router.route("/password/update").post(isLoggedIn,changePassword)
router.route("/userdashboard/update").post(isLoggedIn,updateUserDetails)

//admin only routes
router.route("/admin/users").get(isLoggedIn,customRole("admin"),adminAllUser)
router.route("/admin/users/:id")
.get(isLoggedIn,customRole("admin"),admingetOneUser)
.put(isLoggedIn,customRole("admin"),adminupdateOneUserDetails)
.delete(isLoggedIn,customRole("admin"),adminDeleteOneUser)
//managers only routes
router.route("/manager/users").get(isLoggedIn,customRole("manager"),managerAllUser)

module.exports = router