
const express = require("express");

const router = express.Router();

// ==========================================
// TEST PAYMENT ROUTE
// ==========================================

router.get("/test-payment-route", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Payment route is working"
    });
});

module.exports = router;
