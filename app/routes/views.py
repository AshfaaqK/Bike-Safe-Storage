from flask import Blueprint, render_template
from app import db
from app.models import Booking
from app.forms import RegistrationLookUpForm, AddVehicleForm

bp = Blueprint('views', __name__)


@bp.route('/')
def home():
    
    return render_template('index.html')


@bp.route('/calendar')
def view_calendar():
    bookings = db.session.execute(db.select(Booking).order_by(Booking.booking_id.desc())).scalars().all()
    
    return render_template('calendar.html', bookings=bookings)


@bp.route('/view-stock')
def view_stock():
    lookup_form = RegistrationLookUpForm()
    form = AddVehicleForm()
    
    return render_template('inventory.html', lookup_form=lookup_form, form=form)
