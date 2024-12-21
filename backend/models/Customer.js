const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    CustomerId: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    Gender: String,
    Forename: String,
    Surname: String,
    DateOfBirth: Date,
    LicenceNumber: String,
    Street: String,
    Town: String,
    Postcode: String,
    Phone: String,
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
