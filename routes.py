from flask import render_template, redirect, url_for, flash, request, jsonify, session
from app import app, db
from models import User, Product, Category, Order, OrderItem
from forms import LoginForm, RegisterForm, CheckoutForm, ProfileForm, SearchForm
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, current_user, login_required
import json

# Make helper functions available to templates
@app.context_processor
def utility_processor():
    def get_categories():
        return Category.query.all()
    
    return {
        'get_categories': get_categories
    }

# Home page
@app.route('/')
def index():
    featured_products = Product.query.limit(4).all()
    categories = Category.query.all()
    return render_template('index.html', featured_products=featured_products, categories=categories)

# Products page
@app.route('/products')
def products():
    page = request.args.get('page', 1, type=int)
    category_slug = request.args.get('category')
    search_query = request.args.get('search')
    
    query = Product.query
    
    if category_slug:
        category = Category.query.filter_by(slug=category_slug).first_or_404()
        query = query.filter_by(category_id=category.id)
    
    if search_query:
        query = query.filter(Product.name.like(f'%{search_query}%'))
    
    products = query.paginate(page=page, per_page=12)
    categories = Category.query.all()
    
    return render_template('products.html', products=products, categories=categories, current_category=category_slug, search_query=search_query)

# Product detail page
@app.route('/product/<string:slug>')
def product_detail(slug):
    product = Product.query.filter_by(slug=slug).first_or_404()
    related_products = Product.query.filter_by(category_id=product.category_id).filter(Product.id != product.id).limit(4).all()
    return render_template('product_detail.html', product=product, related_products=related_products)

# Cart page
@app.route('/cart')
def cart():
    return render_template('cart.html')

# Checkout page
@app.route('/checkout', methods=['GET', 'POST'])
def checkout():
    form = CheckoutForm()
    
    if form.validate_on_submit():
        # In a real application, we would process payment here
        
        # For demo purposes, just show success message
        flash('Order placed successfully! Thank you for your purchase.', 'success')
        return redirect(url_for('index'))
    
    return render_template('checkout.html', form=form)

# Login page
@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        
        if user and user.check_password(form.password.data):
            flash('Logged in successfully!', 'success')
            session['user_id'] = user.id
            return redirect(url_for('index'))
        else:
            flash('Login unsuccessful. Please check email and password.', 'danger')
    
    return render_template('login.html', form=form)

# Register page
@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    
    if form.validate_on_submit():
        user = User(
            username=form.username.data,
            email=form.email.data
        )
        user.set_password(form.password.data)
        
        db.session.add(user)
        db.session.commit()
        
        flash('Your account has been created! You can now log in.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html', form=form)

# Logout
@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('You have been logged out.', 'success')
    return redirect(url_for('index'))

# Account page
@app.route('/account')
def account():
    # Check if user is logged in
    user_id = session.get('user_id')
    if not user_id:
        flash('Please log in to access your account.', 'warning')
        return redirect(url_for('login'))
    
    user = User.query.get_or_404(user_id)
    return render_template('account.html', user=user)

# Order history
@app.route('/orders')
def orders():
    # Check if user is logged in
    user_id = session.get('user_id')
    if not user_id:
        flash('Please log in to view your orders.', 'warning')
        return redirect(url_for('login'))
    
    user = User.query.get_or_404(user_id)
    orders = Order.query.filter_by(user_id=user.id).order_by(Order.created_at.desc()).all()
    
    return render_template('orders.html', orders=orders)

# API routes for cart operations
@app.route('/api/products')
def api_products():
    products = Product.query.all()
    result = []
    for product in products:
        result.append({
            'id': product.id,
            'name': product.name,
            'price': product.price,
            'image_url': product.image_url
        })
    return jsonify(result)

@app.route('/api/product/<int:product_id>')
def api_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify({
        'id': product.id,
        'name': product.name,
        'price': product.price,
        'description': product.description,
        'image_url': product.image_url,
        'stock': product.stock,
        'category': product.category.name
    })

@app.route('/api/order', methods=['POST'])
def api_create_order():
    # Check if user is logged in
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Please log in to place an order'}), 401
    
    data = request.json
    
    # Create new order
    new_order = Order(
        user_id=user_id,
        total_amount=data.get('total_amount'),
        shipping_address=data.get('shipping_address'),
        shipping_city=data.get('shipping_city'),
        shipping_state=data.get('shipping_state'),
        shipping_zip=data.get('shipping_zip'),
        shipping_country=data.get('shipping_country'),
        payment_method=data.get('payment_method')
    )
    
    db.session.add(new_order)
    db.session.commit()
    
    # Create order items
    items = data.get('items', [])
    for item in items:
        product = Product.query.get(item.get('product_id'))
        if product:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=product.id,
                quantity=item.get('quantity'),
                price=product.price
            )
            db.session.add(order_item)
            
            # Update product stock
            product.stock -= item.get('quantity')
    
    db.session.commit()
    
    return jsonify({'success': True, 'order_id': new_order.id})

# Error handling
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500
