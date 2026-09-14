const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
customerName: {
type: String,
required: true,
trim: true
},
customerEmail: {
  type: String,
  required: true,
  trim: true,
  lowercase: true
},

customerPhone: {
  type: String,
  required: true,
  trim: true
},

address: {
  type: String,
  required: true,
  trim: true
},

productId: {
  type: String,
  required: true
},

productName: {
  type: String,
  required: true,
  trim: true
},

quantity: {
  type: Number,
  required: true,
  min: 1
},

price: {
  type: Number,
  required: true,
  min: 0
},

totalPrice: {
  type: Number,
  required: true,
  min: 0
},

paymentMethod: {
  type: String,
  enum: ["ONLINE", "COD"],
  default: "ONLINE"
},

paymentStatus: {
  type: String,
  enum: ["PENDING", "PAID", "FAILED"],
  default: "PENDING"
},

orderStatus: {
  type: String,
  enum: [
    "PLACED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED"
  ],
  default: "PLACED"
},

razorpayOrderId: {
  type: String,
  default: null
},

razorpayPaymentId: {
  type: String,
  default: null
},

razorpaySignature: {
  type: String,
  default: null
}

},
{
timestamps: true
}
);

module.exports = mongoose.model("Order", orderSchema);
