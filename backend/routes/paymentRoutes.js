const express = require("express");
const Razorpay = require("razorpay");

const router = express.Router();

// ==========================================
// RAZORPAY CONFIGURATION
// ==========================================

const razorpay = new Razorpay({
key_id: process.env.RAZORPAY_KEY_ID,
key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ==========================================
// TEST PAYMENT ROUTE
// GET /api/test-payment-route
// ==========================================

router.get("/test-payment-route", (req, res) => {

res.json({
    success: true,
    message: "Payment route is working"
});

});

// ==========================================
// CREATE RAZORPAY ORDER
// POST /api/create-order
// ==========================================

router.post("/create-order", async (req, res) => {
try {

    console.log("=================================");
    console.log("RAZORPAY CREATE ORDER REQUEST");
    console.log(req.body);
    console.log("=================================");

    const {
        amount,
        currency = "INR",
        receipt
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (amount === undefined || amount === null) {

        return res.status(400).json({
            success: false,
            message: "Amount is required"
        });

    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {

        return res.status(400).json({
            success: false,
            message: "Invalid amount"
        });

    }

    // ==========================================
    // RAZORPAY AMOUNT
    // Razorpay expects paise
    // ₹1900 = 190000 paise
    // ==========================================

    const amountInPaise =
        Math.round(numericAmount * 100);

    // ==========================================
    // CREATE RAZORPAY ORDER
    // ==========================================

    const options = {

        amount: amountInPaise,

        currency: currency,

        receipt:
            receipt ||
            `receipt_${Date.now()}`

    };

    console.log("Creating Razorpay order:");
    console.log(options);

    const razorpayOrder =
        await razorpay.orders.create(options);

    console.log("RAZORPAY ORDER CREATED:");
    console.log(razorpayOrder);

    // ==========================================
    // SEND RESPONSE
    // ==========================================

    return res.status(200).json({

        success: true,

        message: "Razorpay order created successfully",

        order: razorpayOrder

    });

}

catch (error) {

    console.error("=================================");
    console.error("RAZORPAY CREATE ORDER ERROR");
    console.error("=================================");

    console.error("Error message:", error.message);
    console.error("Error description:", error.error);

    return res.status(500).json({

        success: false,

        message: "Failed to create Razorpay order",

        error: error.message

    });

}

});

module.exports = router;
