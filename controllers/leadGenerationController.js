import mongoose from "mongoose";
import LeadGeneration from "../models/LeadGeneration.js";

const isPlainObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

const mergeAppendData = (existingValue, incomingValue) => {
    if (Array.isArray(existingValue) && Array.isArray(incomingValue)) {
        return [...existingValue, ...incomingValue];
    }

    if (isPlainObject(existingValue) && isPlainObject(incomingValue)) {
        const merged = { ...existingValue };

        for (const key of Object.keys(incomingValue)) {
            merged[key] = mergeAppendData(existingValue[key], incomingValue[key]);
        }

        return merged;
    }

    return incomingValue;
};

const getLeadPayload = (body) => {
    const { append, id, _id, ...payload } = body;
    return payload;
};

export const createOrAppendLeadGeneration = async (req, res) => {
    try {
        const { append, id, _id } = req.body;
        const documentId = id || _id;
        const payload = getLeadPayload(req.body);

        if (append) {
            if (!documentId) {
                return res.status(400).json({
                    status: false,
                    message: "id or _id is required when append is true",
                });
            }

            if (!mongoose.Types.ObjectId.isValid(documentId)) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid leadgeneration id",
                });
            }

            const existingLead = await LeadGeneration.findById(documentId);

            if (!existingLead) {
                return res.status(404).json({
                    status: false,
                    message: "Leadgeneration entry not found",
                });
            }

            const currentData = existingLead.toObject();
            delete currentData._id;
            delete currentData.createdAt;
            delete currentData.updatedAt;
            delete currentData.__v;

            existingLead.set(mergeAppendData(currentData, payload));
            await existingLead.save();

            return res.status(200).json({
                status: true,
                message: "Leadgeneration entry updated successfully",
                data: existingLead,
            });
        }

        const createdLead = await LeadGeneration.create(payload);

        return res.status(201).json({
            status: true,
            message: "Leadgeneration entry created successfully",
            data: createdLead,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};
