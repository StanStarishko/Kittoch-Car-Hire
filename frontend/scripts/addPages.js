$(document).ready(async () => {
    const apiUrl = 'https://kittoch-car-hire.onrender.com/api/universalCRUD';
    const urlParams = new URLSearchParams(window.location.search);
    const currentId = urlParams.get('id');
    const currentTab = sessionStorage.getItem('currentTab');
    const modelType = currentTab ? currentTab.replace('tab', '') : 'Employee';

    // Get schema structure from backend
    async function getModelSchema() {
        try {
            const response = await fetch(`${apiUrl}/schema/${modelType}`);
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Failed to load schema');
        } catch (error) {
            console.error('Error loading schema:', error);
            return null;
        }
    }

    // Create form fields based on schema
    function createFormField(fieldName, fieldProps) {
        let fieldHtml = '<div class="form-group">';
        fieldHtml += `<label for="${fieldName}">${fieldName}:</label>`;

        if (fieldProps.type === String) {
            if (fieldName.toLowerCase().includes('password')) {
                fieldHtml += `<input type="password" id="${fieldName}" class="form-control" 
                    ${fieldProps.required ? 'required' : ''}>`;
            } else if (fieldName.toLowerCase().includes('email') || fieldName.endsWith('Id')) {
                fieldHtml += `<input type="email" id="${fieldName}" class="form-control" 
                    ${fieldProps.required ? 'required' : ''}>`;
            } else {
                fieldHtml += `<input type="text" id="${fieldName}" class="form-control" 
                    ${fieldProps.required ? 'required' : ''}>`;
            }
        } else if (fieldProps.type === Date) {
            fieldHtml += `<input type="date" id="${fieldName}" class="form-control" 
                ${fieldProps.required ? 'required' : ''}>`;
        } else if (fieldProps.type === Number) {
            fieldHtml += `<input type="number" id="${fieldName}" class="form-control" 
                ${fieldProps.required ? 'required' : ''}>`;
        }

        fieldHtml += '</div>';
        return fieldHtml;
    }

    // Initialize form
    async function initForm() {
        const schema = await getModelSchema();
        if (!schema) return;

        $('#formTitle').text(currentId ? `Edit ${modelType}` : `New ${modelType}`);
        
        const formFields = Object.entries(schema.paths)
            .filter(([key]) => key !== '__v' && key !== '_id')
            .map(([key, value]) => createFormField(key, value))
            .join('');
        
        $('#formFields').html(formFields);

        if (currentId) {
            loadRecord();
        }
    }

    // Load existing record
    async function loadRecord() {
        try {
            const response = await fetch(`${apiUrl}/${modelType}/${currentId}`);
            if (response.ok) {
                const data = await response.json();
                Object.entries(data).forEach(([key, value]) => {
                    const field = $(`#${key}`);
                    if (field.length) {
                        if (field.attr('type') === 'date') {
                            field.val(value.split('T')[0]);
                        } else {
                            field.val(value);
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error loading record:', error);
            showMessage('Error loading data');
        }
    }

    // Form submission
    $('#universalForm').submit(async (e) => {
        e.preventDefault();

        const formData = {};
        $('#formFields input').each(function() {
            formData[$(this).attr('id')] = $(this).val();
        });

        try {
            const method = currentId ? 'PUT' : 'POST';
            const url = currentId 
                ? `${apiUrl}/${modelType}/${currentId}`
                : `${apiUrl}/${modelType}`;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Record saved successfully');
                
                if (currentId) {
                    // Return to dashboard for edit
                    returnToDashboard();
                } else {
                    // Clear form for new record
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

    // Return to dashboard
    function returnToDashboard() {
        const returnTab = sessionStorage.getItem('currentTab');
        window.location.href = `/frontend/html/dashboard.html${returnTab ? `#${returnTab}` : ''}`;
    }

    // Back button handler
    $('#backButton').click(returnToDashboard);

    // Initialize
    initForm();
});