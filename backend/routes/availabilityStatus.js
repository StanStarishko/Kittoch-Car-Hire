const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle"); // Assuming there is a Vehicle model

// Route to get availability status of all vehicles
router.get("/", async (req, res) => {
    try {
        const vehicles = await Vehicle.find({}, "vehicleId availabilityStatus");
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ error: "Error fetching availability status" });
    }
});

// Route to get availability status for a specific vehicle
router.get("/:vehicleId", async (req, res) => {
    const { vehicleId } = req.params;
    try {
        const vehicle = await Vehicle.findOne({ vehicleId }, "vehicleId availabilityStatus");
        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ error: "Error fetching vehicle availability status" });
    }
});

// Route to update availability status for a specific vehicle
router.put("/:vehicleId", async (req, res) => {
    const { vehicleId } = req.params;
    const { availabilityStatus } = req.body;

    if (!["Available", "Rented", "In Maintenance"].includes(availabilityStatus)) {
        return res.status(400).json({ error: "Invalid availability status" });
    }

    try {
        const updatedVehicle = await Vehicle.findOneAndUpdate(
            { vehicleId },
            { availabilityStatus },
            { new: true }
        );

        if (!updatedVehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }

        res.json(updatedVehicle);
    } catch (error) {
        res.status(500).json({ error: "Error updating availability status" });
    }
});

module.exports = router;
