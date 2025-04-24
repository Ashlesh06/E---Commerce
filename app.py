import os
import logging

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix


# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)  # needed for url_for to generate with https

# Configure the database
# Default to SQLite for local development if no DATABASE_URL is provided
database_url = os.environ.get("DATABASE_URL", "mysql://root:password@localhost/ecommerce")

# For local MySQL setup, uncomment the following line and adjust parameters
# database_url = "mysql://username:password@localhost/ecommerce"

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# initialize the app with the extension
db.init_app(app)

with app.app_context():
    # Make sure to import the models here
    import models  # noqa: F401
    
    # Create all tables
    db.create_all()
    
    # Initial data setup if no products exist
    from models import Product, Category
    if Product.query.count() == 0:
        # Create categories
        categories = [
            Category(name="Electronics", slug="electronics"),
            Category(name="Clothing", slug="clothing"),
            Category(name="Books", slug="books"),
            Category(name="Home & Kitchen", slug="home-kitchen")
        ]
        db.session.add_all(categories)
        db.session.commit()
        
        # Create sample products
        electronics = Category.query.filter_by(slug="electronics").first()
        clothing = Category.query.filter_by(slug="clothing").first()
        books = Category.query.filter_by(slug="books").first()
        home = Category.query.filter_by(slug="home-kitchen").first()
        
        products = [
            Product(
                name="Smartphone Pro",
                slug="smartphone-pro",
                price=799.99,
                description="Latest smartphone with advanced features and high-resolution camera.",
                image_url="https://via.placeholder.com/300x300?text=Smartphone",
                stock=100,
                category_id=electronics.id
            ),
            Product(
                name="Laptop Ultra",
                slug="laptop-ultra",
                price=1299.99,
                description="Powerful laptop with high performance and long battery life.",
                image_url="https://via.placeholder.com/300x300?text=Laptop",
                stock=50,
                category_id=electronics.id
            ),
            Product(
                name="Wireless Headphones",
                slug="wireless-headphones",
                price=199.99,
                description="Noise-canceling wireless headphones with premium sound quality.",
                image_url="https://via.placeholder.com/300x300?text=Headphones",
                stock=200,
                category_id=electronics.id
            ),
            Product(
                name="Casual T-Shirt",
                slug="casual-tshirt",
                price=24.99,
                description="Comfortable cotton t-shirt for everyday wear.",
                image_url="https://via.placeholder.com/300x300?text=T-Shirt",
                stock=300,
                category_id=clothing.id
            ),
            Product(
                name="Designer Jeans",
                slug="designer-jeans",
                price=79.99,
                description="Premium quality designer jeans with perfect fit.",
                image_url="https://via.placeholder.com/300x300?text=Jeans",
                stock=150,
                category_id=clothing.id
            ),
            Product(
                name="Best-selling Novel",
                slug="bestselling-novel",
                price=19.99,
                description="Award-winning novel that topped charts for weeks.",
                image_url="https://via.placeholder.com/300x300?text=Novel",
                stock=80,
                category_id=books.id
            ),
            Product(
                name="Coffee Maker",
                slug="coffee-maker",
                price=89.99,
                description="Programmable coffee maker for the perfect brew every morning.",
                image_url="https://via.placeholder.com/300x300?text=Coffee+Maker",
                stock=60,
                category_id=home.id
            ),
            Product(
                name="Non-stick Cookware Set",
                slug="cookware-set",
                price=149.99,
                description="Complete set of non-stick cookware for all your kitchen needs.",
                image_url="https://via.placeholder.com/300x300?text=Cookware",
                stock=40,
                category_id=home.id
            )
        ]
        
        db.session.add_all(products)
        db.session.commit()
        
        app.logger.info("Initial data setup completed")
