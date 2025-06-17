from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from datetime import datetime
from flask_login import UserMixin, LoginManager, login_user, current_user, logout_user ,login_required
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import SQLAlchemyError
from forms import RegisterForm, LoginForm, MakeEnquiryForm, MakeServiceRequestForm, RegistrationLookUpForm
from dotenv import load_dotenv
import requests
import os

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# CONNECT TO DB
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATA_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['RECAPTCHA_USE_SSL'] = True
app.config['RECAPTCHA_PUBLIC_KEY'] = os.getenv('RECAPTCHA_PUBLIC_KEY')
app.config['RECAPTCHA_PRIVATE_KEY'] = os.getenv('RECAPTCHA_PRIVATE_KEY')
app.config['RECAPTCHA_DATA_ATTRS'] = {'theme': 'dark'}
db = SQLAlchemy(app)


login_manager = LoginManager()
login_manager.init_app(app)


class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)


class Vehicle(db.Model):
    __tablename__ = 'vehicles'

    vehicle_id = db.Column(db.Integer, primary_key=True)
    vehicle_type = db.Column(db.String(20), nullable=False)

    make = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    reg = db.Column(db.String(100), nullable=False)
    mileage = db.Column(db.Integer, nullable=False)
    trans = db.Column(db.String(100), nullable=False)
    url = db.Column(db.String(255), nullable=True)

    category = db.Column(db.String(100), nullable=True)
    engine_cc = db.Column(db.Integer, nullable=True)
    colour = db.Column(db.String(100), nullable=True)
    fuel_type = db.Column(db.String(100), nullable=True)
    first_reg = db.Column(db.Date, nullable=True)
    created = db.Column(db.String(100), nullable=True)
    euro = db.Column(db.String(100), nullable=True)
    realDE = db.Column(db.Integer, nullable=True)


class Enquiry(db.Model):
    __tablename__ = 'enquiries'

    enquiry_id = db.Column(db.Integer, primary_key=True)

    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    message = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.String(22), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    notes = db.Column(db.Text, nullable=True)

    booking = relationship('Booking', back_populates='enquiry')


class Booking(db.Model):
    __tablename__ = 'bookings'

    booking_id = db.Column(db.Integer, primary_key=True)
    booking_type = db.Column(db.String(100), nullable=False)

    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    reg = db.Column(db.String(100), nullable=True)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)

    created_at = db.Column(db.String(22), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)

    enquiry_id = db.Column(db.Integer, db.ForeignKey('enquiries.enquiry_id'), nullable=True)
    enquiry = relationship('Enquiry', back_populates='booking')


with app.app_context():
    db.create_all()


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@app.route('/')
def home():

    return render_template('index.html')


@app.route('/api/vehicle-lookup', methods=['POST'])
def vehicle_lookup():
    registration = request.json.get('registration')

    dvla_url = 'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles'

    headers = {
        'x-api-key': os.getenv('DVLA_API_KEY'),
        'Content-Type': 'application/json'
    }

    data = {'registrationNumber': registration}

    try:
        response = requests.post(dvla_url, headers=headers, json=data)
        print(response.json(), response.status_code)

        return jsonify(response.json()), response.status_code
    
    except Exception as e:

        return jsonify({'error': str(e)}), 500


@app.route('/delete-booking/<int:booking_id>')
def delete_booking(booking_id):
    try:
        booking = db.session.execute(db.select(Booking).filter_by(booking_id=booking_id)).scalars().first()
        db.session.delete(booking)
        db.session.commit()

        flash(f'🗑️ Enquiry #{booking_id} deleted successfully!', 'success')

    except SQLAlchemyError as e:
        db.session.rollback()
        flash(f'❌ Failed to delete Booking #{booking_id}. Error: {str(e)}', 'danger')

    return redirect(url_for('view_bookings'))


@app.route('/delete-enquiry/<int:enquiry_id>')
def delete_enquiry(enquiry_id):
    try:
        enquiry = db.session.execute(db.select(Enquiry).filter_by(enquiry_id=enquiry_id)).scalars().first()
        db.session.delete(enquiry)
        db.session.commit()

        flash(f'🗑️ Enquiry #{enquiry_id} deleted successfully!', 'success')

    except SQLAlchemyError as e:
        db.session.rollback()
        flash(f'❌ Failed to delete Enquiry #{enquiry_id}. Error: {str(e)}', 'danger')

    return redirect(url_for('view_enquiries'))


