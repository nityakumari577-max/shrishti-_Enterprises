const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dns = require("dns");

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
console.log("REQUEST:", req.method, req.url);
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
// ORDER + RAZORPAY ROUTES
// ==========================================

app.use(
"/api",
orderRoutes
);

// ==========================================
// GOOGLE LOGIN TEST ROUTE
// ==========================================

app.post(
"/api/users/google",
async (req, res) => {
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
}

);

// ==========================================
// ROOT ROUTE
// ==========================================

app.get("/", (req, res) => {
res.send(
"Medical equipment API is running"
);
});

// ==========================================
// TEST PAYMENT ROUTE
// ==========================================

app.get(
"/api/test-payment-route",
(req, res) => {
res.json({
success: true,
message: "Payment route is working"
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

app.listen(PORT, () => {
console.log(
`Server running on port ${PORT}`
);
});
