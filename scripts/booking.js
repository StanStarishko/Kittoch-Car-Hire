$(document).ready(async () => {
    const bookingTable = $('#bookingTable tbody');

    // Fetch and render all bookings
    async function fetchBookings() {
        try {
            const response = await fetch('https://kittoch-car-hire.onrender.com/api/booking');
            const bookings = await response.json();
            bookingTable.empty();
            bookings.forEach((booking) => {
                bookingTable.append(`
                    <tr>
                        <td>${booking._id}</td>
                        <td>${booking.customerId.forename} ${booking.customerId.surname}</td>
                        <td>${booking.carId.make} ${booking.carId.model}</td>
                        <td>${booking.bookingDate}</td>
                        <td>
                            <button class="btn btn-primary btn-sm edit-btn" data-id="${booking._id}">Edit</button>
                            <button class="btn btn-danger btn-sm delete-btn" data-id="${booking._id}">Delete</button>
                        </td>
                    </tr>
                `);
            });
        } catch (err) {
            console.error('Error fetching bookings:', err);
        }
    }

    // Add Booking
    $('#addBookingForm').submit(async (e) => {
        e.preventDefault();
        const bookingData = {
            customerId: $('#customerId').val(),
            carId: $('#carId').val(),
            bookingDate: $('#bookingDate').val(),
            startDate: $('#startDate').val(),
            startTime: $('#startTime').val(),
            returnDate: $('#returnDate').val(),
            returnTime: $('#returnTime').val(),
            pickupLocation: $('#pickupLocation').val(),
            dropoffLocation: $('#dropoffLocation').val(),
        };

        try {
            const response = await fetch('https://kittoch-car-hire.onrender.com/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });
            if (response.ok) {
                $('#addBookingModal').modal('hide');
                fetchBookings();
            }
        } catch (err) {
            console.error('Error adding booking:', err);
        }
    });

    // Edit Booking
    bookingTable.on('click', '.edit-btn', async function () {
        const bookingId = $(this).data('id');
        try {
            const response = await fetch(`https://kittoch-car-hire.onrender.com/api/booking/${bookingId}`);
            const booking = await response.json();

            $('#editCustomerId').val(booking.customerId);
            $('#editCarId').val(booking.carId);
            $('#editBookingDate').val(booking.bookingDate);

            $('#editBookingModal').modal('show');

            $('#editBookingForm').off('submit').submit(async (e) => {
                e.preventDefault();

                const updatedData = {
                    customerId: $('#editCustomerId').val(),
                    carId: $('#editCarId').val(),
                    bookingDate: $('#editBookingDate').val(),
                };

                try {
                    const response = await fetch(`https://kittoch-car-hire.onrender.com/api/booking/${bookingId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedData),
                    });
                    if (response.ok) {
                        $('#editBookingModal').modal('hide');
                        fetchBookings();
                    }
                } catch (err) {
                    console.error('Error updating booking:', err);
                }
            });
        } catch (err) {
            console.error('Error fetching booking details:', err);
        }
    });

    // Delete Booking
    bookingTable.on('click', '.delete-btn', async function () {
        const bookingId = $(this).data('id');
        if (confirm('Are you sure you want to delete this booking?')) {
            try {
                const response = await fetch(`https://kittoch-car-hire.onrender.com/api/booking/${bookingId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    fetchBookings();
                }
            } catch (err) {
                console.error('Error deleting booking:', err);
            }
        }
    });

    // Initial fetch
    fetchBookings();
});
