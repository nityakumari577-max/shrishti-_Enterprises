const express = require("express");
const Review = require("../models/review");

const router = express.Router();

// ==========================================
// GET REVIEWS FOR A PRODUCT
// ==========================================

router.get("/:productId", async (req, res) => {
try {

    const { productId } = req.params;

    const reviews = await Review.find({
        productId: productId
    })
    .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: reviews.length,
        reviews: reviews
    });

} catch (error) {

    console.error("GET REVIEWS ERROR:", error);

    res.status(500).json({
        success: false,
        message: "Unable to load reviews"
    });

}
});
// ==========================================
// ADD REVIEW - VERIFIED PURCHASE ONLY
// ==========================================

const Order = require("../models/Order");

router.post("/", async (req, res) => {
try {

    const {
        productId,
        productName,
        customerId,
        customerName,
        customerEmail,
        rating,
        comment
    } = req.body;


    // ==========================================
    // CHECK REQUIRED FIELDS
    // ==========================================

    if (
        !productId ||
        !productName ||
        !customerId ||
        !customerName ||
        !customerEmail ||
        !rating ||
        !comment
    ) {

        return res.status(400).json({
            success: false,
            message: "All review fields are required"
        });

    }


    // ==========================================
    // CHECK RATING
    // ==========================================

    const numericRating =
        Number(rating);

    if (
        numericRating < 1 ||
        numericRating > 5
    ) {

        return res.status(400).json({
            success: false,
            message: "Rating must be between 1 and 5"
        });

    }


    // ==========================================
    // CHECK WHETHER CUSTOMER BOUGHT PRODUCT
    // ==========================================

    const deliveredOrder =
        await Order.findOne({

            productId: productId,

            customerEmail:
                customerEmail
                    .trim()
                    .toLowerCase(),

            orderStatus: "Delivered"

        });


    // ==========================================
    // CUSTOMER DID NOT BUY PRODUCT
    // ==========================================

    if (!deliveredOrder) {

        return res.status(403).json({

            success: false,

            message:
                "You can review this product only after purchasing and receiving it."

        });

    }


    // ==========================================
    // CHECK IF CUSTOMER ALREADY REVIEWED
    // ==========================================

    const existingReview =
        await Review.findOne({

            productId: productId,

            customerEmail:
                customerEmail
                    .trim()
                    .toLowerCase()

        });


    if (existingReview) {

        return res.status(409).json({

            success: false,

            message:
                "You have already reviewed this product."

        });

    }


    // ==========================================
    // CREATE REVIEW
    // ==========================================

    const review =
        new Review({

            productId:
                productId,

            productName:
                productName,

            customerId:
                customerId,

            customerName:
                customerName,

            customerEmail:
                customerEmail
                    .trim()
                    .toLowerCase(),

            rating:
                numericRating,

            comment:
                comment.trim()

        });


    // ==========================================
    // SAVE REVIEW
    // ==========================================

    await review.save();


    // ==========================================
    // SUCCESS
    // ==========================================

    res.status(201).json({

        success: true,

        message:
            "Review submitted successfully",

        review:
            review

    });


} catch (error) {

    console.error(
        "ADD VERIFIED REVIEW ERROR:",
        error
    );


    res.status(500).json({

        success: false,

        message:
            "Unable to submit review"

    });

}

});


module.exports = router;
