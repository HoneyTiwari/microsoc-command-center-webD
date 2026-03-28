const express = require("express");
const router = express.Router();
const Incident = require("../models/Incident");
const verifyToken = require("../middleware/verifyToken");

// CREATE incident (admin + analyst only)
router.post("/", verifyToken, async (req, res) => {
    try {
        if (!["admin", "analyst"].includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const incident = await Incident.create({
            title: req.body.title,
            description: req.body.description,
            severity: req.body.severity,
            createdBy: req.user.id
        });

        res.json({ success: true, incident });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET all incidents
router.get("/", verifyToken, async (req, res) => {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json({ success: true, incidents });
});

module.exports = router;
