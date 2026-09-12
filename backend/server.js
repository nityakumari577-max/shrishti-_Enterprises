const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const dns = require("dns");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/OrderRoutes");

const app = express();

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config({
  path: __dirname + "/.env"
});

// =====================================================
// CUSTOM DNS
// =====================================================

dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);

// =====================================================
// CONNECT TO MONGODB
// =====================================================

connectDB();

// =====================================================
// CORS CONFIGURATION
// =====================================================

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5501",
      "http://localhost:5501",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://shrishti-enterprises.onrender.com"
    ],
    credentials: true
  })
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json());

// =====================================================
// REQUEST LOGGER
// =====================================================

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// =====================================================
// RAZORPAY INSTANCE
// =====================================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// =====================================================
// RAZORPAY PAYMENT VERIFICATION
// =====================================================

app.post("/api/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
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
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid payment signature"
    });

  } catch (error) {

    console.error(
      "Signature Verification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Payment verification error"
    });
  }
});

// =====================================================
// EQUIPMENT ROUTES
// =====================================================

app.use(
  "/api/equipment",
  require("./routes/equipmentRoutes")
);

// =====================================================
// ADMIN ROUTES
// =====================================================

app.use(
  "/api/admin",
  require("./routes/adminRoutes")
);

// =====================================================
// CUSTOMER USER ROUTES
// =====================================================

app.use(
  "/api/users",
  userRoutes
);

// =====================================================
// PAYMENT ROUTES
// =====================================================

app.use(
  "/api",
  require("./routes/paymentRoutes")
);

// =====================================================
// ORDER ROUTES
// =====================================================
//
// routes/OrderRoutes.js
//
// Example:
// router.post("/create-order")
// becomes:
// POST /api/create-order
//
// =====================================================

app.use(
  "/api",
  orderRoutes
);

// =====================================================
// GOOGLE LOGIN
// =====================================================

app.post("/api/users/google", async (req, res) => {

  try {

    const { credential } = req.body;

    console.log(
      "Google credential received:",
      !!credential
    );

    return res.json({
      token: "your-jwt-token",
      user: {
        name: "Customer Name"
      }
    });

  } catch (error) {

    console.error(
      "Google Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Google login failed"
    });
  }
});

// =====================================================
// ROOT ROUTE
// =====================================================

app.get("/", (req, res) => {

  res.send(
    "Medical equipment API is running"
  );

});

// =====================================================
// PAYMENT TEST ROUTE
// =====================================================

app.get(
  "/api/test-payment-route",
  (req, res) => {

    res.json({
      success: true,
      message: "Payment route is working"
    });

  }
);

// =====================================================
// SERVER START
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});