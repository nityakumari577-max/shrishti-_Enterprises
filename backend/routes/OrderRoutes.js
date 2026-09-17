const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const Order = require("../models/Order");

// ======================================================
// TEST ORDER ROUTE
// GET /api/orders/test
// ======================================================

router.get("/test", (req, res) => {

res.json({
    success: true,
    message: "Order routes are working"
});

});

// ======================================================
// VERIFY RAZORPAY PAYMENT
// POST /api/orders/verify-payment
// ======================================================

router.post("/verify-payment", async (req, res) => {

try {

    console.log("=================================");
    console.log("RAZORPAY PAYMENT VERIFICATION");
    console.log("=================================");

    console.log("Payment Response:");
    console.log(req.body);


    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderDetails
    } = req.body;


    // ==========================================
    // VALIDATE RAZORPAY DETAILS
    // ==========================================

    if (!razorpay_order_id) {

        return res.status(400).json({
            success: false,
            message: "Razorpay order ID is required"
        });

    }


    if (!razorpay_payment_id) {

        return res.status(400).json({
            success: false,
            message: "Razorpay payment ID is required"
        });

    }


    if (!razorpay_signature) {

        return res.status(400).json({
            success: false,
            message: "Razorpay signature is required"
        });

    }


    // ==========================================
    // CHECK ORDER DETAILS
    // ==========================================

    if (!orderDetails) {

        return res.status(400).json({
            success: false,
            message: "Order details are required"
        });

    }


    // ==========================================
    // CHECK RAZORPAY SECRET
    // ==========================================

    if (!process.env.RAZORPAY_KEY_SECRET) {

        console.error(
            "RAZORPAY_KEY_SECRET IS MISSING"
        );

        return res.status(500).json({

            success: false,

            message:
                "Razorpay secret key is not configured on server"

        });

    }


    // ==========================================
    // GENERATE SIGNATURE
    // ==========================================

    const generatedSignature =
        crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                razorpay_order_id +
                "|" +
                razorpay_payment_id
            )
            .digest("hex");


    console.log(
        "Generated Signature:",
        generatedSignature
    );

    console.log(
        "Received Signature:",
        razorpay_signature
    );


    // ==========================================
    // COMPARE SIGNATURES
    // ==========================================

    if (
        generatedSignature !==
        razorpay_signature
    ) {

        console.error(
            "RAZORPAY SIGNATURE INVALID"
        );

        return res.status(400).json({

            success: false,

            verified: false,

            message:
                "Payment verification failed. Invalid Razorpay signature."

        });

    }


    // ==========================================
    // PAYMENT VERIFIED
    // ==========================================

    console.log(
        "RAZORPAY PAYMENT VERIFIED SUCCESSFULLY"
    );


    // ==========================================
    // GET ORDER DETAILS
    // ==========================================

    const {
        productId,
        productName,
        quantity,
        price,
        totalPrice,
        customerName,
        customerEmail,
        customerPhone,
        address
    } = orderDetails;


    // ==========================================
    // VALIDATE ORDER DETAILS
    // ==========================================

    if (
        !productId ||
        !productName ||
        !quantity ||
        price === undefined ||
        totalPrice === undefined ||
        !customerName ||
        !customerEmail ||
        !customerPhone ||
        !address
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Complete order details are required"

        });

    }


    // ==========================================
    // CHECK FOR DUPLICATE PAYMENT
    // ==========================================

    const existingOrder =
        await Order.findOne({
            razorpayPaymentId:
                razorpay_payment_id
        });


    if (existingOrder) {

        console.log(
            "PAYMENT ALREADY SAVED"
        );

        return res.status(200).json({

            success: true,

            verified: true,

            message:
                "Payment already verified and order already saved",

            order:
                existingOrder

        });

    }


    // ==========================================
    // CREATE ONLINE ORDER
    // ==========================================

    const order = new Order({

        productId:
            String(productId),

        productName:
            String(productName),

        quantity:
            Number(quantity),

        price:
            Number(price),

        totalPrice:
            Number(totalPrice),

        customerName:
            String(customerName),

        customerEmail:
            String(customerEmail).toLowerCase(),

        customerPhone:
            String(customerPhone),

        address:
            String(address),

        paymentMethod:
            "ONLINE",

        paymentStatus:
            "Paid",

        orderStatus:
            "Confirmed",

        razorpayOrderId:
            String(razorpay_order_id),

        razorpayPaymentId:
            String(razorpay_payment_id),

        razorpaySignature:
            String(razorpay_signature)

    });


    const savedOrder =
        await order.save();


    console.log(
        "ONLINE ORDER SAVED SUCCESSFULLY"
    );

    console.log(
        "Order ID:",
        savedOrder._id
    );


    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(201).json({

        success: true,

        verified: true,

        message:
            "Payment verified and order saved successfully",

        order:
            savedOrder

    });

}

