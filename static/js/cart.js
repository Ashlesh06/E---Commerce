class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
    }

    addItem(productId, name, price, image, quantity = 1) {
        const existingItem = this.items.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                productId,
                name,
                price,
                image,
                quantity
            });
        }
        
        this.saveCart();
        this.updateCartSummary();
        this.displayAddedToCartMessage(name);
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.productId !== productId);
        this.saveCart();
        this.updateCartSummary();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.productId === productId);
        
        if (item) {
            item.quantity = parseInt(quantity);
            
            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
                this.updateCartSummary();
            }
        }
    }

    calculateTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartSummary();
    }

    updateCartSummary() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const itemCount = this.items.reduce((count, item) => count + item.quantity, 0);
            cartCount.textContent = itemCount;
        }
        
        // Update cart page if we're on it
        this.renderCart();
    }

    renderCart() {
        const cartContainer = document.getElementById('cart-items');
        const cartSummary = document.getElementById('cart-summary');
        
        if (cartContainer && cartSummary) {
            if (this.items.length === 0) {
                cartContainer.innerHTML = '<div class="alert alert-info">Your cart is empty.</div>';
                cartSummary.innerHTML = '';
                return;
            }
            
            // Render cart items
            let cartHTML = '';
            this.items.forEach(item => {
                cartHTML += `
                <div class="card mb-3">
                    <div class="row g-0">
                        <div class="col-md-2">
                            <img src="${item.image}" class="img-fluid rounded-start" alt="${item.name}">
                        </div>
                        <div class="col-md-7">
                            <div class="card-body">
                                <h5 class="card-title">${item.name}</h5>
                                <p class="card-text">Price: $${item.price.toFixed(2)}</p>
                                <div class="d-flex align-items-center">
                                    <label for="quantity-${item.productId}" class="me-2">Quantity:</label>
                                    <input type="number" class="form-control quantity-input" id="quantity-${item.productId}" 
                                        value="${item.quantity}" min="1" style="width: 70px;"
                                        data-product-id="${item.productId}">
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-end">
                                <p class="card-text fw-bold">Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
                                <button class="btn btn-sm btn-danger remove-item" data-product-id="${item.productId}">
                                    <i class="fas fa-trash"></i> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            });
            
            cartContainer.innerHTML = cartHTML;
            
            // Render cart summary
            const total = this.calculateTotal();
            cartSummary.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Order Summary</h5>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Shipping:</span>
                        <span>${total > 50 ? 'Free' : '$5.99'}</span>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between fw-bold mb-3">
                        <span>Total:</span>
                        <span>$${(total > 50 ? total : total + 5.99).toFixed(2)}</span>
                    </div>
                    <a href="/checkout" class="btn btn-primary w-100">Proceed to Checkout</a>
                    <button id="clear-cart" class="btn btn-outline-secondary w-100 mt-2">Clear Cart</button>
                </div>
            </div>
            `;
            
            // Add event listeners
            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = parseInt(e.currentTarget.dataset.productId);
                    this.removeItem(productId);
                });
            });
            
            document.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const productId = parseInt(e.currentTarget.dataset.productId);
                    const quantity = parseInt(e.currentTarget.value);
                    this.updateQuantity(productId, quantity);
                });
            });
            
            document.getElementById('clear-cart')?.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear your cart?')) {
                    this.clearCart();
                }
            });
        }
    }

    displayAddedToCartMessage(productName) {
        // Create toast element
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '11';
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Shopping Cart</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            <i class="fas fa-check-circle text-success me-2"></i>
            ${productName} has been added to your cart.
            <div class="mt-2 pt-2 border-top">
                <a href="/cart" class="btn btn-primary btn-sm">View Cart</a>
                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="toast">Close</button>
            </div>
        </div>
        `;
        
        toastContainer.appendChild(toast);
        document.body.appendChild(toastContainer);
        
        // Initialize and show the toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove from DOM after hiding
        toast.addEventListener('hidden.bs.toast', () => {
            document.body.removeChild(toastContainer);
        });
    }
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add to cart functionality on product pages
    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            const productName = this.dataset.productName;
            const productPrice = parseFloat(this.dataset.productPrice);
            const productImage = this.dataset.productImage;
            const quantity = parseInt(document.getElementById('quantity').value) || 1;
            
            const cart = new ShoppingCart();
            cart.addItem(productId, productName, productPrice, productImage, quantity);
        });
    }
    
    // Initialize cart on every page for the header cart count
    const cart = new ShoppingCart();
    cart.updateCartSummary();
});