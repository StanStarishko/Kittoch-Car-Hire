const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    EmployeeId: { type: String, required: true, unique: true }, // Email
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

module.exports = mongoose.model('Employee', employeeSchema);
