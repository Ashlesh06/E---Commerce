// Checkout functionality

document.addEventListener('DOMContentLoaded', function() {
    const cart = window.cart;
    
    // Only run on checkout page
    if (!document.querySelector('.checkout-page')) {
        return;
    }
    
    // Display order summary
    const orderSummaryContainer = document.querySelector('.order-summary');
    if (orderSummaryContainer && cart) {
        displayOrderSummary();
    }
    
    // Payment method toggle
    const paymentMethodSelect = document.querySelector('#payment_method');
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', togglePaymentFields);
        // Initialize payment fields visibility
        togglePaymentFields();
    }
    
    // Form validation
    const checkoutForm = document.querySelector('#checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                processOrder();
            }
        });
    }
    
    // Function to display order summary
    function displayOrderSummary() {
        const orderSummaryContainer = document.querySelector('.order-summary');
        const cartItems = cart.cartItems;
        
        if (cartItems.length === 0) {
            // Redirect to cart page if cart is empty
            window.location.href = '/cart';
            return;
        }
        
        let summaryHTML = '<h5 class="mb-3">Order Summary</h5>';
        
        cartItems.forEach(item => {
            summaryHTML += `
                <div class="d-flex justify-content-between mb-2">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `;
        });
        
        // Add subtotal
        summaryHTML += `
            <hr>
            <div class="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>$${cart.cartTotal.toFixed(2)}</span>
            </div>
        `;
        
        // Add shipping (free for demo)
        summaryHTML += `
            <div class="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span>Free</span>
            </div>
        `;
        
        // Add tax (10% for demo)
        const tax = cart.cartTotal * 0.1;
        summaryHTML += `
            <div class="d-flex justify-content-between mb-2">
                <span>Tax (10%)</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
        `;
        
        // Add total
        const total = cart.cartTotal + tax;
        summaryHTML += `
            <hr>
            <div class="d-flex justify-content-between mb-2 fw-bold">
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        `;
        
        orderSummaryContainer.innerHTML = summaryHTML;
        
        // Store total amount in a hidden field
        const totalInput = document.createElement('input');
        totalInput.type = 'hidden';
        totalInput.name = 'total_amount';
        totalInput.value = total.toFixed(2);
        document.querySelector('#checkout-form').appendChild(totalInput);
    }
    
    // Function to toggle payment fields based on selected payment method
    function togglePaymentFields() {
        const paymentMethod = document.querySelector('#payment_method').value;
        const creditCardFields = document.querySelector('.credit-card-fields');
        
        if (creditCardFields) {
            if (paymentMethod === 'credit_card') {
                creditCardFields.style.display = 'block';
            } else {
                creditCardFields.style.display = 'none';
            }
        }
    }
    
    // Function to validate form
    function validateForm() {
        const form = document.querySelector('#checkout-form');
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        // Remove previous error messages
        form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        
        // Validate required fields
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('is-invalid');
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'invalid-feedback';
                errorMessage.textContent = 'This field is required';
                field.parentNode.appendChild(errorMessage);
            }
        });
        
        // Validate email format
        const emailField = form.querySelector('#email');
        if (emailField && emailField.value && !isValidEmail(emailField.value)) {
            isValid = false;
            emailField.classList.add('is-invalid');
            
            const errorMessage = document.createElement('div');
            errorMessage.className = 'invalid-feedback';
            errorMessage.textContent = 'Please enter a valid email address';
            emailField.parentNode.appendChild(errorMessage);
        }
        
        // Validate credit card fields if payment method is credit card
        const paymentMethod = form.querySelector('#payment_method').value;
        if (paymentMethod === 'credit_card') {
            const cardNumber = form.querySelector('#card_number');
            const cardExpiry = form.querySelector('#card_expiry');
            const cardCvv = form.querySelector('#card_cvv');
            
            if (cardNumber && !isValidCardNumber(cardNumber.value)) {
                isValid = false;
                cardNumber.classList.add('is-invalid');
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'invalid-feedback';
                errorMessage.textContent = 'Please enter a valid card number';
                cardNumber.parentNode.appendChild(errorMessage);
            }
            
            if (cardExpiry && !isValidCardExpiry(cardExpiry.value)) {
                isValid = false;
                cardExpiry.classList.add('is-invalid');
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'invalid-feedback';
                errorMessage.textContent = 'Please enter a valid expiry date (MM/YY)';
                cardExpiry.parentNode.appendChild(errorMessage);
            }
            
            if (cardCvv && !isValidCardCvv(cardCvv.value)) {
                isValid = false;
                cardCvv.classList.add('is-invalid');
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'invalid-feedback';
                errorMessage.textContent = 'Please enter a valid CVV code';
                cardCvv.parentNode.appendChild(errorMessage);
            }
        }
        
        return isValid;
    }
    
    // Function to process order
    function processOrder() {
        // In a real application, this would send the order to the server
        // For this demo, we'll just clear the cart and redirect to a success page
        
        const form = document.querySelector('#checkout-form');
        
        // Show loading spinner
        const submitButton = form.querySelector('[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
        submitButton.disabled = true;
        
        // Submit the form
        setTimeout(() => {
            form.submit();
            
            // Clear cart after successful order
            cart.clearCart();
        }, 1500);
    }
    
    // Helper functions for validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidCardNumber(cardNumber) {
        // Very basic validation for demo purposes
        return cardNumber.replace(/\s/g, '').length >= 13;
    }
    
    function isValidCardExpiry(expiry) {
        // Format: MM/YY
        const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        return expiryRegex.test(expiry);
    }
    
    function isValidCardCvv(cvv) {
        // 3 or 4 digits
        const cvvRegex = /^[0-9]{3,4}$/;
        return cvvRegex.test(cvv);
    }
});
