from flask_wtf import FlaskForm, RecaptchaField
from wtforms import EmailField, PasswordField, SubmitField, TextAreaField, StringField, DateTimeLocalField, SelectField, IntegerField, DateField
from wtforms.validators import InputRequired, Email

VEHICLE_TYPE = [("Motorcycle", "Motorcycle"), ("Scooter", "Scooter")]
TRANSMISSION = [("Manual", "Manual"), ("Automatic", "Automatic")]
CATEGORY = [("None", "None"), ("N", "Category N"), ("S", "Category S")]
FUEL_TYPE = [("Petrol", "PETROL"), ("Diesel", "DIESEL"), ("Electric", "ELECTRICITY")]
STATUS = [("Sale", "For Sale"), ("Due In", "Due In"), ("Sold", "Sold")]
SERVICES = [("Storage", "Storage"), ("Detailing", "Detailing"), ("Service", "Service"), ("Repairs", "Repairs"), ("Transport", "Transport"), ("Other", "Other")]

class AddVehicleForm(FlaskForm):
    vehicle_type = SelectField("Vehicle Type", choices=VEHICLE_TYPE)
    make = StringField("Make", validators=[InputRequired("Please enter the make.")])
    model = StringField("Model", validators=[InputRequired("Please enter the model.")])
    reg = StringField("Registration", validators=[InputRequired("Please enter the registration.")])
    mileage = IntegerField("Mileage", validators=[InputRequired("Please enter the mileage.")])
    transmission = SelectField("Transmission", choices=TRANSMISSION)
    category = SelectField("Category", choices=CATEGORY)
    engine_size = IntegerField("Engine Size")
    colour = StringField("Colour", validators=[InputRequired("Please enter the colour.")])
    fuel_type = SelectField("Fuel Type", choices=FUEL_TYPE)
    first_reg = DateField("First Reg Date")
    created = IntegerField("Year of Manufacture")
    euro = StringField("Euro Status")
    co2_em = IntegerField("CO2 Emissions")
    status = SelectField("Vehicle Status", choices=STATUS)

    submit = SubmitField("Add Vehicle")


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
