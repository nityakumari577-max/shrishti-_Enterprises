const express= require("express");
const cors = require("cors");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

dotenv.config({ path: __dirname + "/.env" });
connectDB();
const app = express();
app.use(cors()); 
app.use(express.json());
app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.url);
    next();
});

app.use("/api/equipment", require("./routes/equipmentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/users", userRoutes);
app.get("/",(req,res)=>{
    res.send("medical equipment api is running");
});



 const PORT = process.env.PORT || 5000;
 
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
});