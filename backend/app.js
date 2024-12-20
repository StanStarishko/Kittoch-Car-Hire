require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectToDatabase = require('./db');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
(async () => {
    try {
        await connectToDatabase();
    } catch (error) {
        console.error("Failed to connect to the database. Exiting...");
        process.exit(1);
    }
})();

// Import routes
const employeeRoutes = require('./routes/employees');
const authRoutes = require('./routes/auth');

// Debug imported routes
console.log('Employee Routes:', employeeRoutes);
console.log('Auth Routes:', authRoutes);

// Attach routes
app.use('/api/employees', employeeRoutes);
app.use('/api/auth', authRoutes);

// Error handler
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
