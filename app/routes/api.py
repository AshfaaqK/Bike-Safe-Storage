from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from app import db
from app.models import Booking
from app.services.dvla_service import vehicle_lookup

bp = Blueprint('api', __name__, url_prefix='/api')


@bp.route('/bookings/calendar')
def get_calendar_bookings():
    bookings = db.session.execute(db.select(Booking).order_by(Booking.date, Booking.time)).scalars().all()
    
    events = []
    for booking in bookings:
        start_datetime = datetime.combine(booking.date, booking.time)
        end_datetime = start_datetime + timedelta(hours=1)
        
        events.append({
            'id': booking.booking_id,
            'title': f"{booking.booking_type} - {booking.reg}",
            'start': start_datetime.isoformat(),
            'end': end_datetime.isoformat(),
            'className': f'fc-event-{booking.status.lower()}',
            'extendedProps': {
                'customer': f"{booking.first_name} {booking.last_name}",
                'phone': booking.phone,
                'email': booking.email,
                'vehicle': booking.reg,
                'message': booking.message,
                'notes': booking.notes,
                'status': booking.status
            }
        })
    
    return jsonify(events)


@bp.route('/bookings/<int:booking_id>', methods=['PATCH'])
def update_booking(booking_id):
    try:
        data = request.json
        booking = db.session.execute(db.select(Booking).filter_by(booking_id=booking_id)).scalars().first()
        
        if booking:
            booking.status = data.get('status', booking.status)
            booking.notes = data.get('notes', booking.notes)
            db.session.commit()
            
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'error': 'Booking not found'}), 404
            
    except Exception as e:
        db.session.rollback()
        
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/vehicle-lookup', methods=['POST'])
def handle_vehicle_lookup():
    registration = request.json.get('registrationNumber')
    
    return vehicle_lookup(registration)
