// Load collections.json and populate dropdowns
async function loadCollections() {
    const response = await fetch('../settings/collections.json');
    return await response.json();
}

// Populate dropdowns
async function populateCustomersAndVehicles() {
    const collections = await loadCollections();

    // Populate customer dropdown
    const customerSelect = document.getElementById('customer');
    collections.customer.list.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.CustomerId;
        option.textContent = `${customer.Forename} ${customer.Surname} (${customer.DOB})`;
        customerSelect.appendChild(option);
    });

    // Enable vehicle dropdown only after startDate is selected
    document.getElementById('startDate').addEventListener('change', async () => {
        const startDate = document.getElementById('startDate').value;
        const vehicleSelect = document.getElementById('vehicle');
        vehicleSelect.disabled = !startDate;

        if (startDate) {
            // Filter vehicles based on availability
            vehicleSelect.innerHTML = '<option value="">Select a vehicle</option>';
            const availableVehicles = collections.vehicle.list.filter(vehicle => 
                isVehicleAvailable(vehicle.VehicleId, startDate)
            );
            availableVehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.VehicleId;
                option.textContent = `${vehicle.Make} ${vehicle.Model} (${vehicle.Category})`;
                vehicleSelect.appendChild(option);
            });
        }
    });
}

// Check vehicle availability
function isVehicleAvailable(vehicleId, startDate) {
    // Add logic to check availability based on booking dates
    return true; // Placeholder
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const customerId = document.getElementById('customer').value;
    const vehicleId = document.getElementById('vehicle').value;

    const bookingId = `${startDate.replace(/-/g, '')}${customerId}01`; // Adjust logic for sequential ID

    console.log(`New Booking Added: ${bookingId} (${customerId}, ${vehicleId}, ${startDate} - ${endDate})`);
    alert(`Booking added successfully: ${bookingId}`);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    populateCustomersAndVehicles();
    document.getElementById('bookingForm').addEventListener('submit', handleFormSubmit);
});
