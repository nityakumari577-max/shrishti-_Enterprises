const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dns = require("dns");
const Razorpay = require("razorpay");

// ==========================================
// LOAD ENVIRONMENT VARIABLES FIRST
// ==========================================

dotenv.config({
    path: __dirname + "/.env"
});

// ==========================================
// CUSTOM DNS
// ==========================================

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

// ==========================================
// DATABASE
// ==========================================

const connectDB = require("./config/db");

// ==========================================
// ROUTES
// ==========================================

const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/OrderRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// ==========================================
// EXPRESS APP
// ==========================================

const app = express();

// ==========================================
// DATABASE CONNECTION
// ==========================================

connectDB();

// ==========================================
// CORS
// ==========================================

app.use(
    cors({
        origin: [
            "http://127.0.0.1:5501",
            "http://localhost:5501",
            "http://127.0.0.1:5500",
            "http://localhost:5500",
            "https://shrishti-enterprises-1.onrender.com",
            "https://shrishti-enterprises.onrender.com"
        ],
        credentials: true
    })
);

// ==========================================
// BODY PARSER
// ==========================================

app.use(express.json());

// ==========================================
// REQUEST LOGGER
// ==========================================

app.use((req, res, next) => {

    console.log(
        "REQUEST:",
        req.method,
        req.url
    );

    next();

});

// ==========================================
// CHECK RAZORPAY ENV VARIABLES
// ==========================================

console.log(
    "RAZORPAY KEY ID:",
    process.env.RAZORPAY_KEY_ID
        ? "FOUND"
        : "MISSING"
);

console.log(
    "RAZORPAY KEY SECRET:",
    process.env.RAZORPAY_KEY_SECRET
        ? "FOUND"
        : "MISSING"
);

// ==========================================
// RAZORPAY INSTANCE
// ==========================================
//
// IMPORTANT:
// We create Razorpay only when both keys exist.
// This prevents the whole server from crashing
// when Render environment variables are missing.
// ==========================================

let razorpay = null;

if (
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET
) {

    razorpay = new Razorpay({

        key_id:
            process.env.RAZORPAY_KEY_ID,

        key_secret:
            process.env.RAZORPAY_KEY_SECRET

    });

    console.log(
        "RAZORPAY INITIALIZED SUCCESSFULLY"
    );

} else {

    console.log(
        "RAZORPAY NOT INITIALIZED - ENV VARIABLES MISSING"
    );

}

// ==========================================
// API ROUTES
// ==========================================

app.use(
    "/api/equipment",
    equipmentRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/users",
    userRoutes
);

// ==========================================
// PAYMENT ROUTES
// ==========================================

app.use(
    "/api",
    paymentRoutes
);

// ==========================================
// ORDER ROUTES
// ==========================================

app.use(
    "/api/orders",
    orderRoutes
);

// ==========================================
// CREATE RAZORPAY ORDER
// POST /api/create-order
// ==========================================
//
// This is the route your order.html is currently
// trying to call.
//
// Example frontend request:
//
// POST /api/create-order
//
// {
//     "amount": 1900
// }
//
// Amount is received in RUPEES.
// Razorpay requires PAISE,
// so we multiply by 100.
// ==========================================

app.post(
    "/api/create-order",
    async (req, res) => {

        try {

            console.log(
                "================================="
            );

            console.log(
                "RAZORPAY CREATE ORDER REQUEST"
            );

            console.log(
                req.body
            );

            console.log(
                "================================="
            );

            // ======================================
            // CHECK RAZORPAY
            // ======================================

            if (!razorpay) {

                console.error(
                    "RAZORPAY IS NOT INITIALIZED"
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Razorpay configuration is missing. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Render Environment Variables."

                });

            }

            // ======================================
            // GET AMOUNT
            // ======================================

            const { amount } = req.body;

            // ======================================
            // VALIDATE AMOUNT
            // ======================================

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

            const numericAmount =
                Number(amount);

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

            // ======================================
            // CONVERT RUPEES TO PAISE
            // ======================================

            const amountInPaise =
                Math.round(
                    numericAmount * 100
                );

            // ======================================
            // CREATE RAZORPAY ORDER
            // ======================================

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
                "Amount in rupees:",
                numericAmount
            );

            console.log(
                "Amount in paise:",
                amountInPaise
            );

            const razorpayOrder =
                await razorpay.orders.create(
                    options
                );

            console.log(
                "================================="
            );

            console.log(
                "RAZORPAY ORDER CREATED"
            );

            console.log(
                razorpayOrder
            );

            console.log(
                "================================="
            );

            // ======================================
            // SEND RESPONSE
            // ======================================

            return res.status(200).json({

                success: true,

                message:
                    "Razorpay order created successfully",

                order: razorpayOrder

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
                "Full error:",
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

    }
);

// ==========================================
// GOOGLE LOGIN TEST ROUTE
// ==========================================

app.post(
    "/api/users/google",
    async (req, res) => {

        try {

            const {
                credential
            } = req.body;

            console.log(
                "Google credential received:",
                !!credential
            );

            return res.json({

                token:
                    "your-jwt-token",

                user: {

                    name:
                        "Customer Name"

                }

            });

        }

        catch (error) {

            console.error(
                "Google Login Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Google login failed"

            });

        }

    }
);

// ==========================================
// ROOT ROUTE
// ==========================================

app.get(
    "/",
    (req, res) => {

        res.send(
            "Medical equipment API is running"
        );

    }
);

// ==========================================
// TEST PAYMENT ROUTE
// ==========================================

app.get(
    "/api/test-payment-route",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Payment route is working"

        });

    }
);

// ==========================================
// TEST RAZORPAY CREATE ROUTE
// ==========================================
//
// GET /api/create-order-test
//
// This does NOT create a payment.
// It only confirms that the backend has the
// Razorpay route available.
// ==========================================

app.get(
    "/api/create-order-test",
    (req, res) => {

        return res.json({

            success: true,

            razorpayConfigured:
                !!razorpay,

            message:
                razorpay
                    ? "Razorpay is configured and create-order route is ready"
                    : "Razorpay route exists but environment variables are missing"

        });

    }
);

// ==========================================
// 404 JSON HANDLER
// ==========================================
//
// This prevents unknown API requests from returning
// an HTML page. Your frontend will therefore receive
// JSON instead of:
//
// <!DOCTYPE html>
//
// ==========================================

app.use(
    "/api",
    (req, res) => {

        return res.status(404).json({

            success: false,

            message:
                "API route not found",

            method:
                req.method,

            path:
                req.originalUrl

        });

    }
);

// ==========================================
// PORT
// ==========================================

const PORT =
    process.env.PORT || 5000;

// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);