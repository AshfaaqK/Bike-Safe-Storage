from flask import Blueprint, render_template, current_app
from flask_uploads import UploadSet, IMAGES
from math import ceil
from app import db
from app.models import Booking, Vehicle

images = UploadSet('images', IMAGES)

bp = Blueprint('views', __name__)


@bp.route('/')
def home():
    
    return render_template('index.html')


@bp.route('/view-vehicle/<int:vehicle_id>')
def view_vehicle(vehicle_id):
    vehicle = db.session.execute(db.select(Vehicle).filter_by(vehicle_id=vehicle_id)).scalars().first()
    
    return render_template('view_vehicle.html', vehicle=vehicle)


@bp.route('/used-vehicles')
def view_used_vehicles():
    vehicles = db.session.execute(db.select(Vehicle).order_by(Vehicle.vehicle_id.desc())).scalars().all()
    
    vehicle_types = db.session.execute(
        db.select(Vehicle.vehicle_type).distinct().order_by(Vehicle.vehicle_type)
        ).scalars().all()
    
    max_price = max([v.price for v in vehicles if v.price is not None] or [0])
    max_mileage = max([v.mileage for v in vehicles if v.mileage is not None] or [0])

    rounded_max_price = ceil(max_price / 1000) * 1000
    rounded_max_mileage = ceil(max_mileage / 1000) * 1000

    return render_template(
        'used_vehicles.html', 
        vehicles=vehicles,
        vehicle_types=vehicle_types,
        max_price=rounded_max_price, 
        max_mileage=rounded_max_mileage
    )


@bp.route('/calendar')
def view_calendar():
    bookings = db.session.execute(db.select(Booking).order_by(Booking.booking_id.desc())).scalars().all()
    
    return render_template('calendar.html', bookings=bookings)
