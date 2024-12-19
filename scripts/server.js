const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/kittoch', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Database connection error:', err));

// Employee schema
const employeeSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    forename: { type: String, required: true },
    surname: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true },
});

const Employee = mongoose.model('Employee', employeeSchema);

// Routes

// Registration
app.post('/api/employees/register', async (req, res) => {
    const { email, password, forename, surname, gender, dob } = req.body;

    try {
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ success: false, message: 'Employee ID already exists' });
        }

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
        res.status(201).json({ success: true, message: 'Employee registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// Login
app.post('/api/employees/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(400).json({ success: false, message: 'Invalid Employee ID or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, employee.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Invalid Employee ID or password' });
        }

        const token = jwt.sign({ email: employee.email }, 'secretKey', { expiresIn: '1h' });
        res.json({ success: true, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
