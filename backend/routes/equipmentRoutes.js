const express = require("express");
const Equipment = require("../models/equipment");

console.log("EQUIPMENT ROUTES LOADED");

const {
    addEquipment,
    getEquipment,
    deleteEquipment
} = require("../controllers/equipmentController");

const upload = require("../middleware/upload");

const router = express.Router();

router.post("/", upload.single("image"), addEquipment);

router.get("/", getEquipment);
router.get("/:id", async (req, res) => {
    try {

        const equipment = await Equipment.findById(req.params.id);

        if (!equipment) {
            return res.status(404).json({
                message: "Equipment not found"
            });
        }

        res.status(200).json(equipment);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch equipment",
            error: error.message
        });

    }
});
router.delete("/test", (req, res) => {
    res.json({
        message: "DELETE route is working"
    });
});

router.delete("/:id", deleteEquipment);


module.exports = router;