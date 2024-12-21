$('#registerForm').submit(async (e) => {
    e.preventDefault();
    
    // Collect form data
    const EmployeeId = $('#email').val(); // Employee email, acts as unique ID
    const Password = $('#password').val(); // Password for the employee account
    const Forename = $('#forename').val(); // First name
    const Surname = $('#surname').val(); // Last name
    const Gender = $('#gender').val(); // Gender selection
    const DateOfBirth = $('#dob').val(); // Date of birth
    const LicenceNumber = $('#licenceNumber').val(); // Driving licence number
    const Street = $('#street').val(); // Street address
    const Town = $('#town').val(); // Town
    const Postcode = $('#postcode').val(); // Postcode
    const Phone = $('#phone').val(); // Phone number

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                EmployeeId,
                Password,
                Forename,
                Surname,
                Gender,
                DateOfBirth,
                LicenceNumber,
                Street,
                Town,
                Postcode,
                Phone,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            // Redirect on successful registration
            window.location.href = '../index.html';
        } else {
            $('#registerMessage').text(result.error); // Show error message
        }
    } catch (error) {
        console.error('Error:', error);
        $('#registerMessage').text('Server error. Try again later.');
    }
});
