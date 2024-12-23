$(document).ready(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = urlParams.get('id');
    const apiUrl = 'https://kittoch-car-hire.onrender.com/api';

    // Check if editing an existing employee
    if (employeeId) {
        $('#formTitle').text('Edit Employee'); // Update the form title
        $('#backButton').show(); // Show the back button

        try {
            const response = await fetch(`${apiUrl}/employees/${employeeId}`);
            if (response.ok) {
                const employee = await response.json();

                // Populate form fields with employee data
                $('#email').val(employee.EmployeeId).prop('readonly', true); // ID is non-editable
                $('#forename').val(employee.Forename);
                $('#surname').val(employee.Surname);
                $('#gender').val(employee.Gender);
                $('#dob').val(employee.DateOfBirth.split('T')[0]);
                $('#licenceNumber').val(employee.LicenceNumber);
                $('#street').val(employee.Street);
                $('#town').val(employee.Town);
                $('#postcode').val(employee.Postcode);
                $('#phone').val(employee.Phone);
                $('#password').val(employee.Password); // Pre-fill the current password
            } else {
                console.error('Failed to load employee details.');
                $('#registerMessage').text('Failed to load employee details.').addClass('text-danger');
            }
        } catch (error) {
            console.error('Error fetching employee details:', error);
            $('#registerMessage').text('Error loading data.').addClass('text-danger');
        }
    }

    // Back button functionality
    $('#backButton').click(() => {
        localStorage.setItem('refreshEmployees', 'true'); // Set flag to refresh employees
        window.location.href = '/pages/dashboard.html'; // Navigate back to dashboard
    });

    $('#registerForm').submit(async (e) => {
        e.preventDefault();

        const EmployeeId = $('#email').val();
        const Password = $('#password').val(); // Required password field
        const Forename = $('#forename').val();
        const Surname = $('#surname').val();
        const Gender = $('#gender').val();
        const DateOfBirth = $('#dob').val();
        const LicenceNumber = $('#licenceNumber').val();
        const Street = $('#street').val();
        const Town = $('#town').val();
        const Postcode = $('#postcode').val();
        const Phone = $('#phone').val();

        const isEdit = !!employeeId;

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

            if (response.ok) {
                const message = isEdit
                    ? 'Employee updated successfully!'
                    : 'Employee registered successfully!';
                $('#registerMessage')
                    .removeClass('text-danger')
                    .addClass('text-success')
                    .text(message);

                // Set flag and navigate back to dashboard
                localStorage.setItem('refreshEmployees', 'true');
                setTimeout(() => {
                    window.location.href = '/pages/dashboard.html';
                }, 2000);
            } else {
                const errorMessage = await response.json();
                $('#registerMessage').text(errorMessage.error).addClass('text-danger');
            }
        } catch (error) {
            console.error('Error:', error);
            $('#registerMessage').text('Server error. Try again later.').addClass('text-danger');
        }
    });
});
