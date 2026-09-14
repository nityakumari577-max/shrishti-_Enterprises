const express = require("express");
const router = express.Router();

const Razorpay = require("razorpay");
const crypto = require("crypto");

const Order = require("../models/order");

// ==========================================
// CREATE RAZORPAY INSTANCE
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

    if (!amount || Number(amount) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Valid amount is required"
        });
    }

    const options = {
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`
    };

    console.log("Creating Razorpay order:", options);

    const razorpayOrder = await razorpay.orders.create(options);

    console.log(
        "Razorpay order created:",
        razorpayOrder.id
    );

    return res.status(200).json({
        success: true,
        order: razorpayOrder
    });

} catch (error) {
    console.error(
        "Razorpay Create Order Error:",
        error
    );

    return res.status(500).json({
        success: false,
        message: "Failed to create Razorpay order",
        error: error.message
    });
}

});

// ==========================================
// VERIFY RAZORPAY PAYMENT
// POST /api/verify-payment
// ==========================================

router.post("/verify-payment", async (req, res) => {
try {
const {
razorpay_order_id,
razorpay_payment_id,
razorpay_signature,
orderDetails
} = req.body;

    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
    ) {
        return res.status(400).json({
            success: false,
            message: "Payment details are missing"
        });
    }

    const body =
        razorpay_order_id +
        "|" +
        razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
            success: false,
            message: "Invalid payment signature"
        });
    }

    // ==========================================
    // SAVE ORDER IN MONGODB
    // ==========================================

    let savedOrder = null;

    if (orderDetails) {
        const newOrder = new Order({
            customerName:
                orderDetails.customerName || "Customer",

            customerEmail:
                orderDetails.customerEmail || "",

            customerPhone:
                orderDetails.customerPhone || "",

            address:
                orderDetails.address || "",

            productId:
                orderDetails.productId || "",

            productName:
                orderDetails.productName || "",

            quantity:
                Number(orderDetails.quantity) || 1,

            price:
                Number(orderDetails.price) || 0,

            totalPrice:
                Number(orderDetails.totalPrice) || 0,

            paymentMethod: "ONLINE",

            paymentStatus: "PAID",

            orderStatus: "PLACED",

            razorpayOrderId:
                razorpay_order_id,

            razorpayPaymentId:
                razorpay_payment_id,

            razorpaySignature:
                razorpay_signature
        });

        savedOrder = await newOrder.save();
    }

    return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
        order: savedOrder
    });

} catch (error) {
    console.error(
        "Payment Verification Error:",
        error
    );

    return res.status(500).json({
        success: false,
        message: "Payment verification failed",
        error: error.message
    });
}

});

// ==========================================
// SAVE ORDER MANUALLY
// POST /api/orders/save-order
// ==========================================

router.post("/orders/save-order", async (req, res) => {
try {
const {
customerName,
customerEmail,
customerPhone,
address,
productId,
productName,
quantity,
price,
totalPrice,
paymentMethod,
paymentStatus,
razorpayOrderId,
razorpayPaymentId
} = req.body;
    const newOrder = new Order({
        customerName:
            customerName || "Customer",

        customerEmail:
            customerEmail || "",

        customerPhone:
            customerPhone || "",

        address:
            address || "",

        productId:
            productId || "",

        productName:
            productName || "",

        quantity:
            Number(quantity) || 1,

        price:
            Number(price) || 0,

        totalPrice:
            Number(totalPrice) || 0,

        paymentMethod:
            paymentMethod || "ONLINE",

        paymentStatus:
            paymentStatus || "PENDING",

        razorpayOrderId:
            razorpayOrderId || null,

        razorpayPaymentId:
            razorpayPaymentId || null
    });

    const savedOrder =
        await newOrder.save();

    return res.status(201).json({
        success: true,
        message: "Order saved successfully",
        order: savedOrder
    });

} catch (error) {
    console.error(
        "Save Order Error:",
        error
    );

    return res.status(500).json({
        success: false,
        message: "Failed to save order record",
        error: error.message
    });
}

});

// ==========================================
// GET ALL ORDERS FOR ADMIN
// GET /api/orders/admin/all-orders
// ==========================================

router.get(
"/orders/admin/all-orders",
async (req, res) => {
try {
const orders =
await Order.find().sort({
createdAt: -1
});
        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        console.error(
            "Fetch Orders Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        });
    }
}

);

module.exports = router;
