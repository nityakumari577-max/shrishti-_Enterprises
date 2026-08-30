const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);


const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const Admin = require("./models/admin");

dotenv.config({ path: __dirname + "/.env" });

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const username = "admin";
        const password = "admin123";

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit();
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        await Admin.create({
            username,
            password: hashedPassword
        });

        console.log("Admin created successfully");
        console.log("Username:", username);
        console.log("Password:", password);

        process.exit();

    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();