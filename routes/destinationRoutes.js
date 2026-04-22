import express from "express";
import {
    createDestination,
    getDestinations,
    getAllRecommendations,
    getDestinationById,
    updateDestination,
    deleteDestination,
    getPopularDestinations,
    insertAllData,
} from "../controllers/destinationController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/test", (req, res) => {
    res.json({ message: "Destination routes working" });
});

// Public
router.get("/destinations", getDestinations);
router.get("/recommendedJourneys", getAllRecommendations);
router.get("/popularDestinations", getPopularDestinations);
router.get("/seed", insertAllData);
router.get("/destination/:id", getDestinationById);

// Admin
router.post(
    "/addDestination",
    protect,
    allowRoles("admin", "superadmin"),
    createDestination
);
router.put(
    "/editDestination/:id",
    protect,
    allowRoles("admin", "superadmin"),
    updateDestination
);

// Superadmin only
router.delete(
    "/deleteDestination/:id",
    protect,
    allowRoles("admin", "superadmin"),
    deleteDestination
);


export default router;
