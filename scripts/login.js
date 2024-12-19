// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/employees/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const result = await response.json();

        if (result.success) {
            window.location.href = './pages/dashboard.html';
        } else {
            document.getElementById('loginMessage').textContent = result.message;
        }
    } catch (error) {
        console.error('Login failed:', error);
        document.getElementById('loginMessage').textContent = 'An error occurred. Please try again.';
    }
});
