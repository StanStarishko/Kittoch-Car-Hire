const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Get all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('CustomerId').populate('CarId');
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add other booking-specific routes here...

module.exports = router;
