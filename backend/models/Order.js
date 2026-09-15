const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        // ==========================================
        // PRODUCT DETAILS
        // ==========================================

        productId: {
            type: String,
            required: true,
            trim: true
        },

        productName: {
            type: String,
            required: true,
            trim: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },

        // ==========================================
        // CUSTOMER DETAILS
        // ==========================================

        customerName: {
            type: String,
            required: true,
            trim: true
        },

        customerEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        customerPhone: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        // ==========================================
        // PAYMENT DETAILS
        // ==========================================

        paymentMethod: {
            type: String,
            enum: ["COD", "ONLINE"],
            required: true
        },

        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Paid",
                "Failed",
                "Refunded"
            ],
            default: "Pending"
        },

        // ==========================================
        // ORDER STATUS
        // ==========================================

        orderStatus: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
            ],
            default: "Pending"
        },

        // ==========================================
        // RAZORPAY DETAILS
        // ==========================================

        razorpayOrderId: {
            type: String,
            default: null
        },

        razorpayPaymentId: {
            type: String,
            default: null
        },

        razorpaySignature: {
            type: String,
            default: null
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);