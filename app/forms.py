from flask_wtf import FlaskForm, RecaptchaField
from flask_wtf.file import FileAllowed, MultipleFileField, FileField
from wtforms import EmailField, PasswordField, SubmitField, TextAreaField, StringField, DateTimeLocalField, SelectField, IntegerField, BooleanField
from wtforms.validators import InputRequired, Email, NumberRange

VEHICLE_TYPE = [("Motorcycle", "Motorcycle"), ("Scooter", "Scooter")]
TRANSMISSION = [("Manual", "Manual"), ("Automatic", "Automatic")]
CATEGORY = [("None", "None"), ("N", "Category N"), ("S", "Category S")]
FUEL_TYPE = [("PETROL", "Petrol"), ("DIESEL", "Diesel"), ("ELECTRICITY", "Electric")]
STATUS = [("Sale", "For Sale"), ("Due In", "Due In"), ("Sold", "Sold")]
SERVICES = [("Storage", "Storage"), ("Detailing", "Detailing"), ("Service", "Service"), ("Repairs", "Repairs"), ("Transport", "Transport"), ("Other", "Other")]


class AddVehicleForm(FlaskForm):
    vehicle_type = SelectField("Vehicle Type", choices=VEHICLE_TYPE)
    price = IntegerField("Price", default=0, validators=[InputRequired("Please enter the price or '0' to skip."), NumberRange(min=0, message="Price must be a 0 or higher.")])
    make = StringField("Make", validators=[InputRequired("Please enter the make.")])
    model = StringField("Model", validators=[InputRequired("Please enter the model.")])
    reg = StringField("Registration", validators=[InputRequired("Please enter the registration.")]) 
    mileage = IntegerField("Mileage", validators=[InputRequired("Please enter the mileage.")])
    transmission = SelectField("Transmission", choices=TRANSMISSION)
    category = SelectField("Category", choices=CATEGORY)
    engine_size = IntegerField("Engine Size (cc)", validators=[InputRequired("Please enter the engine size or put 0."), NumberRange(min=0, message="Engine size must be 0 or higher.")])
    colour = StringField("Colour", validators=[InputRequired("Please enter the colour.")])
    fuel_type = SelectField("Fuel Type", choices=FUEL_TYPE)
    first_reg = StringField("Month of First Reg")
    created = IntegerField("Year of Manufacture", validators=[InputRequired("Please enter the year or 0."), NumberRange(min=0, message="Year must be 0 or higher.")])
    euro = StringField("Euro Status")
    co2_em = IntegerField("CO2 Emissions", validators=[InputRequired("Please enter the CO2 Emission or 0."), NumberRange(min=0, message="CO2 Emissions must be 0 or higher.")])
    status = SelectField("Vehicle Status", choices=STATUS)
    
    first_image = FileField("Vehicle Display Image", validators=[FileAllowed(["jpg", "jpeg", "png"], "Only JPEG, JPG or PNG images allowed.")])
    images = MultipleFileField("Other Vehicle Images", validators=[FileAllowed(["jpg", "jpeg", "png"], "Only JPEG, JPG or PNG images allowed.")])
    skip_images = BooleanField("Add Images Later", default=False)

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
