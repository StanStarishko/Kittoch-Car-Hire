const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    BookingId: { type: String, required: true, unique: true },
    CustomerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    CarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    BookingDate: { type: Date, default: Date.now },
    StartDate: Date,
    StartTime: String,
    ReturnDate: Date,
    ReturnTime: String,
    PickupLocation: String,
    DropoffLocation: String,
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
