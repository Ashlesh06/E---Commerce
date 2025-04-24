from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField, TextAreaField, SelectField, HiddenField, FloatField
from wtforms.validators import DataRequired, Email, EqualTo, Length, ValidationError


class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Sign In')


class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=64)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Register')


class CheckoutForm(FlaskForm):
    first_name = StringField('First Name', validators=[DataRequired()])
    last_name = StringField('Last Name', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    address = StringField('Address', validators=[DataRequired()])
    city = StringField('City', validators=[DataRequired()])
    state = StringField('State/Province', validators=[DataRequired()])
    zip_code = StringField('ZIP/Postal Code', validators=[DataRequired()])
    country = StringField('Country', validators=[DataRequired()])
    payment_method = SelectField('Payment Method', choices=[
        ('credit_card', 'Credit Card'),
        ('paypal', 'PayPal'),
        ('bank_transfer', 'Bank Transfer')
    ], validators=[DataRequired()])
    card_number = StringField('Card Number')
    card_expiry = StringField('Expiry Date (MM/YY)')
    card_cvv = StringField('CVV')
    submit = SubmitField('Place Order')


class ProfileForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=64)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    first_name = StringField('First Name')
    last_name = StringField('Last Name')
    address = StringField('Address')
    city = StringField('City')
    state = StringField('State/Province')
    zip_code = StringField('ZIP/Postal Code')
    country = StringField('Country')
    phone = StringField('Phone Number')
    submit = SubmitField('Update Profile')


class SearchForm(FlaskForm):
    query = StringField('Search', validators=[DataRequired()])
    submit = SubmitField('Search')
