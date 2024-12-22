$(document).ready(async () => {
    const employeeTable = $('#employeeTable tbody');

    // Fetch and render all employees
    async function fetchEmployees() {
        try {
            const response = await fetch('https://kittoch-car-hire.onrender.com/api/employee');
            const employees = await response.json();
            employeeTable.empty();
            employees.forEach((employee) => {
                employeeTable.append(`
                    <tr>
                        <td>${employee._id}</td>
                        <td>${employee.forename} ${employee.surname}</td>
                        <td>${employee.employeeId}</td>
                        <td>${employee.phone}</td>
                        <td>${employee.address.street}, ${employee.address.town}, ${employee.address.postcode}</td>
                        <td>
                            <button class="btn btn-primary btn-sm edit-btn" data-id="${employee._id}">Edit</button>
                            <button class="btn btn-danger btn-sm delete-btn" data-id="${employee._id}">Delete</button>
                        </td>
                    </tr>
                `);
            });
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    }

    // Add Employee
    $('#addEmployeeForm').submit(async (e) => {
        e.preventDefault();
        const employeeData = {
            forename: $('#forename').val(),
            surname: $('#surname').val(),
            employeeId: $('#employeeId').val(),
            phone: $('#phone').val(),
            address: {
                street: $('#street').val(),
                town: $('#town').val(),
                postcode: $('#postcode').val(),
            },
        };

        try {
            const response = await fetch('https://kittoch-car-hire.onrender.com/api/employee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(employeeData),
            });
            if (response.ok) {
                $('#addEmployeeModal').modal('hide');
                fetchEmployees();
            }
        } catch (err) {
            console.error('Error adding employee:', err);
        }
    });

    // Edit Employee
    employeeTable.on('click', '.edit-btn', async function () {
        const employeeId = $(this).data('id');
        try {
            const response = await fetch(`https://kittoch-car-hire.onrender.com/api/employee/${employeeId}`);
            const employee = await response.json();

            $('#editForename').val(employee.forename);
            $('#editSurname').val(employee.surname);
            $('#editEmployeeId').val(employee.employeeId);
            $('#editPhone').val(employee.phone);
            $('#editStreet').val(employee.address.street);
            $('#editTown').val(employee.address.town);
            $('#editPostcode').val(employee.address.postcode);

            $('#editEmployeeModal').modal('show');

            $('#editEmployeeForm').off('submit').submit(async (e) => {
                e.preventDefault();

                const updatedData = {
                    forename: $('#editForename').val(),
                    surname: $('#editSurname').val(),
                    employeeId: $('#editEmployeeId').val(),
                    phone: $('#editPhone').val(),
                    address: {
                        street: $('#editStreet').val(),
                        town: $('#editTown').val(),
                        postcode: $('#editPostcode').val(),
                    },
                };

                try {
                    const response = await fetch(`https://kittoch-car-hire.onrender.com/api/employee/${employeeId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedData),
                    });
                    if (response.ok) {
                        $('#editEmployeeModal').modal('hide');
                        fetchEmployees();
                    }
                } catch (err) {
                    console.error('Error updating employee:', err);
                }
            });
        } catch (err) {
            console.error('Error fetching employee details:', err);
        }
    });

    // Delete Employee
    employeeTable.on('click', '.delete-btn', async function () {
        const employeeId = $(this).data('id');
        if (confirm('Are you sure you want to delete this employee?')) {
            try {
                const response = await fetch(`https://kittoch-car-hire.onrender.com/api/employee/${employeeId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    fetchEmployees();
                }
            } catch (err) {
                console.error('Error deleting employee:', err);
            }
        }
    });

    // Initial fetch
    fetchEmployees();
});
