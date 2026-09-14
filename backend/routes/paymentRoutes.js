const express = require("express");

const router = express.Router();

router.get("/test-payment-route", (req, res) => {
res.json({
success: true,
message: "Payment route is working"
});
});

module.exports = router;