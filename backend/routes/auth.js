const express = require('express');
const router = express.Router();
const { registerEmployee, authenticateEmployee } = require('../services/authService');

// Register employee
router.post('/register', async (req, res) => {
    try {
        const result = await registerEmployee(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Authenticate employee
router.post('/login', async (req, res) => {
    try {
        const result = await authenticateEmployee(req.body.EmployeeId, req.body.Password);
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

module.exports = router;
