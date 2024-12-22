const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Get all employees
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get employee by ID
router.get('/:EmployeeId', async (req, res) => {
    try {
        const { EmployeeId } = req.params;
        const employee = await Employee.findOne({ EmployeeId });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete employee
router.delete('/:EmployeeId', async (req, res) => {
    try {
        const { EmployeeId } = req.params;
        const deletedEmployee = await Employee.findOneAndDelete({ EmployeeId });
        if (!deletedEmployee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
