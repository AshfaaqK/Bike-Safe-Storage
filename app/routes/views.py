from flask import Blueprint, render_template, current_app
from flask_uploads import UploadSet, IMAGES
from app import db
from app.models import Booking, Vehicle

images = UploadSet('images', IMAGES)

bp = Blueprint('views', __name__)


@bp.route('/')
def home():
    
    return render_template('index.html')


@bp.route('/motorcycles')
def view_motorcycles():
    motorcycles = db.session.execute(db.select(Vehicle).filter_by(vehicle_type='Motorcycle').order_by(Vehicle.vehicle_id.desc())).scalars().all()
    
    return render_template('motorcycles.html', motorcycles=motorcycles, image_path=current_app.config['UPLOADED_IMAGES_DEST'])


@bp.route('/calendar')
def view_calendar():
    bookings = db.session.execute(db.select(Booking).order_by(Booking.booking_id.desc())).scalars().all()
    
    return render_template('calendar.html', bookings=bookings)
