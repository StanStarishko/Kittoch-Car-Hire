$(document).ready(async () => {
    const vehicleTable = $('#vehicleTable tbody');

    // Fetch and render all vehicles
    async function fetchVehicles() {
        try {
            const response = await fetch('https://kittoch-car-hire.onrender.com/api/vehicle');
            const vehicles = await response.json();
            vehicleTable.empty();
            vehicles.forEach((vehicle) => {
                vehicleTable.append(`
                    <tr>
                        <td>${vehicle._id}</td>
                        <td>${vehicle.make}</td>
                        <td>${vehicle.model}</td>
                        <td>${vehicle.registrationNumber}</td>
                        <td>
                            <button class="btn btn-primary btn-sm edit-btn" data-id="${vehicle._id}">Edit</button>
                            <button class="btn btn-danger btn-sm delete-btn" data-id="${vehicle._id}">Delete</button>
                        </td>
                    </tr>
                `);
            });
        } catch (err) {
            console.error('Error fetching vehicles:', err);
        }
    }

    // Add Vehicle
    $('#addVehicleForm').submit(async (e) => {
        e.preventDefault();
        const vehicleData = {
            make: $('#make').val(),
            model: $('#model').val(),
            registrationNumber: $('#registrationNumber').val(),
        };

        try {
            const response = await fetch('https://kittoch-car-hire.onrender.com/api/vehicle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehicleData),
            });
            if (response.ok) {
                $('#addVehicleModal').modal('hide');
                fetchVehicles();
            }
        } catch (err) {
            console.error('Error adding vehicle:', err);
        }
    });

    // Edit Vehicle
    vehicleTable.on('click', '.edit-btn', async function () {
        const vehicleId = $(this).data('id');
        try {
            const response = await fetch(`https://kittoch-car-hire.onrender.com/api/vehicle/${vehicleId}`);
            const vehicle = await response.json();

            $('#editMake').val(vehicle.make);
            $('#editModel').val(vehicle.model);
            $('#editRegistrationNumber').val(vehicle.registrationNumber);

            $('#editVehicleModal').modal('show');

            $('#editVehicleForm').off('submit').submit(async (e) => {
                e.preventDefault();

                const updatedData = {
                    make: $('#editMake').val(),
                    model: $('#editModel').val(),
                    registrationNumber: $('#editRegistrationNumber').val(),
                };

                try {
                    const response = await fetch(`https://kittoch-car-hire.onrender.com/api/vehicle/${vehicleId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedData),
                    });
                    if (response.ok) {
                        $('#editVehicleModal').modal('hide');
                        fetchVehicles();
                    }
                } catch (err) {
                    console.error('Error updating vehicle:', err);
                }
            });
        } catch (err) {
            console.error('Error fetching vehicle details:', err);
        }
    });

    // Delete Vehicle
    vehicleTable.on('click', '.delete-btn', async function () {
        const vehicleId = $(this).data('id');
        if (confirm('Are you sure you want to delete this vehicle?')) {
            try {
                const response = await fetch(`https://kittoch-car-hire.onrender.com/api/vehicle/${vehicleId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    fetchVehicles();
                }
            } catch (err) {
                console.error('Error deleting vehicle:', err);
            }
        }
    });

    // Initial fetch
    fetchVehicles();
});