catch (error) {

    console.error(
        "================================="
    );

    console.error(
        "RAZORPAY PAYMENT VERIFICATION ERROR"
    );

    console.error(
        "================================="
    );

    console.error(error);


    return res.status(500).json({

        success: false,

        verified: false,

        message:
            "Payment verification failed",

        error:
            error.message

    });

}
```

});

// ======================================================
// SAVE COD ORDER
// POST /api/orders/save-order
// ======================================================

router.post("/save-order", async (req, res) => {

```
try {

    console.log("=================================");
    console.log("COD ORDER REQUEST");
    console.log(req.body);
    console.log("=================================");


    const {
        productId,
        productName,
        quantity,
        price,
        totalPrice,
        customerName,
        customerEmail,
        customerPhone,
        address,
        paymentMethod
    } = req.body;


    if (!productId) {

        return res.status(400).json({
            success: false,
            message: "Product ID is required"
        });

    }


    if (!productName) {

        return res.status(400).json({
            success: false,
            message: "Product name is required"
        });

    }


    if (!quantity || Number(quantity) < 1) {

        return res.status(400).json({
            success: false,
            message: "Valid quantity is required"
        });

    }


    if (price === undefined || price === null) {

        return res.status(400).json({
            success: false,
            message: "Product price is required"
        });

    }


    if (totalPrice === undefined || totalPrice === null) {

        return res.status(400).json({
            success: false,
            message: "Total price is required"
        });

    }


    if (!customerName) {

        return res.status(400).json({
            success: false,
            message: "Customer name is required"
        });

    }


    if (!customerEmail) {

        return res.status(400).json({
            success: false,
            message: "Customer email is required"
        });

    }


    if (!customerPhone) {

        return res.status(400).json({
            success: false,
            message: "Customer phone is required"
        });

    }


    if (!address) {

        return res.status(400).json({
            success: false,
            message: "Delivery address is required"
        });

    }


    if (paymentMethod !== "COD") {

        return res.status(400).json({
            success: false,
            message:
                "This route is only for Cash on Delivery orders"
        });

    }


    const order = new Order({

        productId:
            String(productId),

        productName:
            String(productName),

        quantity:
            Number(quantity),

        price:
            Number(price),

        totalPrice:
            Number(totalPrice),

        customerName:
            String(customerName),

        customerEmail:
            String(customerEmail).toLowerCase(),

        customerPhone:
            String(customerPhone),

        address:
            String(address),

        paymentMethod:
            "COD",

        paymentStatus:
            "Pending",

        orderStatus:
            "Pending",

        razorpayOrderId:
            null,

        razorpayPaymentId:
            null,

        razorpaySignature:
            null

    });


    const savedOrder =
        await order.save();


    console.log(
        "COD ORDER SAVED:"
    );

    console.log(savedOrder);


    return res.status(201).json({

        success: true,

        message:
            "COD order saved successfully",

        order:
            savedOrder

    });

}

catch (error) {

    console.error(
        "SAVE COD ORDER ERROR:"
    );

    console.error(error);


    return res.status(500).json({

        success: false,

        message:
            "Failed to save COD order",

        error:
            error.message

    });

}

});

// ======================================================
// SAVE ONLINE ORDER
// POST /api/orders/save-online-order
// ======================================================

router.post("/save-online-order", async (req, res) => {

try {

    const {
        productId,
        productName,
        quantity,
        price,
        totalPrice,
        customerName,
        customerEmail,
        customerPhone,
        address,
        paymentMethod,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    } = req.body;


    if (
        !productId ||
        !productName ||
        !quantity ||
        price === undefined ||
        totalPrice === undefined ||
        !customerName ||
        !customerEmail ||
        !customerPhone ||
        !address
    ) {

        return res.status(400).json({

            success: false,

            message:
                "All order details are required"

        });

    }


    if (paymentMethod !== "ONLINE") {

        return res.status(400).json({

            success: false,

            message:
                "Payment method must be ONLINE"

        });

    }


    if (
        !razorpayOrderId ||
        !razorpayPaymentId ||
        !razorpaySignature
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Razorpay payment details are required"

        });

    }


    const order = new Order({

        productId:
            String(productId),

        productName:
            String(productName),

        quantity:
            Number(quantity),

        price:
            Number(price),

        totalPrice:
            Number(totalPrice),

        customerName:
            String(customerName),

        customerEmail:
            String(customerEmail).toLowerCase(),

        customerPhone:
            String(customerPhone),

        address:
            String(address),

        paymentMethod:
            "ONLINE",

        paymentStatus:
            "Paid",

        orderStatus:
            "Confirmed",

        razorpayOrderId:
            String(razorpayOrderId),

        razorpayPaymentId:
            String(razorpayPaymentId),

        razorpaySignature:
            String(razorpaySignature)

    });


    const savedOrder =
        await order.save();


    return res.status(201).json({

        success: true,

        message:
            "Online order saved successfully",

        order:
            savedOrder

    });

}

