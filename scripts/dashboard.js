$(document).ready(() => {
    // Tab Navigation
    $('.nav-link').click(function () {
        $('.nav-link').removeClass('active');
        $(this).addClass('active');

        const tabId = $(this).attr('id').replace('tab', 'tabContent');
        $('#content > div').addClass('d-none');
        $(`#${tabId}`).removeClass('d-none');
    });

    // Load Data (Example for Booking, repeat for others)
    async function loadBookings() {
        try {
            const response = await fetch('https://kittoch-car-hire.onrender.com/api/bookings');
            const bookings = await response.json();
            const bookingTableBody = $('#bookingTableBody');
            bookingTableBody.empty();

            bookings.forEach(booking => {
                bookingTableBody.append(`
                    <tr>
                        <td>${booking.id}</td>
                        <td>${booking.customerName}</td>
                        <td>${booking.vehicleInfo}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-booking" data-id="${booking.id}">Edit</button>
                            <button class="btn btn-danger btn-sm delete-booking" data-id="${booking.id}">Delete</button>
                        </td>
                    </tr>
                `);
            });
        } catch (error) {
            console.error('Error loading bookings:', error);
        }
    }

    // Initially load Booking tab
    loadBookings();
});
