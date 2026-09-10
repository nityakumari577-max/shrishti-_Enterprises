const express = require("express");

const router = express.Router();

const {
    register,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword,
    googleLogin
} = require("../controllers/userController");


router.post("/register", register);

router.post("/verify-email", verifyEmail);

router.post("/login", login);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);
router.post("/google", googleLogin);




module.exports = router;