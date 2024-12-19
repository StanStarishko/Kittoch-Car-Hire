const express = require('express');
const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');
const router = express.Router();

// Register Employee
router.post('/register', async (req, res) => {
    const { email, password, forename, surname, gender, dob } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newEmployee = new Employee({
            email,
            password: hashedPassword,
            forename,
            surname,
            gender,
            dob,
        });

        await newEmployee.save();
        res.status(201).json({ message: 'Employee registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login Employee
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
