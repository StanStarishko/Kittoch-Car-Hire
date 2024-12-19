const Employee = require('./models/Employee');
const bcrypt = require('bcrypt');

// Register a new employee
async function registerEmployee(data) {
    try {
        const existingEmployee = await Employee.findOne({ EmployeeId: data.EmployeeId });
        if (existingEmployee) {
            throw new Error("Employee ID already exists.");
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(data.Password, 10);

        const newEmployee = new Employee({
            ...data,
            Password: hashedPassword,
        });

        await newEmployee.save();
        return { message: "Employee registered successfully!" };
    } catch (error) {
        throw new Error(error.message);
    }
}

// Authenticate employee
async function authenticateEmployee(email, password) {
    try {
        const employee = await Employee.findOne({ EmployeeId: email });
        if (!employee) {
            throw new Error("Employee not found.");
        }

        const isPasswordValid = await bcrypt.compare(password, employee.Password);
        if (!isPasswordValid) {
            throw new Error("Invalid password.");
        }

        return { message: "Login successful!", employee };
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = { registerEmployee, authenticateEmployee };
