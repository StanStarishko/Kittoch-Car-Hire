const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const fs = require('fs/promises');
const path = require('path');
const SETTINGS_DIR = path.join(__dirname, '../../frontend/settings');

// Model Registration
const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Vehicle = require("../models/Vehicle");

// CORS Middleware
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle OPTIONS method
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// Request logging middleware
router.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        body: req.body,
        query: req.query
    });
    next();
});


/**
 * Universal CRUD Routes for collections
 */

/**
 * Enhanced filter route with advanced querying capabilities
 * Supports:
 * - Date range queries
 * - Pagination
 * - Sorting
 * - Field selection
 * - Text search
 */
router.post("/filtered/:collection", async (req, res) => {
    try {
        const { collection } = req.params;
        const {
            filters = {},         // Basic filters
            dateRanges = {},      // Date range filters
            page = 1,             // Current page
            limit = 10,           // Items per page
            sortBy = {},          // Sorting parameters
            fields = [],          // Fields to return
            search = ""           // Global search term
        } = req.body;

        if (!mongoose.models[collection]) {
            return res.status(404).json({
                error: `Collection ${collection} not found`,
                availableCollections: Object.keys(mongoose.models)
            });
        }

        const Model = mongoose.model(collection);
        
        // Build query object
        let query = {};

        // Add basic filters
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                query[key] = filters[key];
            }
        });

        // Add date range filters
        Object.keys(dateRanges).forEach(dateField => {
            const { start, end } = dateRanges[dateField];
            if (start || end) {
                query[dateField] = {};
                if (start) query[dateField].$gte = new Date(start);
                if (end) query[dateField].$lte = new Date(end);
            }
        });

        // Add text search if provided
        if (search) {
            const searchFields = Model.schema.obj;
            const searchQueries = Object.keys(searchFields)
                .filter(field => 
                    ['String', 'Number'].includes(searchFields[field].type?.name))
                .map(field => ({ [field]: new RegExp(search, 'i') }));
            
            if (searchQueries.length > 0) {
                query.$or = searchQueries;
            }
        }

        // Build sort object
        const sort = {};
        Object.keys(sortBy).forEach(field => {
            sort[field] = sortBy[field] === 'desc' ? -1 : 1;
        });

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Select specific fields if provided
        const fieldSelection = fields.length > 0 
            ? fields.join(' ') 
            : '';

        // Execute query with all parameters
        const results = await Model
            .find(query)
            .select(fieldSelection)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count for pagination
        const total = await Model.countDocuments(query);

        // Send response with pagination info
        res.status(200).json({
            results,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Filter endpoint error:', error);
        res.status(500).json({
            error: error.message,
            details: "Server error in filtered endpoint"
        });
    }
});

// Get model parameters
router.get('/schema/:model', async (req, res) => {
    const modelName = req.params.model;
    const Model = mongoose.model(modelName);
    res.json(Model.schema);
});

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

// Get settings
router.get('/settings/:filename', async (req, res) => {
    try {
      const filePath = path.join(SETTINGS_DIR, req.params.filename);
      const data = await fs.readFile(filePath, 'utf8');
      res.json(JSON.parse(data));
    } catch (error) {
      console.error('Error reading settings:', error);
      res.status(404).json({ error: 'Settings file not found' });
    }
  });
  
  // Saving settings
  router.post('/settings/:filename', async (req, res) => {
    try {
      const filePath = path.join(SETTINGS_DIR, req.params.filename);
      await fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf8');
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });

module.exports = router;
