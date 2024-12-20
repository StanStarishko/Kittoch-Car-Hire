$('#registerForm').submit(async (e) => {
    e.preventDefault();
    const email = $('#email').val();
    const password = $('#password').val();
    const forename = $('#forename').val();
    const surname = $('#surname').val();
    const gender = $('#gender').val();
    const dob = $('#dob').val();

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, forename, surname, gender, dob }),
        });

        const result = await response.json();

        if (response.ok) {
            window.location.href = '../index.html';
        } else {
            $('#registerMessage').text(result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        $('#registerMessage').text('Server error. Try again later.');
    }
});
