from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, PasswordField
from wtforms.validators import InputRequired, Email

class RegisterForm(FlaskForm):
    email = StringField("Email address", [InputRequired("Please enter your email address."), Email()])
    password = PasswordField("Password", [InputRequired("Please enter your password.")])

    submit = SubmitField("Register")