const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
{
productId: {
type: String,
required: true,
trim: true
},

    productName: {
        type: String,
        required: true,
        trim: true
    },

    customerId: {
        type: String,
        required: true,
        trim: true
    },

    customerName: {
        type: String,
        required: true,
        trim: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 1000
    }
},
{
    timestamps: true
}

);

module.exports = mongoose.model("Review", reviewSchema);
