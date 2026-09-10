const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: false,
            default: null
        },

        // GOOGLE LOGIN
        googleId: {
            type: String,
            default: null
        },

        profileImage: {
            type: String,
            default: null
        },

        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local"
        },

        // EMAIL VERIFICATION
        isEmailVerified: {
            type: Boolean,
            default: false
        },

        verificationOTP: {
            type: String,
            default: null
        },

        verificationOTPExpiry: {
            type: Date,
            default: null
        },

        // PASSWORD RESET
        resetPasswordOTP: {
            type: String,
            default: null
        },

        resetPasswordOTPExpiry: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);