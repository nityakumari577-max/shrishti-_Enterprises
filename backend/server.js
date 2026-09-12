const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const dns = require("dns");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Load Environment Variables
dotenv.config({ path: __dirname + "/.env" });

// Configure Custom DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Connect to MongoDB Database
connectDB();

// CORS Configuration (Allow frontend requests from Live Server or Localhost)
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5501",
      "http://localhost:5501",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
    ],
    credentials: true,
  })
);

// Body Parser Middleware
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// Initialize Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ----------------------------------------------------
// RAZORPAY PAYMENT ROUTES
// ----------------------------------------------------

// 2. Verify Razorpay Payment Signature
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature verification failed",
      });
    }
  } catch (error) {
    console.error("Signature Verification Error:", error);
    res.status(500).json({ success: false, message: "Payment verification error" });
  }
});

// ----------------------------------------------------
// EXISTING API ROUTES
// ----------------------------------------------------
app.use("/api/equipment", require("./routes/equipmentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Medical equipment API is running");
});

app.post("/api/users/google", async (req, res) => {
  const { credential } = req.body;
  res.json({ token: "your-jwt-token", user: { name: "Customer Name" } });
});
// Add this line with your other route imports
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api", require("./routes/paymentRoutes"));
// Start 
app.use("/api", orderRoutes);
app.get("/api/test-payment-route", (req, res) => {
  res.json({
    success: true,
    message: "Payment route is working"
  });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});