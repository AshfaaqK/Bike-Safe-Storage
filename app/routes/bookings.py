from flask import Blueprint, render_template, redirect, url_for, flash, request
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app import db
from app.models import Booking
from app.forms import MakeServiceRequestForm

bp = Blueprint('bookings', __name__)


@bp.route('/make-service-request', methods=["GET", "POST"])
def service_request():
    form = MakeServiceRequestForm()
    if form.validate_on_submit():
        data = request.form
        date_time = datetime.strptime(data.get('date_time'), '%Y-%m-%dT%H:%M')
        raw_phone = data.get('phone')

        new_booking = Booking(
            booking_type=data.get('booking_type'),
            first_name=data.get('firstName'),
            last_name=data.get('lastName'),
            email=data.get('email'),
            phone=raw_phone.replace(' ', ''),
            reg=data.get('reg').upper(),
            date=date_time.date(),
            time=date_time.time(),
            created_at=datetime.now().strftime("%d-%m-%y %H:%M"),
            status='New',
            message=data.get('message')
        )
        db.session.add(new_booking)
        db.session.commit()
        
        flash("Booking request received! ✅ Our team will contact you within 24 hours to confirm. Check your email (and spam folder) for updates.", 'success')
        
        return redirect(url_for('bookings.service_request'))

    return render_template('make_booking_enquiry.html', form=form)


@bp.route('/view-bookings')
def view_bookings():
    bookings = db.session.execute(db.select(Booking).order_by(Booking.booking_id.desc())).scalars().all()
    
    return render_template('bookings.html', bookings=bookings)


@bp.route('/delete-booking/<int:booking_id>')
def delete_booking(booking_id):
    try:
        booking = db.session.execute(db.select(Booking).filter_by(booking_id=booking_id)).scalars().first()
        db.session.delete(booking)
        db.session.commit()
        
        flash(f'🗑️ Enquiry #{booking_id} deleted successfully!', 'success')
        
    except SQLAlchemyError as e:
        db.session.rollback()
        
        flash(f'❌ Failed to delete Booking #{booking_id}. Error: {str(e)}', 'danger')
        
    return redirect(url_for('bookings.view_bookings'))
