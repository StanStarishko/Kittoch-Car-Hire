document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://kittoch-car-hire.onrender.com/api/universalCRUD';
    
    // Get the collection name and record ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const collection = urlParams.get('collection');
    const recordId = urlParams.get('id');
    const returnUrl = urlParams.get('returnUrl') || '/frontend/html/dashboard.html';

    // Update form title
    const formTitle = document.getElementById('formTitle');
    formTitle.textContent = recordId ? `Edit ${collection}` : `New ${collection}`;

    // Handle back button
    document.getElementById('backButton').addEventListener('click', function() {
        window.location.href = decodeURIComponent(returnUrl);
    });

    // Function to return to dashboard
    function returnToDashboard() {
        window.location.href = decodeURIComponent(returnUrl);
    }

    // Fetch schema and populate form
    fetch(`${apiUrl}/schema/${collection}`)
        .then(response => response.json())
        .then(schema => {
            const formFields = document.getElementById('formFields');
            
            // Create form fields based on schema
            Object.entries(schema).forEach(([fieldName, field]) => {
                if (fieldName !== '_id' && fieldName !== '__v' && fieldName !== 'createdAt' && fieldName !== 'updatedAt') {
                    const metadata = field.metadata;
                    const div = document.createElement('div');
                    div.className = 'form-group';

                    // Create label
                    const label = document.createElement('label');
                    label.htmlFor = fieldName;
                    label.textContent = metadata.label;
                    div.appendChild(label);

                    // Create input field
                    let input;
                    if (metadata.type === 'select') {
                        input = document.createElement('select');
                        if (metadata.setting) {
                            // Fetch options from settings file if specified
                            fetchOptionsForSelect(input, metadata.setting);
                        }
                    } else if (metadata.type === 'checkbox') {
                        input = document.createElement('input');
                        input.type = 'checkbox';
                    } else {
                        input = document.createElement('input');
                        input.type = metadata.type;
                    }

                    input.id = fieldName;
                    input.name = fieldName;
                    input.className = metadata.type === 'checkbox' ? 'form-check-input' : 'form-control';
                    input.placeholder = metadata.placeholder;
                    input.required = metadata.required;

                    div.appendChild(input);
                    formFields.appendChild(div);
                }
            });

            // If editing, fetch and populate existing data
            if (recordId) {
                fetch(`${apiUrl}/${collection}/${recordId}`)
                    .then(response => response.json())
                    .then(data => {
                        Object.entries(data).forEach(([key, value]) => {
                            const input = document.getElementById(key);
                            if (input) {
                                if (input.type === 'checkbox') {
                                    input.checked = value;
                                } else if (input.type === 'date') {
                                    input.value = new Date(value).toISOString().split('T')[0];
                                } else {
                                    input.value = value;
                                }
                            }
                        });
                    });
            }

            // Handle form submission
            document.getElementById('universalForm').addEventListener('submit', async function(e) {
                e.preventDefault();

                const formData = {};
                const inputs = this.querySelectorAll('input, select');
                inputs.forEach(input => {
                    if (input.type === 'checkbox') {
                        formData[input.name] = input.checked;
                    } else {
                        formData[input.name] = input.value;
                    }
                });

                try {
                    const method = recordId ? 'PUT' : 'POST';
                    const url = recordId 
                        ? `${apiUrl}/${collection}/${recordId}`
                        : `${apiUrl}/${collection}`;

                    const response = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });

                    if (response.ok) {
                        alert('Record saved successfully');
                        if (recordId) {
                            returnToDashboard();
                        } else {
                            $('#universalForm')[0].reset();
                        }
                    } else {
                        const error = await response.json();
                        alert(error.message || 'Error saving data');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Server error. Please try again later.');
                }
            });
        });
});

// Function to fetch options for select fields
async function fetchOptionsForSelect(selectElement, settingPath) {
    try {
        const [filename, path] = settingPath.split('#');
        const response = await fetch(`${apiUrl}/settings/${filename}`);
        const settings = await response.json();
        
        // Navigate to the correct path in the settings object
        const options = path.split('.').reduce((obj, key) => obj[key], settings);
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    } catch (error) {
        console.error('Error fetching options:', error);
    }
}