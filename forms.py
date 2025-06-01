from flask_wtf import FlaskForm
from wtforms import EmailField, PasswordField, SubmitField, TextAreaField, StringField
from wtforms.validators import InputRequired, Email

class MakeEnquiryForm(FlaskForm):
    message = TextAreaField("Your Message", validators=[InputRequired("Please enter what you are enquiring about.")])

    firstName = StringField("First Name", validators=[InputRequired("Please enter your first name.")])
    lastName = StringField("Last Name", validators=[InputRequired("Please enter your surname.")])
    email = EmailField("Email address", validators=[InputRequired("Please enter your email address."), Email("Please enter a valid email address.")])
    phone = StringField("Phone number", validators=[InputRequired("Please enter your phone number.")])

    submit = SubmitField("Submit Enquiry")


class RegisterForm(FlaskForm):
    email = EmailField("Email address", validators=[InputRequired("Please enter your email address."), Email("Please enter a valid email address.")])
    password = PasswordField("Password", validators=[InputRequired("Please enter your password.")])

    submit = SubmitField("Register")


class LoginForm(FlaskForm):
    email = EmailField("Email address", validators=[InputRequired("Please enter your email address."), Email("Please enter a valid email address.")])
    password = PasswordField("Password", validators=[InputRequired("Please enter your password.")])

    submit = SubmitField("Login")