@app.route('/view-stock')
def view_stock():
    form = RegistrationLookUpForm()

    return render_template('inventory.html', form=form)


@app.route('/view-bookings')
def view_bookings():
    bookings = db.session.execute(db.select(Booking).order_by(Booking.booking_id.desc())).scalars().all()

    return render_template('bookings.html', bookings=bookings)


@app.route('/view-enquiries')
def view_enquiries():
    enquiries = db.session.execute(db.select(Enquiry).order_by(Enquiry.enquiry_id.desc())).scalars().all()

    return render_template('enquiries.html', enquiries=enquiries)


@app.route('/make-service-request', methods=["GET", "POST"])
def service_request():
    form = MakeServiceRequestForm()

    if form.validate_on_submit():
        data = request.form

        date_time = data.get('date_time')
        dt_object = datetime.strptime(date_time, '%Y-%m-%dT%H:%M')

        raw_phone = data.get('phone')

        new_booking = Booking()

        new_booking.booking_type = data.get('booking_type')
        new_booking.first_name = data.get('firstName')
        new_booking.last_name = data.get('lastName')
        new_booking.email = data.get('email')
        new_booking.phone = raw_phone.replace(' ', '')
        new_booking.reg = data.get('reg').upper()
        new_booking.date = dt_object.date()
        new_booking.time = dt_object.time()
        new_booking.created_at = datetime.now().strftime("%d-%m-%y %H:%M")
        new_booking.status = 'New'
        new_booking.message = data.get('message')

        db.session.add(new_booking)
        db.session.commit()

        flash("Booking request received! ✅ Our team will contact you within 24 hours to confirm. "  
              "Check your email (and spam folder) for updates.",
              'success'
              )

        return redirect(url_for('service_request'))

    return render_template('make_booking_enquiry.html', form=form)


@app.route('/make-an-enquiry', methods=["GET", "POST"])
def make_enquiry():
    form = MakeEnquiryForm()

    if form.validate_on_submit():
        data = request.form

        raw_phone = data.get('phone')

        new_enquiry = Enquiry()

        new_enquiry.message = data.get('message')
        new_enquiry.first_name = data.get('firstName')
        new_enquiry.last_name = data.get('lastName')
        new_enquiry.email = data.get('email')
        new_enquiry.phone = raw_phone.replace(' ', '')
        new_enquiry.created_at = datetime.now().strftime("%d-%m-%y %H:%M")
        new_enquiry.status = 'Lead'

        db.session.add(new_enquiry)
        db.session.commit()

        flash("Enquiry received! ✅ We’ve sent your details to our team. "
              "You’ll hear back from us within 24 hours. "
              "For urgent matters, call us at 0787 650 2001.",
              'success'
              )

        return redirect(url_for('make_enquiry'))

    return render_template('make_enquiry.html', form=form)


@app.route('/register', methods=["GET", "POST"])
def register():
    if db.session.execute(db.select(User)).scalars().first():
            flash("Forbidden Access. Log in instead.", 'danger')

            return redirect(url_for('login'))

    form = RegisterForm()

    if form.validate_on_submit():
        email = request.form.get('email')

        if db.session.execute(db.select(User).filter_by(email=email)).scalars().first():
            # User already exists
            flash("You've already signed up with that email, log in instead!", 'warning')

            return redirect(url_for('login'))
        
        hash_and_salted_password = generate_password_hash(
            request.form.get('password'),
            method='pbkdf2:sha256',
            salt_length=8
        )
        
        new_user = User()

        new_user.email = email
        new_user.password = hash_and_salted_password

        db.session.add(new_user)
        db.session.commit()

        login_user(new_user)

        flash("You have successfully created an account!", 'success')

        return redirect(url_for('home'))

    return render_template('register.html', form=form)


@app.route('/login', methods=["GET", "POST"])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        email = request.form.get('email')
        password = request.form.get('password')

        user = db.session.execute(db.select(User).filter_by(email=email)).scalars().first()

        if not user:
            flash("That email does not exist.", 'danger')
            return redirect(url_for('login'))

        elif not check_password_hash(user.password, password):
            flash("Email or password is incorrect.", 'danger')
            return redirect(url_for('login'))

        else:
            login_user(user)
            flash("Successfully logged in.", 'success')

            return redirect(url_for('home'))

    return render_template('login.html', form=form)


@app.route('/logout')
def logout():
    logout_user()

    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run(debug=True)
