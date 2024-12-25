$(document).ready(() => {
    const apiUrl = 'https://kittoch-car-hire.onrender.com/api/universalCRUD';

    // Helper function to format dates as YYYY-MM-DD
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

    // Handle navigation tabs
    $('.nav-link').click(function () {
        $('.nav-link').removeClass('active');
        $(this).addClass('active');

        const tabId = $(this).attr('id').replace('tab', 'tabContent');
        $('#content > div').addClass('d-none');
        $(`#${tabId}`).removeClass('d-none');
    });

    // Redirect to respective pages for adding new records
    const redirectPage = "/frontend/html/addPages.html";
    const buttons = [   '#addBooking', 
                        '#addVehicle', 
                        '#addCustomer', 
                        '#addEmployee'
                    ];

    buttons.forEach(button => {
        $(button).click(() => {
            window.location.href = redirectPage;
        });
    });

    // Create Buttons Edit and Delete
    function createActionButtons(id) {
        return `
            <div class="btn-group">
                <button class="btn btn-link edit-btn" data-id="${id}">
                    <i class="bi bi-pencil-square" style="color: black"></i>
                </button>
                <button class="btn btn-link delete-btn" data-id="${id}">
                    <i class="bi bi-x-circle" style="color: red;"></i>
                </button>
            </div>
        `;
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
        loadTableData('Booking', '#bookingTableBody', booking => {
            $('#bookingTableBody').append(`
                <tr>
                    <td>${formatDate(booking.BookingDate)}</td>
                    <td>${booking.CustomerId}</td>
                    <td>${booking.CarId}</td>
                    <td>${formatDate(booking.StartDate)}</td>
                    <td>${booking.PickupLocation}</td>
                    <td>${formatDate(booking.ReturnDate)}</td>
                    <td>${booking.DropoffLocation}</td>
                    <td>${createActionButtons(booking.BookingId)}</td>
                </tr>
            `);
        });
    }

    // Load vehicle data into the table
    async function loadVehicles() {
        loadTableData('Vehicle', '#vehicleTableBody', vehicle => {
            $('#vehicleTableBody').append(`
                <tr>
                    <td>${vehicle.VehicleId.replace('_', ' ')}</td>
                    <td>${vehicle.Passengers}</td>
                    <td>${vehicle.Capacity}</td>
                    <td>${vehicle.Fuel}</td>
                    <td>${vehicle.CostPerDay}</td>
                    <td>${vehicle.Availability}</td>
                    <td>${formatDate(vehicle.AvailabilityDate)}</td>
                    <td>${createActionButtons(vehicle.VehicleId)}</td>
                </tr>
            `);
        });
    }

    // Load customer data into the table
    async function loadCustomers() {
        loadTableData('Customer', '#customerTableBody', customer => {
            $('#customerTableBody').append(`
                <tr>
                    <td>${customer.CustomerId}</td>
                    <td>${customer.Forename}</td>
                    <td>${customer.Surname}</td>
                    <td>${formatDate(customer.DateOfBirth)}</td>
                    <td>${customer.Gender}</td>
                    <td>${customer.Phone}</td>
                    <td>${createActionButtons(customer.CustomerId)}</td>
                </tr>
            `);
        });
    }

    // Load employee data into the table
    async function loadEmployees() {
        loadTableData('Employee', '#employeeTableBody', employee => {
            $('#employeeTableBody').append(`
                <tr>
                    <td>${employee.EmployeeId}</td>
                    <td>${employee.Forename}</td>
                    <td>${employee.Surname}</td>
                    <td>${formatDate(employee.DateOfBirth)}</td>
                    <td>${employee.Gender}</td>
                    <td>${employee.Phone}</td>
                    <td>${createActionButtons(employee.EmployeeId)}</td>
                </tr>
            `);
        });
    }

    // Handle clicks on "edit" and "delete" buttons for employees
    $(document).on('click', '.edit-btn', function () {
        const currentId = $(this).data('id');
        const currentTab = $('.nav-link.active').attr('id');
        sessionStorage.setItem('currentTab', currentTab);
        window.location.href = `/frontend/html/addPages.html?id=${currentId}`;
    });

    $(document).on('click', '.delete-btn', async function () {
        e.preventDefault();
        const currentId = $(this).data('id');
        if (confirm('Are you sure you want to delete this record?')) {
            try {
                const response = await fetch(`${apiUrl}/Employee/${currentId}`, { method: 'DELETE' });
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
            window.location.href = `/frontend/html/addPages.html?id=${employeeId}`;
        });

    } else {
        loadBookings();
        loadVehicles();
        loadCustomers();
        loadEmployees();
    }
});
