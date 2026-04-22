// models/Admin.js
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["admin", "superadmin"],
    default: "admin",
  },
});

export default mongoose.model("Admin", adminSchema);