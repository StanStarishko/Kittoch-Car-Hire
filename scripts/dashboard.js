$(document).ready(() => {
    const apiUrl = 'https://kittoch-car-hire.onrender.com/api';

    $('.nav-link').click(function () {
        $('.nav-link').removeClass('active');
        $(this).addClass('active');

        const tabId = $(this).attr('id').replace('tab', 'tabContent');
        $('#content > div').addClass('d-none');
        $(`#${tabId}`).removeClass('d-none');
    });

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

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

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

    async function loadBookings() {
        loadTableData('bookings', '#bookingTableBody', booking => {
            $('#bookingTableBody').append(`
                <tr>
                    <td>${booking.BookingDate}</td>
                    <td>${booking.Customer}</td>
                    <td>${booking.Car}</td>
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

    async function loadCustomers() {
        loadTableData('customers', '#customerTableBody', customer => {
            $('#customerTableBody').append(`
                <tr>
                    <td>${customer.Email}</td>
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

    async function loadEmployees() {
        loadTableData('employees', '#employeeTableBody', employee => {
            $('#employeeTableBody').append(`
                <tr>
                    <td>${employee.Email}</td>
                    <td>${employee.Forename}</td>
                    <td>${employee.Surname}</td>
                    <td>${formatDate(employee.DateOfBirth)}</td>
                    <td>${employee.Gender}</td>
                    <td>${employee.Phone}</td>
                    <td>
                        <button class="btn btn-warning btn-sm edit-employee" data-id="${employee.id}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-employee" data-id="${employee.id}">Delete</button>
                    </td>
                </tr>
            `);
        });
    }

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
                await fetch(`${apiUrl}/employees/${employeeId}`, { method: 'DELETE' });
                loadEmployees();
            } catch (error) {
                console.error('Error deleting employee:', error);
            }
        }
    });

    const currentTab = sessionStorage.getItem('currentTab');
    if (currentTab) {
        $(`#${currentTab}`).click();
        sessionStorage.removeItem('currentTab');
    } else {
        loadBookings();
        loadVehicles();
        loadCustomers();
        loadEmployees();
    }
});
