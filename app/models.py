from app import db
from flask_login import UserMixin
from sqlalchemy.orm import relationship


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
    category = db.Column(db.String(100), nullable=True)
    engine_cc = db.Column(db.Integer, nullable=True)
    colour = db.Column(db.String(100), nullable=True)
    fuel_type = db.Column(db.String(100), nullable=True)
    first_reg = db.Column(db.String(20), nullable=True)
    created = db.Column(db.String(100), nullable=True)
    euro = db.Column(db.String(100), nullable=True)
    co2_em = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(30), nullable=False)
    price = db.Column(db.Integer, nullable=True)
    
    images = db.relationship('VehicleImage', back_populates='vehicle', cascade='all, delete-orphan')


class VehicleImage(db.Model):
    __tablename__ = 'vehicle_images'
    image_id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.vehicle_id'), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    is_primary = db.Column(db.Boolean, default=False, nullable=False)

    vehicle = db.relationship('Vehicle', back_populates='images')
    

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
