import express from "express";
import { createOrAppendLeadGeneration } from "../controllers/leadGenerationController.js";

const router = express.Router();

router.post("/leadgeneration", createOrAppendLeadGeneration);

export default router;
