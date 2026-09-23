const express = require("express");
const { loginAdmin,
    changeAdminPassword
 } = require("../controllers/adminController");

const router = express.Router();

router.post("/login", loginAdmin);
router.post(
    "/change-password",
    changeAdminPassword
);


module.exports = router;