const mongoose = require('mongoose');

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Successfully connected to MongoDB Atlas!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1); // Exit the process if the connection fails
    }
}

module.exports = connectToDatabase;
