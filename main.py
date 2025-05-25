from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from flask_login import UserMixin, LoginManager
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# CONNECT TO DB
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATA_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
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
    url = db.Column(db.String(255), nullable=False)

    category = db.Column(db.String(100), nullable=True)
    engine_cc = db.Column(db.Integer, nullable=True)
    colour = db.Column(db.String(100), nullable=True)
    fuel_type = db.Column(db.String(100), nullable=True)
    first_reg = db.Column(db.Date, nullable=True)
    created = db.Column(db.String(100), nullable=True)
    euro = db.Column(db.String(100), nullable=True)


class Enquiry(db.Model):
    __tablename__ = 'enquiries'

    enquiry_id = db.Column(db.Integer, primary_key=True)

    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    message = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.today(), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    notes = db.Column(db.Text, nullable=True)

    booking = relationship('Booking', back_populates='Enquiry')

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
    notes = db.Column(db.Text, nullable=True)

    enquiry_id = db.Column(db.Integer, db.ForeignKey('enquiries.enquiry_id'), nullable=True)
    enquiry = relationship('Enquiry', back_populates='bookings')


with app.app_context():
    db.create_all()


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.route('/')
def home():

    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)
