$(document).ready(async () => {
    const customerTable = $('#customerTable tbody');

    // Fetch and render all customers
    async function fetchCustomers() {
        try {
            const response = await fetch('https://kittoch-car-hire.onrender.com/api/customer');
            const customers = await response.json();
            customerTable.empty();
            customers.forEach((customer) => {
                customerTable.append(`
                    <tr>
                        <td>${customer._id}</td>
                        <td>${customer.forename} ${customer.surname}</td>
                        <td>${customer.email}</td>
                        <td>${customer.phone}</td>
                        <td>${customer.address.street}, ${customer.address.town}, ${customer.address.postcode}</td>
                        <td>
                            <button class="btn btn-primary btn-sm edit-btn" data-id="${customer._id}">Edit</button>
                            <button class="btn btn-danger btn-sm delete-btn" data-id="${customer._id}">Delete</button>
                        </td>
                    </tr>
                `);
            });
        } catch (err) {
            console.error('Error fetching customers:', err);
        }
    }

    // Add Customer
    $('#addCustomerForm').submit(async (e) => {
        e.preventDefault();
        const customerData = {
            forename: $('#forename').val(),
            surname: $('#surname').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            address: {
                street: $('#street').val(),
                town: $('#town').val(),
                postcode: $('#postcode').val(),
            },
        };

        try {
            const response = await fetch('https://kittoch-car-hire.onrender.com/api/customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData),
            });
            if (response.ok) {
                $('#addCustomerModal').modal('hide');
                fetchCustomers();
            }
        } catch (err) {
            console.error('Error adding customer:', err);
        }
    });

    // Edit Customer
    customerTable.on('click', '.edit-btn', async function () {
        const customerId = $(this).data('id');
        try {
            const response = await fetch(`https://kittoch-car-hire.onrender.com/api/customer/${customerId}`);
            const customer = await response.json();

            $('#editForename').val(customer.forename);
            $('#editSurname').val(customer.surname);
            $('#editEmail').val(customer.email);
            $('#editPhone').val(customer.phone);
            $('#editStreet').val(customer.address.street);
            $('#editTown').val(customer.address.town);
            $('#editPostcode').val(customer.address.postcode);

            $('#editCustomerModal').modal('show');

            $('#editCustomerForm').off('submit').submit(async (e) => {
                e.preventDefault();

                const updatedData = {
                    forename: $('#editForename').val(),
                    surname: $('#editSurname').val(),
                    email: $('#editEmail').val(),
                    phone: $('#editPhone').val(),
                    address: {
                        street: $('#editStreet').val(),
                        town: $('#editTown').val(),
                        postcode: $('#editPostcode').val(),
                    },
                };

                try {
                    const response = await fetch(`https://kittoch-car-hire.onrender.com/api/customer/${customerId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedData),
                    });
                    if (response.ok) {
                        $('#editCustomerModal').modal('hide');
                        fetchCustomers();
                    }
                } catch (err) {
                    console.error('Error updating customer:', err);
                }
            });
        } catch (err) {
            console.error('Error fetching customer details:', err);
        }
    });

    // Delete Customer
    customerTable.on('click', '.delete-btn', async function () {
        const customerId = $(this).data('id');
        if (confirm('Are you sure you want to delete this customer?')) {
            try {
                const response = await fetch(`https://kittoch-car-hire.onrender.com/api/customer/${customerId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    fetchCustomers();
                }
            } catch (err) {
                console.error('Error deleting customer:', err);
            }
        }
    });

    // Initial fetch
    fetchCustomers();
});
