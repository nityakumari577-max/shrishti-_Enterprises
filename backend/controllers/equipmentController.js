const cloudinary = require("../config/cloudinary");
const Equipment = require("../models/equipment");
const streamifier = require("streamifier");

const addEquipment = async (req, res) => {
    try {
        const {
            name,
            category,
            description,
            price
        } = req.body;

        if (!name || !category || !description) {
            return res.status(400).json({
                message: "Name, category and description are required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Equipment image is required"
            });
        }

        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "medical-equipment"
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );

                streamifier
                    .createReadStream(req.file.buffer)
                    .pipe(stream);
            });
        };

        const result = await uploadToCloudinary();

        const equipment = await Equipment.create({
            name,
            category,
            description,
            price: price || "Contact for Price",
            image: result.secure_url
        });

        res.status(201).json({
            message: "Equipment added successfully",
            equipment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to add equipment",
            error: error.message
        });
    }
};

const getEquipment = async (req, res) => {
    try {
        const { category } = req.query;

        let equipment;

        if (category) {
            equipment = await Equipment
                .find({ category: category })
                .sort({ createdAt: -1 });
        } else {
            equipment = await Equipment
                .find()
                .sort({ createdAt: -1 });
        }

        res.status(200).json(equipment);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch equipment",
            error: error.message
        });
    }
};
const deleteEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findByIdAndDelete(req.params.id);

        if (!equipment) {
            return res.status(404).json({
                message: "Equipment not found"
            });
        }

        res.status(200).json({
            message: "Equipment deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete equipment",
            error: error.message
        });
    }
};
const updateEquipment = async (req, res) => {
    try {
        const { name, category, description, price } = req.body;

        const equipment = await Equipment.findById(req.params.id);

        if (!equipment) {
            return res.status(404).json({
                message: "Equipment not found"
            });
        }

        // Update text fields only if they are provided
        if (name) equipment.name = name;
        if (category) equipment.category = category;
        if (description) equipment.description = description;
        if (price) equipment.price = price;

        // If a new image is uploaded
        if (req.file) {
            const uploadToCloudinary = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: "medical-equipment"
                        },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    );

                    streamifier
                        .createReadStream(req.file.buffer)
                        .pipe(stream);
                });
            };

            const result = await uploadToCloudinary();

            equipment.image = result.secure_url;
        }

        await equipment.save();

        res.status(200).json({
            message: "Equipment updated successfully",
            equipment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update equipment",
            error: error.message
        });
    }
};

module.exports = {
    addEquipment,
    getEquipment,
    deleteEquipment,
    updateEquipment
};
