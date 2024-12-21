const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    VehicleId: { type: String, required: true, unique: true },
    Make: String,
    Model: String,
    Category: String,
    Passengers: Number,
    Capacity: String,
    Fuel: String,
    DateOfPurchase: Date,
    Availability: Boolean,
    CostPerDay: Number,
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
