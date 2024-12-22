const Employee = require('../models/Employee');
const bcrypt = require('bcrypt');

/**
 * Register a new employee.
 * @param {Object} data - Employee data.
 * @returns {Object} - Success message.
 */
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

/**
 * Authenticate an employee.
 * @param {String} EmployeeId - Employee ID.
 * @param {String} Password - Employee password.
 * @returns {Object} - Success message and employee data.
 */
async function authenticateEmployee(EmployeeId, Password) {
    const employee = await Employee.findOne({ EmployeeId });
    if (!employee) throw new Error("Employee not found.");

    const isPasswordValid = await bcrypt.compare(Password, employee.Password);
    if (!isPasswordValid) throw new Error("Invalid password.");

    return { message: "Login successful!", employee };
}

/**
 * Update employee details.
 * @param {String} EmployeeId - Employee ID.
 * @param {Object} updatedData - Data to update.
 * @returns {Object} - Updated employee.
 */
async function updateEmployee(EmployeeId, updatedData) {
    const employee = await Employee.findOne({ EmployeeId });
    if (!employee) throw new Error("Employee not found.");

    // If a new password is provided, hash it
    if (updatedData.Password) {
        updatedData.Password = await bcrypt.hash(updatedData.Password, 10);
    }

    // Merge the updated data into the employee object
    Object.assign(employee, updatedData);

    await employee.save();
    return { message: "Employee updated successfully!", employee };
}

module.exports = {
    registerEmployee,
    authenticateEmployee,
    updateEmployee,
};
