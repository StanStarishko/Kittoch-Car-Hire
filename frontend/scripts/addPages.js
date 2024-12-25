// Utility function to create a form dynamically
function createForm(collectionName, fields) {
    const form = document.createElement("form");
    form.id = `${collectionName}-form`;

    // Add input fields dynamically based on the fields array
    fields.forEach(field => {
        const label = document.createElement("label");
        label.textContent = field;
        label.htmlFor = `${collectionName}-${field}`;

        const input = document.createElement("input");
        input.type = "text";
        input.id = `${collectionName}-${field}`;
        input.name = field;

        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(document.createElement("br")); // Line break for clarity
    });

    // Add submit button
    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = `Add ${collectionName}`;
    form.appendChild(submitButton);

    return form;
}

// Utility function to send data to the API
async function submitFormData(collectionName, data) {
    try {
        const response = await fetch(`https://kittoch-car-hire.onrender.com/api/universalCRUD/${collectionName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Failed to add record: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Record added successfully:", result);
        alert(`Record added to ${collectionName} successfully!`);
    } catch (error) {
        console.error("Error adding record:", error);
        alert("Error adding record. See console for details.");
    }
}

// Function to initialize forms for specified collections
function initializeForms(collections) {
    const container = document.getElementById("forms-container");

    collections.forEach(({ name, fields }) => {
        const form = createForm(name, fields);
        container.appendChild(form);

        // Add event listener for form submission
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            submitFormData(name, data);
        });
    });
}

// Example usage: Specify collections and fields
document.addEventListener("DOMContentLoaded", () => {
    const collections = [
        { name: "Booking", fields: ["customer", "vehicle", "startDate", "endDate"] },
        { name: "Customer", fields: ["name", "email", "phone"] },
        { name: "Employee", fields: ["name", "position", "email"] },
        { name: "Vehicle", fields: ["make", "model", "year", "status"] }
    ];

    initializeForms(collections);
});
