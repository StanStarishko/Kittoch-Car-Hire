// Load collections.json and populate dropdowns
async function loadCollections() {
    const response = await fetch('../settings/collections.json');
    return await response.json();
}

// Update collections.json with new values
async function updateCollections(data) {
    await fetch('../settings/collections.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

// Populate dropdowns with data from collections.json
async function populateForm() {
    const collections = await loadCollections();

    // Populate gender dropdown
    const genderSelect = document.getElementById('gender');
    collections.customer.gender.forEach(gender => {
        const option = document.createElement('option');
        option.value = gender;
        option.textContent = gender;
        genderSelect.appendChild(option);
    });
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    const collections = await loadCollections();

    const email = document.getElementById('email').value;
    const forename = document.getElementById('forename').value;
    const surname = document.getElementById('surname').value;
    const dob = document.getElementById('dob').value;
    const gender = document.getElementById('gender').value || document.getElementById('genderManual').value;

    // Update collections.json if necessary
    if (!collections.customer.gender.includes(gender)) collections.customer.gender.push(gender);

    await updateCollections(collections);

    console.log(`New Customer Added: ${email} (${forename} ${surname}, DOB: ${dob}, Gender: ${gender})`);
    alert(`Customer added successfully: ${email}`);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    populateForm();
    document.getElementById('customerForm').addEventListener('submit', handleFormSubmit);
});
