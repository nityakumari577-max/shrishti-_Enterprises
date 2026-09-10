const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);


// ==========================================
// EMAIL CONFIGURATION
// ==========================================

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});


// ==========================================
// GENERATE JWT
// ==========================================

const generateToken = (user) => {

    return jwt.sign(
        {
            id: user._id,
            name: user.name,
            email: user.email,
            role: "customer"
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d"
        }
    );
};


// ==========================================
// GOOGLE LOGIN
// ==========================================

exports.googleLogin = async (req, res) => {

    try {

        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                message: "Google credential is required"
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const {
            sub: googleId,
            email,
            name,
            picture,
            email_verified
        } = payload;

        if (!email || !email_verified) {
            return res.status(401).json({
                message:
                    "Google email could not be verified"
            });
        }

        let user = await User.findOne({
            googleId: googleId
        });

        if (!user) {

            user = await User.findOne({
                email: email.toLowerCase()
            });

        }

        if (!user) {

            user = new User({

                name:
                    name || "Google User",

                email:
                    email.toLowerCase(),

                password:
                    null,

                googleId:
                    googleId,

                profileImage:
                    picture || null,

                authProvider:
                    "google",

                isEmailVerified:
                    true

            });

            await user.save();

        } else {

            user.googleId = googleId;

            user.profileImage =
                picture || user.profileImage;

            user.isEmailVerified = true;

            await user.save();
        }

        const token =
            generateToken(user);

        res.status(200).json({

            message:
                "Google login successful",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                profileImage:
                    user.profileImage

            }

        });

    } catch (error) {

        console.error(
            "GOOGLE LOGIN ERROR:",
            error
        );

        res.status(401).json({

            message:
                "Google login failed"

        });

    }

};

// ==========================================
// REGISTER CUSTOMER
// ==========================================

exports.register = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {

            return res.status(400).json({
                message: "Name, email and password are required"
            });

        }

        // Check password length
        if (password.length < 6) {

            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });

        }

        // Check existing user
        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {

            // Already verified
            if (existingUser.isEmailVerified) {

                return res.status(400).json({
                    message:
                        "An account with this email already exists"
                });

            }

            // ==========================================
            // UNVERIFIED USER - SEND NEW OTP
            // ==========================================

            const otp = Math.floor(
                100000 + Math.random() * 900000
            ).toString();

            existingUser.verificationOTP = otp;

            existingUser.verificationOTPExpiry =
                new Date(Date.now() + 10 * 60 * 1000);

            await existingUser.save();

            await transporter.sendMail({

                from: process.env.EMAIL_USER,

                to: existingUser.email,

                subject:
                    "Verify your Shrishti Enterprises account",

                text:
                    `Hello ${existingUser.name},

Your Shrishti Enterprises verification OTP is:

${otp}

This OTP is valid for 10 minutes.

Thank you,
Shrishti Enterprises`
            });

            return res.status(200).json({

                message:
                    "Verification OTP sent to your email"

            });

        }


        // ==========================================
        // HASH PASSWORD
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ==========================================
        // GENERATE VERIFICATION OTP
        // ==========================================

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();


        // ==========================================
        // CREATE USER
        // ==========================================

        const user = new User({

            name: name.trim(),

            email: email.toLowerCase().trim(),

            password: hashedPassword,

            isEmailVerified: false,

            verificationOTP: otp,

            verificationOTPExpiry:
                new Date(Date.now() + 10 * 60 * 1000)

        });


        await user.save();


        // ==========================================
        // SEND VERIFICATION EMAIL
        // ==========================================

        await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to: user.email,

            subject:
                "Verify your Shrishti Enterprises account",

            text:
                `Hello ${user.name},

Your Shrishti Enterprises verification OTP is:

${otp}

This OTP is valid for 10 minutes.

Thank you,
Shrishti Enterprises`
        });


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        res.status(201).json({

            message:
                "Registration successful. Please verify your email."

        });


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Registration failed",

            error:
                error.message

        });

    }

};


