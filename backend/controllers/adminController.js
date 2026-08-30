const Admin = require("../models/admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const token = jwt.sign(
            {
                id: admin._id,
                username: admin.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

module.exports = {
    loginAdmin
};