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

    // Determine if this is an edit or a new registration
    const urlParams = new URLSearchParams(window.location.search);
    const isEdit = urlParams.has('edit') && urlParams.get('edit') === 'true';

    // Determine the referrer (dashboard or index)
    const referrer = urlParams.has('referrer') ? urlParams.get('referrer') : 'index';

    try {
        const apiUrl = isEdit
            ? `https://kittoch-car-hire.onrender.com/api/auth/update/${EmployeeId}`
            : 'https://kittoch-car-hire.onrender.com/api/auth/register';

        const response = await fetch(apiUrl, {
            method: isEdit ? 'PUT' : 'POST',
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
            $('#registerMessage')
                .removeClass('text-danger')
                .addClass('text-success')
                .text(
                    isEdit ? 'Employee updated successfully!' : 'Employee registered successfully!'
                );

            // Redirect based on referrer
            setTimeout(() => {
                const redirectUrl =
                    referrer === 'dashboard'
                        ? '../dashboard.html?tab=employee'
                        : '../index.html';
                window.location.href = redirectUrl;
            }, 2000);
        } else {
            $('#registerMessage').text(result.error); // Show error message
        }
    } catch (error) {
        console.error('Error:', error);
        $('#registerMessage').text('Server error. Try again later.');
    }
});
