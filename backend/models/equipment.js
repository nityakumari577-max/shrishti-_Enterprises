const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        price: {
            type: String,
            default: "Contact for Price"
        },

        image: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Equipment", equipmentSchema);