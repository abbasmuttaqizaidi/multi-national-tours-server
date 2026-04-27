import mongoose from "mongoose";

const leadGenerationSchema = new mongoose.Schema(
    {},
    {
        strict: false,
        timestamps: true,
    }
);

export default mongoose.model("LeadGeneration", leadGenerationSchema);
