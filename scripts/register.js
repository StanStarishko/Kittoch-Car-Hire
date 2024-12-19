// Handle registration form submission
document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        forename: document.getElementById('forename').value,
        surname: document.getElementById('surname').value,
        gender: document.getElementById('gender').value,
        dob: document.getElementById('dob').value,
    };

    try {
        const response = await fetch('/api/employees/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        const result = await response.json();

        if (result.success) {
            document.getElementById('registerMessage').textContent = 'Registration successful! Please log in.';
            setTimeout(() => (window.location.href = '../index.html'), 2000);
        } else {
            document.getElementById('registerMessage').textContent = result.message;
        }
    } catch (error) {
        console.error('Registration failed:', error);
        document.getElementById('registerMessage').textContent = 'An error occurred. Please try again.';
    }
});
