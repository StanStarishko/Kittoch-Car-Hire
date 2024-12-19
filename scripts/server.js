const express = require('express');
const bodyParser = require('body-parser');
const connectToDatabase = require('./db');
const { registerEmployee, authenticateEmployee } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Connect to database
connectToDatabase();

// Routes
app.post('/register', async (req, res) => {
    try {
        const result = await registerEmployee(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { EmployeeId, Password } = req.body;
        const result = await authenticateEmployee(EmployeeId, Password);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
