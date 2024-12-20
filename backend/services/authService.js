const Employee = require('../models/Employee');
const bcrypt = require('bcrypt');

async function registerEmployee(data) {
    const existingEmployee = await Employee.findOne({ EmployeeId: data.EmployeeId });
    if (existingEmployee) throw new Error("Employee ID already exists.");

    const hashedPassword = await bcrypt.hash(data.Password, 10);

    const newEmployee = new Employee({
        ...data,
        Password: hashedPassword,
    });

    await newEmployee.save();
    return { message: "Employee registered successfully!" };
}

async function authenticateEmployee(EmployeeId, Password) {
    const employee = await Employee.findOne({ EmployeeId });
    if (!employee) throw new Error("Employee not found.");

    const isPasswordValid = await bcrypt.compare(Password, employee.Password);
    if (!isPasswordValid) throw new Error("Invalid password.");

    return { message: "Login successful!", employee };
}

module.exports = { registerEmployee, authenticateEmployee };