catch (error) {

    console.error(
        "SAVE ONLINE ORDER ERROR:"
    );

    console.error(error);


    return res.status(500).json({

        success: false,

        message:
            "Failed to save online order",

        error:
            error.message

    });

}

});

// ======================================================
// GET ALL ORDERS FOR ADMIN
// GET /api/orders/admin/all-orders
// ======================================================

router.get("/admin/all-orders", async (req, res) => {

try {

    const orders =
        await Order.find()
            .sort({
                createdAt: -1
            });


    return res.status(200).json({

        success: true,

        count:
            orders.length,

        orders:
            orders

    });

}

catch (error) {

    console.error(
        "GET ALL ORDERS ERROR:"
    );

    console.error(error);


    return res.status(500).json({

        success: false,

        message:
            "Failed to fetch orders",

        error:
            error.message

    });

}

});

// ======================================================
// GET SINGLE ORDER
// GET /api/orders/:id
// ======================================================

router.get("/:id", async (req, res) => {

```
try {

    const order =
        await Order.findById(
            req.params.id
        );


    if (!order) {

        return res.status(404).json({

            success: false,

            message:
                "Order not found"

        });

    }


    return res.status(200).json({

        success: true,

        order:
            order

    });

}

catch (error) {

    console.error(
        "GET SINGLE ORDER ERROR:"
    );

    console.error(error);


    return res.status(500).json({

        success: false,

        message:
            "Failed to fetch order",

        error:
            error.message

    });

}

});

// ======================================================
// UPDATE PAYMENT STATUS
// PUT /api/orders/:id/payment-status
// ======================================================

router.put("/:id/payment-status", async (req, res) => {

```
try {

    const {
        paymentStatus
    } = req.body;


    const allowedStatuses = [
        "Pending",
        "Paid",
        "Failed",
        "Refunded"
    ];


    if (!paymentStatus) {

        return res.status(400).json({

            success: false,

            message:
                "Payment status is required"

        });

    }


    if (
        !allowedStatuses.includes(
            paymentStatus
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid payment status"

        });

    }


    const order =
        await Order.findById(
            req.params.id
        );


    if (!order) {

        return res.status(404).json({

            success: false,

            message:
                "Order not found"

        });

    }


    order.paymentStatus =
        paymentStatus;


    await order.save();


    return res.status(200).json({

        success: true,

        message:
            "Payment status updated successfully",

        order:
            order

    });

}

catch (error) {

    console.error(
        "UPDATE PAYMENT STATUS ERROR:"
    );

    console.error(error);


    return res.status(500).json({

        success: false,

        message:
            "Failed to update payment status",

        error:
            error.message

    });

}

});

// ======================================================
// UPDATE ORDER STATUS
// PUT /api/orders/:id/order-status
// ======================================================

router.put("/:id/order-status", async (req, res) => {

try {

    const {
        orderStatus
    } = req.body;


    const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];


    if (!orderStatus) {

        return res.status(400).json({

            success: false,

            message:
                "Order status is required"

        });

    }


    if (
        !allowedStatuses.includes(
            orderStatus
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid order status"

        });

    }


    const mongoose =
        require("mongoose");


    if (
        !mongoose.Types.ObjectId.isValid(
            req.params.id
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid order ID"

        });

    }


    const order =
        await Order.findById(
            req.params.id
        );


    if (!order) {

        return res.status(404).json({

            success: false,

            message:
                "Order not found"

        });

    }


    order.orderStatus =
        orderStatus;


    await order.save();


    return res.status(200).json({

        success: true,

        message:
            "Order status updated successfully",

        order:
            order

    });

}

catch (error) {

    console.error(
        "UPDATE ORDER STATUS ERROR:"
    );

    console.error(error);


    return res.status(500).json({

        success: false,

        message:
            "Failed to update order status",

        error:
            error.message

    });

}

});

// ======================================================
// DELETE ORDER
// DELETE /api/orders/:id
// ======================================================

router.delete("/:id", async (req, res) => {

try {

    const order =
        await Order.findByIdAndDelete(
            req.params.id
        );


    if (!order) {

        return res.status(404).json({

            success: false,

            message:
                "Order not found"

        });

    }


    return res.status(200).json({

        success: true,

        message:
            "Order deleted successfully"

    });

}

catch (error) {

    console.error(
        "DELETE ORDER ERROR:"
    );

    console.error(error);


    return res.status(500).json({

        success: false,

        message:
            "Failed to delete order",

        error:
            error.message

    });

}

});

module.exports = router;
