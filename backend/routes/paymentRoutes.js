
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();

// ======================================================
// CREATE RAZORPAY ORDER
// POST /api/create-order
// ======================================================

router.post("/create-order", async (req, res) => {

    try {

        console.log("=================================");
        console.log("RAZORPAY CREATE ORDER REQUEST");
        console.log("Request body:", req.body);
        console.log("=================================");

        // ==================================================
        // CHECK RAZORPAY ENVIRONMENT VARIABLES
        // ==================================================

        if (
            !process.env.RAZORPAY_KEY_ID ||
            !process.env.RAZORPAY_KEY_SECRET
        ) {

            console.error(
                "RAZORPAY ENVIRONMENT VARIABLES ARE MISSING"
            );

            return res.status(500).json({

                success: false,

                message:
                    "Razorpay configuration is missing"

            });

        }

        // ==================================================
        // GET AMOUNT
        // ==================================================

        const { amount } = req.body;

        if (
            amount === undefined ||
            amount === null ||
            amount === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Amount is required"

            });

        }

        const numericAmount = Number(amount);

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid amount"

            });

        }

        // ==================================================
        // CREATE RAZORPAY INSTANCE
        // ==================================================

        const razorpay = new Razorpay({

            key_id:
                process.env.RAZORPAY_KEY_ID,

            key_secret:
                process.env.RAZORPAY_KEY_SECRET

        });

        // ==================================================
        // RAZORPAY AMOUNT
        // ==================================================

        const amountInPaise =
            Math.round(
                numericAmount * 100
            );

        // ==================================================
        // RAZORPAY ORDER OPTIONS
        // ==================================================

        const options = {

            amount:
                amountInPaise,

            currency:
                "INR",

            receipt:
                "receipt_" +
                Date.now(),

            notes: {

                source:
                    "Shrishti Enterprises"

            }

        };

        console.log(
            "Creating Razorpay order..."
        );

        console.log(
            "Amount:",
            numericAmount,
            "INR"
        );

        console.log(
            "Amount in paise:",
            amountInPaise
        );

        // ==================================================
        // CREATE ORDER
        // ==================================================

        const razorpayOrder =
            await razorpay.orders.create(
                options
            );

        console.log(
            "================================="
        );

        console.log(
            "RAZORPAY ORDER CREATED SUCCESSFULLY"
        );

        console.log(
            "Razorpay Order ID:",
            razorpayOrder.id
        );

        console.log(
            "================================="
        );

        // ==================================================
        // SEND RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Razorpay order created successfully",

            order:
                razorpayOrder

        });

    }

    catch (error) {

        console.error(
            "================================="
        );

        console.error(
            "RAZORPAY CREATE ORDER ERROR"
        );

        console.error(
            "================================="
        );

        console.error(
            "Error message:",
            error.message
        );

        console.error(
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to create Razorpay order",

            error:
                error.message

        });

    }

});

// ======================================================
// TEST PAYMENT ROUTE
// GET /api/test-payment-route
// ======================================================

router.get(
    "/test-payment-route",
    (req, res) => {

        return res.json({

            success: true,

            message:
                "Payment route is working"

        });

    }
);

// ======================================================
// VERIFY RAZORPAY PAYMENT
// POST /api/verify-payment
// ======================================================

router.post("/verify-payment", async (req, res) => {

    try {

        console.log("=================================");
        console.log("VERIFY RAZORPAY PAYMENT");
        console.log("Request Body:");
        console.log(req.body);
        console.log("=================================");


        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message: "Payment verification details are required"

            });

        }


        // ==========================================
        // CREATE SIGNATURE
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


        console.log("Generated Signature:", generatedSignature);
        console.log("Received Signature:", razorpay_signature);


        // ==========================================
        // VERIFY SIGNATURE
        // ==========================================

        if (generatedSignature !== razorpay_signature) {

            console.log("RAZORPAY SIGNATURE INVALID");

            return res.status(400).json({

                success: false,

                verified: false,

                message: "Payment verification failed"

            });

        }


        // ==========================================
        // PAYMENT VERIFIED
        // ==========================================

        console.log("RAZORPAY PAYMENT VERIFIED SUCCESSFULLY");


        return res.status(200).json({

            success: true,

            verified: true,

            message: "Payment verified successfully",

            razorpayOrderId: razorpay_order_id,

            razorpayPaymentId: razorpay_payment_id,

            razorpaySignature: razorpay_signature

        });


    } catch (error) {

        console.error("VERIFY PAYMENT ERROR:");
        console.error(error);

        return res.status(500).json({

            success: false,

            verified: false,

            message: "Payment verification failed",

            error: error.message

        });

    }

});


// ======================================================
// TEST CREATE ORDER ROUTE
// GET /api/create-order-test
// ======================================================

router.get(
    "/create-order-test",
    (req, res) => {

        return res.json({

            success: true,

            razorpayConfigured:
                !!(
                    process.env.RAZORPAY_KEY_ID &&
                    process.env.RAZORPAY_KEY_SECRET
                ),

            message:
                "Create order route is available"

        });

    }
);

module.exports = router;