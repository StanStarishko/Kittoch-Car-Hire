$('#loginForm').submit(async (e) => {
    e.preventDefault();
    const email = $('#email').val();
    const password = $('#password').val();

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            window.location.href = './dashboard.html';
        } else {
            $('#loginMessage').text(result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        $('#loginMessage').text('Server error. Try again later.');
    }
});
