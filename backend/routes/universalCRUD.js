const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Model Registration
const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Vehicle = require("../models/Vehicle");

/**
 * Universal CRUD Routes for collections
 */

// Add a new document to the specified collection
router.post("/:collection", async (req, res) => {
    try {
        const { collection } = req.params;
        const Model = mongoose.model(collection);
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
