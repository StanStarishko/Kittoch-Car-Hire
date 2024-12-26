$(document).ready(() => {
    const apiUrl = 'https://kittoch-car-hire.onrender.com/api/universalCRUD';
    let isLoading = false;

    // Helper function to format dates
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

    // Show loading state
    function showLoading(tableBodySelector) {
        const tableBody = $(tableBodySelector);
        tableBody.html('<tr><td colspan="8" class="text-center">Loading...</td></tr>');
    }

    // Show error state
    function showError(tableBodySelector, error) {
        const tableBody = $(tableBodySelector);
        tableBody.html(`<tr><td colspan="8" class="text-center text-danger">Error: ${error}</td></tr>`);
    }

    // Handle navigation tabs with URL state
    function initializeTabs() {
        // Get active tab from URL or sessionStorage
        const urlParams = new URLSearchParams(window.location.search);
        const activeTab = urlParams.get('activeTab') || sessionStorage.getItem('activeTab') || 'tabBooking';
        
        // Activate the correct tab
        $(`#${activeTab}`).click();
        
        // Update URL without reload
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('activeTab', activeTab);
        window.history.pushState({}, '', newUrl);
    }

    $('.nav-link').click(function(e) {
        e.preventDefault();
        const tabId = $(this).attr('id');
        
        // Update UI
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        $('#content > div').addClass('d-none');
        $(`#tabContent${tabId.replace('tab', '')}`).removeClass('d-none');
        
        // Update session storage and URL
        sessionStorage.setItem('activeTab', tabId);
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('activeTab', tabId);
        window.history.pushState({}, '', newUrl);
        
        // Load data for the active tab
        loadDataForTab(tabId);
    });

    // Add buttons handlers
    const collections = {
        'addBooking': 'Booking',
        'addVehicle': 'Vehicle',
        'addCustomer': 'Customer',
        'addEmployee': 'Employee'
    };

    Object.entries(collections).forEach(([buttonId, collection]) => {
        $(`#${buttonId}`).click(() => {
            const activeTab = $('.nav-link.active').attr('id');
            const returnUrl = encodeURIComponent(`${window.location.pathname}?activeTab=${activeTab}`);
            window.location.href = `/frontend/html/addPages.html?collection=${collection}&returnUrl=${returnUrl}`;
        });
    });

    // Action buttons creator
    function createActionButtons(id, collection) {
        return `
            <div class="btn-group">
                <button class="btn btn-link edit-btn" data-id="${id}" data-collection="${collection}">
                    <i class="bi bi-pencil-square" style="color: black"></i>
                </button>
                <button class="btn btn-link delete-btn" data-id="${id}" data-collection="${collection}">
                    <i class="bi bi-x-circle" style="color: red;"></i>
                </button>
            </div>
        `;
    }    

    // Generic data loader
    async function loadTableData(collection, tableBodySelector, createRow) {
        if (isLoading) return;
        isLoading = true;
        showLoading(tableBodySelector);

        try {
            const response = await fetch(`${apiUrl}/${collection}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            const tableBody = $(tableBodySelector);
            tableBody.empty();
            
            if (data.length === 0) {
                tableBody.html('<tr><td colspan="8" class="text-center">No data available</td></tr>');
                return;
            }

            data.forEach(item => createRow(item, tableBody, collection));
        } catch (error) {
            console.error(`Error loading ${collection}:`, error);
            showError(tableBodySelector, error.message);
        } finally {
            isLoading = false;
        }
    }

    // Table data loaders
    const loadBookings = () => loadTableData('Booking', '#bookingTableBody', 
        (booking, tableBody) => {
            tableBody.append(`
                <tr>
                    <td>${formatDate(booking.BookingDate)}</td>
                    <td>${booking.CustomerId}</td>
                    <td>${booking.CarId}</td>
                    <td>${formatDate(booking.StartDate)}</td>
                    <td>${booking.PickupLocation}</td>
                    <td>${formatDate(booking.ReturnDate)}</td>
                    <td>${booking.DropoffLocation}</td>
                    <td>${createActionButtons(booking.BookingId, 'Booking')}</td>
                </tr>
            `);
        }
    );

    const loadVehicles = () => loadTableData('Vehicle', '#vehicleTableBody',
        (vehicle, tableBody) => {
            tableBody.append(`
                <tr>
                    <td>${vehicle.VehicleId.replace('_', ' ')}</td>
                    <td>${vehicle.Passengers}</td>
                    <td>${vehicle.Capacity}</td>
                    <td>${vehicle.Fuel}</td>
                    <td>${vehicle.CostPerDay}</td>
                    <td>${vehicle.Availability}</td>
                    <td>${formatDate(vehicle.AvailabilityDate)}</td>
                    <td>${createActionButtons(vehicle.VehicleId, 'Vehicle')}</td>
                </tr>
            `);
        }
    );

    const loadCustomers = () => loadTableData('Customer', '#customerTableBody',
        (customer, tableBody) => {
            tableBody.append(`
                <tr>
                    <td>${customer.CustomerId}</td>
                    <td>${customer.Forename}</td>
                    <td>${customer.Surname}</td>
                    <td>${formatDate(customer.DateOfBirth)}</td>
                    <td>${customer.Gender}</td>
                    <td>${customer.Phone}</td>
                    <td>${createActionButtons(customer.CustomerId, 'Customer')}</td>
                </tr>
            `);
        }
    );

    const loadEmployees = () => loadTableData('Employee', '#employeeTableBody',
        (employee, tableBody) => {
            tableBody.append(`
                <tr>
                    <td>${employee.EmployeeId}</td>
                    <td>${employee.Forename}</td>
                    <td>${employee.Surname}</td>
                    <td>${formatDate(employee.DateOfBirth)}</td>
                    <td>${employee.Gender}</td>
                    <td>${employee.Phone}</td>
                    <td>${createActionButtons(employee.EmployeeId, 'Employee')}</td>
                </tr>
            `);
        }
    );

    // Load data based on active tab
    function loadDataForTab(tabId) {
        switch(tabId) {
            case 'tabBooking': loadBookings(); break;
            case 'tabVehicle': loadVehicles(); break;
            case 'tabCustomer': loadCustomers(); break;
            case 'tabEmployee': loadEmployees(); break;
        }
    }

    // Handle edit and delete actions
    $(document).on('click', '.edit-btn', function() {
        const id = $(this).data('id');
        const collection = $(this).data('collection');
        const activeTab = $('.nav-link.active').attr('id');
        const returnUrl = encodeURIComponent(`${window.location.pathname}?activeTab=${activeTab}`);
        window.location.href = `/frontend/html/addPages.html?collection=${collection}&id=${id}&returnUrl=${returnUrl}`;
    });

    $(document).on('click', '.delete-btn', async function() {
        const id = $(this).data('id');
        const collection = $(this).data('collection');
        
        if (confirm(`Are you sure you want to delete this ${collection}?`)) {
            try {
                const response = await fetch(`${apiUrl}/${collection}/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error(`Failed to delete ${collection}`);
                
                alert(`${collection} deleted successfully`);
                loadDataForTab($('.nav-link.active').attr('id'));
            } catch (error) {
                console.error('Delete error:', error);
                alert(`Error deleting ${collection}: ${error.message}`);
            }
        }
    });

    // Check for refresh flag
    if (sessionStorage.getItem('dashboardNeedsRefresh') === 'true') {
        sessionStorage.removeItem('dashboardNeedsRefresh');
    }

    // Initialize the dashboard
    initializeTabs();
});