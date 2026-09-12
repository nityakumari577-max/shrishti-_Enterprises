const express = require("express");
const router = express.Router();
const Order = require("../models/order");

// ==========================================
// SAVE NEW ORDER AFTER PAYMENT VERIFICATION
// POST /api/orders/save-order
// ==========================================

router.post("/save-order", async (req, res) => {
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

router.get("/admin/all-orders", async (req, res) => {
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