// ==========================================
// VERIFY EMAIL
// ==========================================

exports.verifyEmail = async (req, res) => {

    try {

        const { email, otp } = req.body;


        // Find user
        const user = await User.findOne({

            email:
                email.toLowerCase()

        });


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        // Already verified
        if (user.isEmailVerified) {

            return res.status(400).json({

                message:
                    "Email is already verified"

            });

        }


        // Check OTP
        if (
            !user.verificationOTP ||
            user.verificationOTP !== otp
        ) {

            return res.status(400).json({

                message:
                    "Invalid OTP"

            });

        }


        // Check OTP expiry
        if (
            !user.verificationOTPExpiry ||
            user.verificationOTPExpiry < new Date()
        ) {

            return res.status(400).json({

                message:
                    "OTP has expired"

            });

        }


        // ==========================================
        // VERIFY USER
        // ==========================================

        user.isEmailVerified = true;

        user.verificationOTP = null;

        user.verificationOTPExpiry = null;


        await user.save();


        // ==========================================
        // GENERATE LOGIN TOKEN
        // ==========================================

        const token =
            generateToken(user);

// ==========================================
// GOOGLE LOGIN
// ==========================================

exports.googleLogin = async (req, res) => {

    try {

        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                message: "Google credential is required"
            });
        }

        // ==========================================
        // VERIFY GOOGLE TOKEN
        // ==========================================

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const {
            sub: googleId,
            email,
            name,
            picture,
            email_verified
        } = payload;


        // ==========================================
        // CHECK GOOGLE EMAIL
        // ==========================================

        if (!email || !email_verified) {

            return res.status(401).json({
                message:
                    "Google email could not be verified"
            });

        }


        // ==========================================
        // FIND USER BY GOOGLE ID
        // ==========================================

        let user = await User.findOne({
            googleId: googleId
        });


        // ==========================================
        // IF NOT FOUND, FIND BY EMAIL
        // ==========================================

        if (!user) {

            user = await User.findOne({
                email: email.toLowerCase()
            });

        }


        // ==========================================
        // CREATE NEW USER
        // ==========================================

        if (!user) {

            user = new User({

                name:
                    name || "Google User",

                email:
                    email.toLowerCase(),

                password:
                    null,

                googleId:
                    googleId,

                profileImage:
                    picture || null,

                authProvider:
                    "google",

                isEmailVerified:
                    true

            });

            await user.save();

        } else {

            // ==========================================
            // UPDATE EXISTING USER WITH GOOGLE DETAILS
            // ==========================================

            user.googleId = googleId;

            user.profileImage =
                picture || user.profileImage;

            user.isEmailVerified = true;

            await user.save();
        }


        // ==========================================
        // GENERATE SHRISHTI JWT
        // ==========================================

        const token =
            generateToken(user);


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({

            message:
                "Google login successful",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                profileImage:
                    user.profileImage

            }

        });


    } catch (error) {

        console.error(
            "GOOGLE LOGIN ERROR:",
            error
        );

        res.status(401).json({

            message:
                "Google login failed"

        });

    }

};
        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({

            message:
                "Email verified successfully",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email

            }

        });


    } catch (error) {

        console.error(
            "VERIFY ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Email verification failed",

            error:
                error.message

        });

    }

};


// ==========================================
// LOGIN CUSTOMER
// ==========================================

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;


        // Find user
        const user = await User.findOne({

            email:
                email.toLowerCase()

        });


        // User not found
        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        // ==========================================
        // CHECK EMAIL VERIFICATION
        // ==========================================

        if (!user.isEmailVerified) {

            return res.status(403).json({

                message:
                    "Please verify your email before logging in"

            });

        }


        // ==========================================
        // CHECK PASSWORD
        // ==========================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        // ==========================================
        // GENERATE JWT
        // ==========================================

        const token =
            generateToken(user);


        // ==========================================
        // LOGIN SUCCESS
        // ==========================================

        res.status(200).json({

            message:
                "Login successful",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email

            }

        });


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Login failed",

            error:
                error.message

        });

    }

};


