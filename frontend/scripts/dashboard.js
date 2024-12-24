$(document).ready(() => {
    const apiUrl = 'https://kittoch-car-hire.onrender.com/api';

    // Handle navigation tabs
    $('.nav-link').click(function () {
        $('.nav-link').removeClass('active');
        $(this).addClass('active');

        const tabId = $(this).attr('id').replace('tab', 'tabContent');
        $('#content > div').addClass('d-none');
        $(`#${tabId}`).removeClass('d-none');
    });

    // Redirect to respective pages for adding new records
    $('#addBooking').click(() => {
        window.location.href = '/pages/addBooking.html';
    });

    $('#addVehicle').click(() => {
        window.location.href = '/pages/addVehicle.html';
    });

    $('#addCustomer').click(() => {
        window.location.href = '/pages/addCustomer.html';
    });

    $('#addEmployee').click(() => {
        window.location.href = '/pages/register.html';
    });

    // Helper function to format dates as YYYY-MM-DD
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

    // Generic function to load data and populate tables
    async function loadTableData(endpoint, tableBodySelector, createRow) {
        try {
            const response = await fetch(`${apiUrl}/${endpoint}`);
            const data = await response.json();
            const tableBody = $(tableBodySelector);
            tableBody.empty();
            data.forEach(createRow);
        } catch (error) {
            console.error(`Error loading data from ${endpoint}:`, error);
        }
    }

    // Load booking data into the table
    async function loadBookings() {
        loadTableData('bookings', '#bookingTableBody', booking => {
            $('#bookingTableBody').append(`
                <tr>
                    <td>${booking.BookingDate}</td>
                    <td>${booking.CustomerId}</td>
                    <td>${booking.CarId}</td>
                    <td>${formatDate(booking.StartDate)}</td>
                    <td>${booking.PickupLocation}</td>
                    <td>${formatDate(booking.ReturnDate)}</td>
                    <td>${booking.DropoffLocation}</td>
                    <td>
                        <button class="btn btn-warning btn-sm edit-booking" data-id="${booking.id}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-booking" data-id="${booking.id}">Delete</button>
                    </td>
                </tr>
            `);
        });
    }

    // Load vehicle data into the table
    async function loadVehicles() {
        loadTableData('vehicles', '#vehicleTableBody', vehicle => {
            $('#vehicleTableBody').append(`
                <tr>
                    <td>${vehicle.VehicleId.replace('_', ' ')}</td>
                    <td>${vehicle.Passengers}</td>
                    <td>${vehicle.Capacity}</td>
                    <td>${vehicle.Fuel}</td>
                    <td>${vehicle.CostPerDay}</td>
                    <td>${vehicle.Availability}</td>
                    <td>${formatDate(vehicle.AvailabilityDate)}</td>
                    <td>
                        <button class="btn btn-warning btn-sm edit-vehicle" data-id="${vehicle.id}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-vehicle" data-id="${vehicle.id}">Delete</button>
                    </td>
                </tr>
            `);
        });
    }

    // Load customer data into the table
    async function loadCustomers() {
        loadTableData('customers', '#customerTableBody', customer => {
            $('#customerTableBody').append(`
                <tr>
                    <td>${customer.CustomerId}</td>
                    <td>${customer.Forename}</td>
                    <td>${customer.Surname}</td>
                    <td>${formatDate(customer.DateOfBirth)}</td>
                    <td>${customer.Gender}</td>
                    <td>${customer.Phone}</td>
                    <td>
                        <button class="btn btn-warning btn-sm edit-customer" data-id="${customer.id}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-customer" data-id="${customer.id}">Delete</button>
                    </td>
                </tr>
            `);
        });
    }

    // Load employee data into the table
    async function loadEmployees() {
        loadTableData('employees', '#employeeTableBody', employee => {
            $('#employeeTableBody').append(`
                <tr>
                    <td>${employee.EmployeeId}</td>
                    <td>${employee.Forename}</td>
                    <td>${employee.Surname}</td>
                    <td>${formatDate(employee.DateOfBirth)}</td>
                    <td>${employee.Gender}</td>
                    <td>${employee.Phone}</td>
                    <td>
                        <button class="btn btn-warning btn-sm edit-employee" data-id="${employee.EmployeeId}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-employee" data-id="${employee.EmployeeId}">Delete</button>
                    </td>
                </tr>
            `);
        });
    }

    // Handle clicks on "edit" and "delete" buttons for employees
    $(document).on('click', '.edit-employee', function () {
        const employeeId = $(this).data('id');
        const currentTab = $('.nav-link.active').attr('id');
        sessionStorage.setItem('currentTab', currentTab);
        window.location.href = `/pages/register.html?id=${employeeId}`;
    });

    $(document).on('click', '.delete-employee', async function () {
        const employeeId = $(this).data('id');
        if (confirm('Are you sure you want to delete this record?')) {
            try {
                const response = await fetch(`${apiUrl}/employees/${employeeId}`, { method: 'DELETE' });
                if (response.ok) {
                    alert('Employee deleted successfully.');
                    loadEmployees();
                } else {
                    alert('Failed to delete employee.');
                }
            } catch (error) {
                console.error('Error deleting employee:', error);
                alert('An error occurred while deleting the employee.');
            }
        }
    });

    // Automatically switch to the last active tab, if applicable
    const currentTab = sessionStorage.getItem('currentTab');
    if (currentTab) {
        $(`#${currentTab}`).click();
        sessionStorage.removeItem('currentTab');

        // Check if we need to refresh employees list
        if (localStorage.getItem('refreshEmployees') === 'true') {
            localStorage.removeItem('refreshEmployees'); // Clear flag
            loadEmployees(); // Refresh employees
        }

        // Event listener for edit button
        $('#employeesTable').on('click', '.edit-btn', function () {
            const employeeId = $(this).data('id');
            window.location.href = `/pages/register.html?id=${employeeId}`;
        });

    } else {
        loadBookings();
        loadVehicles();
        loadCustomers();
        loadEmployees();
    }
});
