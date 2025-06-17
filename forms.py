from flask_wtf import FlaskForm, RecaptchaField
from wtforms import EmailField, PasswordField, SubmitField, TextAreaField, StringField, DateTimeLocalField, SelectField
from wtforms.validators import InputRequired, Email

SERVICES = [("Storage", "Storage"), ("Detailing", "Detailing"), ("Service", "Service"), ("Repairs", "Repairs"), ("Transport", "Transport"), ("Other", "Other")]

class RegistrationLookUpForm(FlaskForm):
    registration = StringField('Vehicle Registration', validators=[InputRequired("Please enter a registration.")])


class MakeServiceRequestForm(FlaskForm):
    booking_type = SelectField("Select Your Desired Service", choices=SERVICES)
    message = TextAreaField("Leave a message for us (Optional):")

    firstName = StringField("First Name", validators=[InputRequired("Please enter your first name.")])
    lastName = StringField("Last Name", validators=[InputRequired("Please enter your surname.")])
    email = EmailField("Your E-mail address", validators=[InputRequired("Please enter your email address."), Email("Please enter a valid email address.")])
    phone = StringField("Phone Number", validators=[InputRequired("Please enter your phone number.")])

    reg = StringField("Your Registration", validators=[InputRequired("Please enter your vehicle's registration.")])
    date_time = DateTimeLocalField("Preferred Date & Time:", validators=[InputRequired("Please select your preffered booking date.")], format="%Y-%m-%dT%H:%M")

    recaptcha = RecaptchaField()

    submit = SubmitField("Submit Request")

class MakeEnquiryForm(FlaskForm):
    message = TextAreaField("Leave Your Message", validators=[InputRequired("Please enter what you are enquiring about.")])

    firstName = StringField("First Name", validators=[InputRequired("Please enter your first name.")])
    lastName = StringField("Last Name", validators=[InputRequired("Please enter your surname.")])
    email = EmailField("Your E-mail address", validators=[InputRequired("Please enter your email address."), Email("Please enter a valid email address.")])
    phone = StringField("Phone Number", validators=[InputRequired("Please enter your phone number.")])

    recaptcha = RecaptchaField()

    submit = SubmitField("Submit Enquiry")


class RegisterForm(FlaskForm):
    email = EmailField("Email address", validators=[InputRequired("Please enter your email address."), Email("Please enter a valid email address.")])
    password = PasswordField("Password", validators=[InputRequired("Please enter your password.")])

    submit = SubmitField("Register")


class LoginForm(FlaskForm):
    email = EmailField("Email address", validators=[InputRequired("Please enter your email address."), Email("Please enter a valid email address.")])
    password = PasswordField("Password", validators=[InputRequired("Please enter your password.")])

    submit = SubmitField("Login")
