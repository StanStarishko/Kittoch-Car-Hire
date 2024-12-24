const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Model Registration
const Booking = require("../models/Booking");
const Customer = require("../models/Customer");

/**
 * Universal CRUD Routes for collections
 */

// Add a new document to the specified collection
router.post("/:collection", async (req, res) => {
    try {
        const { collection } = req.params;
        const Model = mongoose.model(collection);

        // Auto-generate ID for Booking
        if (collection === "Booking") {
            const { CustomerId, StartDate } = req.body;

            // Validate required fields
            if (!CustomerId || !StartDate) {
                return res.status(400).json({ error: "CustomerId and StartDate are required for Booking." });
            }

            // Format StartDate to YYYY-MM-DD
            const formattedDate = new Date(StartDate).toISOString().split("T")[0];

            // Count existing bookings for the customer on the same date
            const bookingCount = await Model.countDocuments({ CustomerId, StartDate });
            const bookingNum = String(bookingCount + 1).padStart(3, "0");

            // Generate the Booking ID
            req.body.BookingId = `${CustomerId}_${formattedDate}_${bookingNum}`;
        }

        const newDocument = new Model(req.body);
        const result = await newDocument.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all documents from the specified collection
router.get("/:collection", async (req, res) => {
    try {
        const { collection } = req.params;
        const Model = mongoose.model(collection);
        const results = await Model.find();
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Filter documents in the specified collection
router.post("/Filtered/:collection", async (req, res) => {
    console.log("Received POST request to /Filtered/:collection"); // Log request arrival
    console.log("Collection:", req.params.collection); // Log collection name
    console.log("Filters:", req.body); // Log the filters sent in the body
    try {
        const { collection } = req.params;
        const filters = req.body; // Filters provided in the request body
        const Model = mongoose.model(collection);

        // Debugging: Log collection name and filters
        console.log("Debug: Collection name received:", collection); // For debugging collection
        console.log("Debug: Filters received:", filters); // For debugging filters

        const results = await Model.find(filters);

        // Debugging: Log results from database query
        console.log("Debug: Query results:", results); // For debugging query results

        res.status(200).json(results);
    } catch (error) {
        // Debugging: Log error details
        console.error("Debug: Error occurred:", error.message); // For debugging errors
        res.status(500).json({ error: error.message });
    }
});

// Update a document in the specified collection
router.put("/:collection/:id", async (req, res) => {
    try {
        const { collection, id } = req.params;
        const Model = mongoose.model(collection);
        const updatedDocument = await Model.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedDocument) {
            return res.status(404).json({ error: "Document not found" });
        }
        res.status(200).json(updatedDocument);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a document from the specified collection
router.delete("/:collection/:id", async (req, res) => {
    try {
        const { collection, id } = req.params;
        const Model = mongoose.model(collection);
        const deletedDocument = await Model.findByIdAndDelete(id);
        if (!deletedDocument) {
            return res.status(404).json({ error: "Document not found" });
        }
        res.status(200).json(deletedDocument);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
