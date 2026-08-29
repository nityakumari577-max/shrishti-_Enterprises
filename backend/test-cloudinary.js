require("dotenv").config();

const cloudinary = require("./config/cloudinary");

console.log("Cloudinary configuration loaded");
console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);