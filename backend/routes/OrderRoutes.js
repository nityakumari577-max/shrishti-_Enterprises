const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const Order = require("../models/order");

// ==========================================
// RAZORPAY INSTANCE
// ==========================================

const razorpay = new Razorpay({
key_id: process.env.RAZORPAY_KEY_ID,
key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ==========================================
// CREATE RAZORPAY ORDER
// POST /api/create-order
// ==========================================

router.post("/create-order", async (req, res) => {
try {

    const { amount } = req.body;

    if (!amount) {
        return res.status(400).json({
            success: false,
            message: "Amount is required"
        });
    }

    const options = {
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
        success: true,
        order: razorpayOrder
    });

} catch (error) {

    console.error("Razorpay Create Order Error:", error);

    res.status(500).json({
        success: false,
        message: "Failed to create Razorpay order",
        error: error.message
    });
}

});

// ==========================================
// SAVE NEW ORDER AFTER PAYMENT
// POST /api/orders/save-order
// ==========================================

router.post("/orders/save-order", async (req, res) => {
try {
    const {
        customer,
        products,
        totalAmount,
        razorpayOrderId,
        razorpayPaymentId
    } = req.body;

    const newOrder = new Order({
        orderId: `ORD-${Date.now()}`,
        customer,
        products,
        totalAmount,
        paymentDetails: {
            razorpayOrderId,
            razorpayPaymentId,
            paymentMethod: "Online (Razorpay)",
            paymentStatus: "Paid"
        }
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
        success: true,
        order: savedOrder
    });

} catch (error) {

    console.error("Save Order Error:", error);

    res.status(500).json({
        success: false,
        message: "Failed to save order record"
    });
}

});

// ==========================================
// FETCH ALL ORDERS FOR ADMIN
// GET /api/orders/admin/all-orders
// ==========================================

router.get("/orders/admin/all-orders", async (req, res) => {
try {

    const orders = await Order.find().sort({
        createdAt: -1
    });

    res.status(200).json({
        success: true,
        orders
    });

} catch (error) {

    console.error("Fetch Orders Error:", error);

    res.status(500).json({
        success: false,
        message: "Failed to fetch orders"
    });
}

});

module.exports = router;