// ==========================================
// FORGOT PASSWORD
// ==========================================

exports.forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;


        // ==========================================
        // CHECK EMAIL
        // ==========================================

        if (!email) {

            return res.status(400).json({

                message:
                    "Email is required"

            });

        }


        // ==========================================
        // FIND USER
        // ==========================================

        const user = await User.findOne({

            email:
                email.toLowerCase().trim()

        });


        // ==========================================
        // DON'T REVEAL WHETHER EMAIL EXISTS
        // ==========================================

        if (!user) {

            return res.status(200).json({

                message:
                    "If this email is registered, a password reset OTP has been sent."

            });

        }


        // ==========================================
        // GENERATE RESET OTP
        // ==========================================

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();


        // ==========================================
        // SAVE OTP
        // ==========================================

        user.resetPasswordOTP = otp;

        user.resetPasswordOTPExpiry =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        await user.save();


        // ==========================================
        // SEND RESET EMAIL
        // ==========================================

        await transporter.sendMail({

            from:
                process.env.EMAIL_USER,

            to:
                user.email,

            subject:
                "Reset your Shrishti Enterprises password",

            text:
                `Hello ${user.name},

Your Shrishti Enterprises password reset OTP is:

${otp}

This OTP is valid for 10 minutes.

If you did not request a password reset, please ignore this email.

Thank you,
Shrishti Enterprises`

        });


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({

            message:
                "If this email is registered, a password reset OTP has been sent."

        });


    } catch (error) {

        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Unable to process password reset"

        });

    }

};


// ==========================================
// RESET PASSWORD
// ==========================================

exports.resetPassword = async (req, res) => {

    try {

        const {
            email,
            otp,
            newPassword
        } = req.body;


        // ==========================================
        // CHECK REQUIRED FIELDS
        // ==========================================

        if (
            !email ||
            !otp ||
            !newPassword
        ) {

            return res.status(400).json({

                message:
                    "Email, OTP and new password are required"

            });

        }


        // ==========================================
        // CHECK PASSWORD LENGTH
        // ==========================================

        if (newPassword.length < 6) {

            return res.status(400).json({

                message:
                    "New password must be at least 6 characters"

            });

        }


        // ==========================================
        // FIND USER
        // ==========================================

        const user = await User.findOne({

            email:
                email.toLowerCase().trim()

        });


        if (!user) {

            return res.status(400).json({

                message:
                    "Invalid reset request"

            });

        }


        // ==========================================
        // CHECK OTP
        // ==========================================

        if (
            !user.resetPasswordOTP ||
            user.resetPasswordOTP !== otp
        ) {

            return res.status(400).json({

                message:
                    "Invalid OTP"

            });

        }


        // ==========================================
        // CHECK OTP EXPIRY
        // ==========================================

        if (
            !user.resetPasswordOTPExpiry ||
            user.resetPasswordOTPExpiry < new Date()
        ) {

            return res.status(400).json({

                message:
                    "OTP has expired"

            });

        }


        // ==========================================
        // HASH NEW PASSWORD
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );


        // ==========================================
        // UPDATE PASSWORD
        // ==========================================

        user.password =
            hashedPassword;


        // ==========================================
        // CLEAR RESET OTP
        // ==========================================

        user.resetPasswordOTP = null;

        user.resetPasswordOTPExpiry = null;


        await user.save();


        // ==========================================
        // SUCCESS
        // ==========================================

        res.status(200).json({

            message:
                "Password reset successfully. You can now login."

        });


    } catch (error) {

        console.error(
            "RESET PASSWORD ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Unable to reset password"

        });

    }

};
