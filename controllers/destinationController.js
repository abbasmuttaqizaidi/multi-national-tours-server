import { defaultHeroImage } from "../constants/defaultDestinationsData.js";
import Destination from "../models/Destination.js";
import mongoose from "mongoose";

const validateDestinationPayload = (body) => {
    const requiredFields = [
        "name",
        "price",
    ];

    for (const field of requiredFields) {
        if (!body[field]) {
            return `${field} is required`;
        }
    }

    const listFields = ["amenities", "gallery", "included", "excluded"];

    for (const field of listFields) {
        if (body[field] !== undefined && !Array.isArray(body[field])) {
            return `${field} must be an array`;
        }
    }

    if (body.itinerary !== undefined && !Array.isArray(body.itinerary)) {
        return "itinerary must be an array";
    }

    return null;
};

// CREATE
export const createDestination = async (req, res) => {
    try {
        const validationError = validateDestinationPayload(req.body);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        await Destination.create(req.body);
        return res.status(201).json({ status: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL
export const getDestinations = async (req, res) => {
    try {
        const data = await Destination.find().sort({ createdAt: -1 });
        const rectifiedData = data.map(item => ({
            ...item.toObject(),
            heroImage: item.heroImage === '' ? defaultHeroImage : item.heroImage,
        }));
        res.json(rectifiedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL RECOMMENDATIONS
export const getAllRecommendations = async (req, res) => {
    try {
        const destinations = await Destination.find({
            recommendation_tag: { $exists: true, $nin: [null, ""] },
        }).sort({ createdAt: -1 });

        const recommendations = destinations.reduce((acc, destination) => {
            if (destination.showInRecommendations) {
                const tag = destination.recommendation_tag;

                if (!acc[tag]) {
                    acc[tag] = [];
                }

                acc[tag]?.push({
                    name: destination.name,
                    location: destination.location,
                    description: destination.description,
                    duration: destination.duration,
                    heroImage: destination.heroImage === '' ? defaultHeroImage : destination.heroImage,
                    price: String(destination.price ?? ""),
                    id: destination._id,
                });
            }

            return acc;
        }, {});

        return res.json({
            success: Object.keys(recommendations).length > 0,
            data: recommendations,
            message: Object.keys(recommendations).length > 0 ? "Recommendations fetched successfully" : "No recommendations found",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get popular destinations
export const getPopularDestinations = async (req, res) => {
    try {
        const popularDestinations = await getPopularDestinationsFromDB();

        return res.json({
            success: Object.keys(popularDestinations).length > 0,
            data: popularDestinations.map(dest => ({ ...dest, heroImage: dest.heroImage === '' ? defaultHeroImage : dest.heroImage })),
            message: Object.keys(popularDestinations).length > 0 ? "Popular Destinations fetched successfully" : "No popular destinations found",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getPopularDestinationsFromDB = async () => {
    try {
        const popularDestinations = await Destination.find(
            { isPopularDestination: true },
            {
                heroImage: 1,
                category: 1,
                name: 1,
                price: 1,
                duration: 1,
                _id: 1, // keep this (frontend ke kaam aata hai)
            }
        ).sort({ createdAt: -1 }).lean();

        return popularDestinations;
    } catch (error) {
        console.error("Error fetching popular destinations:", error);
        return [];
    }
};

// GET SINGLE
export const getDestinationById = async (req, res) => {
    try {
        console.log("Fetching destination with ID:", req.params.id);
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid destination id" });
        }

        const data = await Destination.findById(req.params.id);

        if (!data) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE DUPLICATES
export const deleteDuplicates = async () => {
    try {
        const all = await Destination.find().sort({ _id: 1 }); // oldest first

        const seen = new Map();
        const idsToDelete = [];

        for (const doc of all) {
            const key = doc.name?.trim().toLowerCase();

            if (!key) continue;

            if (seen.has(key)) {
                idsToDelete.push(doc._id); // duplicate → mark for delete
            } else {
                seen.set(key, true); // first occurrence → keep
            }
        }

        console.log("Deleting IDs:", idsToDelete);

        if (idsToDelete.length > 0) {
            await Destination.deleteMany({ _id: { $in: idsToDelete } });
        }

        console.log("Duplicates removed");
    } catch (err) {
        console.error(err);
    }
};

// BULK INSERT
export const insertAllData = async (req, res) => {

    try {
        const entries = req.body; // Add entries as an array of objects

        if (!Array.isArray(entries)) {
            return res.status(400).json({ message: "Array of data required" });
        }

        const result = await Destination.insertMany(entries);

        res.json({
            status: true,
            count: result.length,
            message: "Data inserted successfully",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE
export const deleteDestination = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid destination id" });
        }

        const deleted = await Destination.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Not found" });
        }

        return res.json({ status: true });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// UPDATE
export const updateDestination = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid destination id" });
        }

        const { _id, __v, ...updateData } = req.body;

        const recommendationTag = updateData.showInRecommendations ? updateData.recommendation_tag : "";
        const popularDestinationLength = await Destination.countDocuments({ isPopularDestination: true });

        const updated = await Destination.findByIdAndUpdate(
            req.params.id,
            {
                ...updateData,
                recommendation_tag: recommendationTag,
                isPopularDestination: popularDestinationLength >= 4 ? false : updateData.isPopularDestination,
            },
            { returnDocument: "after" }
        );

        if (!updated) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json({
            status: true,
            data: updated,
            message: "Destination updated successfully",
            meta: popularDestinationLength >= 4 ? "Popular destination limit exceeded. This destination cannot be marked as popular until some are removed." : null,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
