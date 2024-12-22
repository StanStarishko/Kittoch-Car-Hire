// Load collections.json and populate dropdowns
async function loadCollections() {
    const response = await fetch('../settings/collections.json');
    return await response.json();
}

// Update collections.json with new values
async function updateCollections(data) {
    await fetch('../settings/collections.json', {
        method: 'POST', // Adjust this based on your server's handling of updates
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

// Populate dropdowns with data from collections.json
async function populateForm() {
    const collections = await loadCollections();

    // Populate make dropdown
    const makeSelect = document.getElementById('make');
    collections.vehicle.make.forEach(make => {
        const option = document.createElement('option');
        option.value = make;
        option.textContent = make;
        makeSelect.appendChild(option);
    });

    // Populate category dropdown
    const categorySelect = document.getElementById('category');
    collections.vehicle.category.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // Populate fuel dropdown
    const fuelSelect = document.getElementById('fuel');
    collections.vehicle.fuel.forEach(fuel => {
        const option = document.createElement('option');
        option.value = fuel;
        option.textContent = fuel;
        fuelSelect.appendChild(option);
    });
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    const collections = await loadCollections();

    const make = document.getElementById('make').value || document.getElementById('makeManual').value;
    const model = document.getElementById('model').value || document.getElementById('modelManual').value;
    const category = document.getElementById('category').value || document.getElementById('categoryManual').value;
    const fuel = document.getElementById('fuel').value;

    // Update collections.json if necessary
    if (!collections.vehicle.make.includes(make)) collections.vehicle.make.push(make);
    if (!collections.vehicle.model[make]) collections.vehicle.model[make] = [];
    if (!collections.vehicle.model[make].includes(model)) collections.vehicle.model[make].push(model);
    if (!collections.vehicle.category.includes(category)) collections.vehicle.category.push(category);

    await updateCollections(collections);

    // Generate VehicleId
    const vehicleId = `${make}_${model}_${category}`.replace(/\s+/g, '_');

    console.log(`New Vehicle Added: ${vehicleId} (${make}, ${model}, ${category}, ${fuel})`);
    alert(`Vehicle added successfully: ${vehicleId}`);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    populateForm();
    document.getElementById('vehicleForm').addEventListener('submit', handleFormSubmit);
});
