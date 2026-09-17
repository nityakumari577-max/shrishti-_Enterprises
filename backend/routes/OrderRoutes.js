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
// SAVE COD ORDER
// POST /api/orders/save-order
// ======================================================

router.post("/save-order", async (req, res) => {

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


        // ==========================================
        // VALIDATION
        // ==========================================

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


        // ==========================================
        // ONLY COD ORDERS
        // ==========================================

        if (paymentMethod !== "COD") {

            return res.status(400).json({
                success: false,
                message: "This route is only for Cash on Delivery orders"
            });

        }


        // ==========================================
        // CREATE COD ORDER
        // ==========================================

        const order = new Order({

            productId: String(productId),

            productName: String(productName),

            quantity: Number(quantity),

            price: Number(price),

            totalPrice: Number(totalPrice),

            customerName: String(customerName),

            customerEmail: String(customerEmail).toLowerCase(),

            customerPhone: String(customerPhone),

            address: String(address),

            paymentMethod: "COD",

            // IMPORTANT
            // COD is NOT paid when order is created

            paymentStatus: "Pending",

            orderStatus: "Pending",

            razorpayOrderId: null,

            razorpayPaymentId: null,

            razorpaySignature: null

        });


        const savedOrder = await order.save();


        console.log("COD ORDER SAVED:");
        console.log(savedOrder);


        return res.status(201).json({

            success: true,

            message: "COD order saved successfully",

            order: savedOrder

        });

    }

    catch (error) {

        console.error("SAVE COD ORDER ERROR:");
        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to save COD order",

            error: error.message

        });

    }

});


// ======================================================
// SAVE ONLINE / RAZORPAY ORDER
// POST /api/orders/save-online-order
// ======================================================

router.post("/save-online-order", async (req, res) => {

    try {

        console.log("=================================");
        console.log("ONLINE ORDER REQUEST");
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
            paymentMethod,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!productId ||
            !productName ||
            !quantity ||
            price === undefined ||
            totalPrice === undefined ||
            !customerName ||
            !customerEmail ||
            !customerPhone ||
            !address) {

            return res.status(400).json({

                success: false,

                message: "All order details are required"

            });

        }


        if (paymentMethod !== "ONLINE") {

            return res.status(400).json({

                success: false,

                message: "Payment method must be ONLINE"

            });

        }


        // ==========================================
        // CREATE ONLINE ORDER
        // ==========================================

        const order = new Order({

            productId: String(productId),

            productName: String(productName),

            quantity: Number(quantity),

            price: Number(price),

            totalPrice: Number(totalPrice),

            customerName: String(customerName),

            customerEmail: String(customerEmail).toLowerCase(),

            customerPhone: String(customerPhone),

            address: String(address),

            paymentMethod: "ONLINE",

            paymentStatus: "Paid",

            orderStatus: "Confirmed",

            razorpayOrderId:
                razorpayOrderId || null,

            razorpayPaymentId:
                razorpayPaymentId || null,

            razorpaySignature:
                razorpaySignature || null

        });


        const savedOrder =
            await order.save();


        return res.status(201).json({

            success: true,

            message: "Online order saved successfully",

            order: savedOrder

        });

    }

    catch (error) {

        console.error("SAVE ONLINE ORDER ERROR:");
        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to save online order",

            error: error.message

        });

    }

});


// ======================================================
// GET ALL ORDERS FOR ADMIN
// GET /api/orders/admin/all-orders
// ======================================================

router.get("/admin/all-orders", async (req, res) => {

    try {

        const orders = await Order.find()
            .sort({ createdAt: -1 });


        return res.status(200).json({

            success: true,

            count: orders.length,

            orders: orders

        });

    }

    catch (error) {

        console.error("GET ALL ORDERS ERROR:");
        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch orders",

            error: error.message

        });

    }

});


// ======================================================
// GET SINGLE ORDER
// GET /api/orders/:id
// ======================================================

router.get("/:id", async (req, res) => {

    try {

        const order =
            await Order.findById(req.params.id);


        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found"

            });

        }


        return res.status(200).json({

            success: true,

            order: order

        });

    }

    catch (error) {

        console.error("GET SINGLE ORDER ERROR:");
        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch order",

            error: error.message

        });

    }

});


// ======================================================
// UPDATE PAYMENT STATUS
// PUT /api/orders/:id/payment-status
// ======================================================

router.put("/:id/payment-status", async (req, res) => {

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

                message: "Payment status is required"

            });

        }


        if (!allowedStatuses.includes(paymentStatus)) {

            return res.status(400).json({

                success: false,

                message: "Invalid payment status"

            });

        }


        const order =
            await Order.findById(req.params.id);


        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found"

            });

        }


        // ==========================================
        // UPDATE PAYMENT STATUS
        // ==========================================

        order.paymentStatus =
            paymentStatus;


        await order.save();


        return res.status(200).json({

            success: true,

            message: "Payment status updated successfully",

            order: order

        });

    }

    catch (error) {

        console.error("UPDATE PAYMENT STATUS ERROR:");
        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to update payment status",

            error: error.message

        });

    }

});

// ==========================================
// UPDATE ORDER STATUS
// PUT /api/orders/:id/order-status
// ==========================================

router.put("/:id/order-status", async (req, res) => {
    try {

        console.log("=================================");
        console.log("UPDATE ORDER STATUS");
        console.log("Order ID:", req.params.id);
        console.log("Request Body:", req.body);
        console.log("=================================");

        const { orderStatus } = req.body;

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
                message: "Order status is required"
            });
        }

        if (!allowedStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const mongoose = require("mongoose");

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        console.log("Payment Method:", order.paymentMethod);
        console.log("Payment Status:", order.paymentStatus);
        console.log("Current Order Status:", order.orderStatus);
        console.log("New Order Status:", orderStatus);

        // ==========================================
        // ONLY UPDATE ORDER STATUS
        // ==========================================

        order.orderStatus = orderStatus;

        /*
         * IMPORTANT:
         * Do NOT automatically modify paymentStatus here.
         *
         * Razorpay ONLINE orders already have:
         * paymentStatus = Paid
         *
         * COD orders can also have:
         * paymentStatus = Paid
         *
         * Delivered should only change orderStatus.
         */

        await order.save();

        console.log("ORDER STATUS UPDATED SUCCESSFULLY");

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order: order
        });

    } catch (error) {

        console.error("=================================");
        console.error("UPDATE ORDER STATUS ERROR");
        console.error("=================================");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        console.error("Error Code:", error.code);
        console.error(error.stack);

        return res.status(500).json({
            success: false,
            message: "Failed to update order status",
            error: error.message
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

                message: "Order not found"

            });

        }


        return res.status(200).json({

            success: true,

            message: "Order deleted successfully"

        });

    }

    catch (error) {

        console.error("DELETE ORDER ERROR:");
        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to delete order",

            error: error.message

        });

    }

});


module.exports = router;