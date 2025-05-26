from flask_wtf import FlaskForm
from wtforms import EmailField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Email


class RegisterForm(FlaskForm):
    email = EmailField("Email address", validators=[InputRequired("Please enter your email address."), Email("Please enter a valid email address.")])
    password = PasswordField("Password", validators=[InputRequired("Please enter your password.")])

    submit = SubmitField("Register")


class LoginForm(FlaskForm):
    email = EmailField("Email address", validators=[InputRequired("Please enter your email address."), Email("Please enter a valid email address.")])
    password = PasswordField("Password", validators=[InputRequired("Please enter your password.")])

    submit = SubmitField("Login")
