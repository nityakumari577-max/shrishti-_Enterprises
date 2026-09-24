const express = require("express");
const jwt = require("jsonwebtoken");

const Review = require("../models/review");
const Order = require("../models/Order");

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

        console.error(
            "GET REVIEWS ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to load reviews"

        });

    }

});


// ==========================================
// ADD REVIEW - VERIFIED PURCHASE ONLY
// ==========================================

router.post("/", async (req, res) => {

    try {

        // ==========================================
        // GET TOKEN FROM AUTHORIZATION HEADER
        // ==========================================

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Please login to submit a review."

            });

        }


        // ==========================================
        // EXTRACT TOKEN
        // ==========================================

        const token =
            authHeader.split(" ")[1];


        // ==========================================
        // VERIFY CUSTOMER JWT
        // ==========================================

        let decoded;

        try {

            decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

        } catch (error) {

            console.error(
                "REVIEW TOKEN ERROR:",
                error.message
            );

            return res.status(401).json({

                success: false,

                message:
                    "Your login session has expired. Please login again."

            });

        }


        // ==========================================
        // CHECK CUSTOMER ROLE
        // ==========================================

        if (
            !decoded ||
            decoded.role !== "customer"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only customers can submit reviews."

            });

        }


        // ==========================================
        // GET REVIEW DATA
        // ==========================================

        const {
            productId,
            productName,
            rating,
            comment
        } = req.body;


        // ==========================================
        // CUSTOMER INFORMATION
        // FROM VERIFIED JWT
        // ==========================================

        const customerId =
            decoded.id;

        const customerName =
            decoded.name;

        const customerEmail =
            decoded.email
                ?.trim()
                .toLowerCase();


        // ==========================================
        // CHECK REQUIRED FIELDS
        // ==========================================

        if (
            !productId ||
            !productName ||
            !rating ||
            !comment
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Product, rating and comment are required."

            });

        }


        // ==========================================
        // CHECK JWT CUSTOMER DATA
        // ==========================================

        if (
            !customerId ||
            !customerName ||
            !customerEmail
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Customer information is missing. Please login again."

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

                message:
                    "Rating must be between 1 and 5"

            });

        }


        // ==========================================
        // CHECK COMMENT
        // ==========================================

        const cleanComment =
            comment.trim();


        if (!cleanComment) {

            return res.status(400).json({

                success: false,

                message:
                    "Review comment cannot be empty."

            });

        }


        // ==========================================
        // CHECK WHETHER CUSTOMER BOUGHT PRODUCT
        // AND RECEIVED IT
        // ==========================================

        const deliveredOrder =
            await Order.findOne({

                productId: productId,

                customerEmail:
                    customerEmail,

                orderStatus:
                    "Delivered"

            });


        // ==========================================
        // CUSTOMER DID NOT BUY / RECEIVE PRODUCT
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
                    customerEmail,

                rating:
                    numericRating,

                comment:
                    cleanComment

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