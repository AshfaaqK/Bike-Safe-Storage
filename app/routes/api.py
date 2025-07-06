from flask import Blueprint, jsonify, request, current_app
import os
from datetime import datetime, timedelta
from app import db
from app.models import Booking, Enquiry, Vehicle, VehicleImage
from app.services.dvla_service import vehicle_lookup

bp = Blueprint('api', __name__, url_prefix='/api')


@bp.route('/delete_image/<int:image_id>', methods=["DELETE"])
def delete_image(image_id):
    try:
        image = db.session.execute(db.select(VehicleImage).filter_by(image_id=image_id)).scalars().first()
        
        if not image:
            return {'success': False, 'message': 'Image not found'}, 404
        
        uploaded_images_dest = f"{current_app.config['UPLOADED_IMAGES_DEST']}/"
        
        # Delete file from filesystem
        file_path = os.path.join(
            uploaded_images_dest,
            image.image_path
        )
        
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from database
        db.session.delete(image)
        db.session.commit()
        
        return {'success': True}, 200
    
    except Exception as e:
        db.session.rollback()
        return {'success': False, 'message': str(e)}, 500


@bp.route('/set_primary_image/<int:image_id>', methods=["POST"])
def set_primary_image(image_id):
    try:
        image = db.session.execute(db.select(VehicleImage).filter_by(image_id=image_id)).scalars().first()
        
        if not image:
            return {'success': False, 'message': 'Image not found'}, 404
        
        # First unset any existing primary image
        db.session.execute(
            db.update(VehicleImage)
            .where(VehicleImage.vehicle_id == image.vehicle_id)
            .values(is_primary=False)
        )
        
        # Set this image as primary
        image.is_primary = True
        db.session.commit()
        
        return {'success': True}, 200
    except Exception as e:
        db.session.rollback()
        return {'success': False, 'message': str(e)}, 500


@bp.route('/vehicles/<int:vehicle_id>', methods=['PATCH'])
def update_vehicle(vehicle_id):
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Request must be JSON',
                'message': 'Please send data as application/json'
            }), 400

        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided',
                'message': 'No update data received'
            }), 400

        # Get vehicle from database
        vehicle = db.session.get(Vehicle, vehicle_id)
        if not vehicle:
            return jsonify({
                'success': False,
                'error': 'Vehicle not found',
                'message': f'No vehicle found with ID {vehicle_id}'
            }), 404

        # Update fields with validation
        update_fields = [
            'make', 'model', 'reg', 'vehicle_type', 'mileage', 'price',
            'trans', 'fuel_type', 'engine_cc', 'colour', 'first_reg', 'category',
            'euro', 'co2_em', 'status', 'created'
        ]

        updates = {}
        for field in update_fields:
            if field in data:
                # Basic validation for required fields
                if field in ['make', 'model', 'reg', 'vehicle_type', 'mileage'] and not data[field]:
                    return jsonify({
                        'success': False,
                        'error': f'Missing required field: {field}',
                        'message': f'{field.replace("_", " ").title()} is required'
                    }), 400
                
                # Type conversion for numeric fields
                if field in ['mileage', 'price', 'engine_cc', 'created'] and data[field]:
                    try:
                        data[field] = int(data[field])
                    except ValueError:
                        return jsonify({
                            'success': False,
                            'error': f'Invalid {field} value',
                            'message': f'{field.replace("_", " ").title()} must be a number'
                        }), 400
                
                # Convert specific fields to uppercase
                if field in ['make', 'colour', 'euro', 'reg'] and data[field]:
                    data[field] = data[field].upper()
                
                setattr(vehicle, field, data[field])
                updates[field] = data[field]

        db.session.commit()

        # Prepare response with updated vehicle data
        response_data = {
            'success': True,
            'message': 'Vehicle updated successfully',
            'vehicle': {
                'vehicle_id': vehicle.vehicle_id,
                'make': vehicle.make.capitalize(),
                'model': vehicle.model,
                'reg': vehicle.reg,
                'vehicle_type': vehicle.vehicle_type,
                'mileage': vehicle.mileage,
                'price': vehicle.price,
                'trans': vehicle.trans,
                'fuel_type': vehicle.fuel_type,
                'engine_cc': vehicle.engine_cc,
                'colour': vehicle.colour,
                'first_reg': vehicle.first_reg,
                'category': vehicle.category,
                'created': vehicle.created,
                'status': vehicle.status
            }
        }

        return jsonify(response_data)

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'An unexpected error occurred while updating the vehicle'
        }), 500


@bp.route('/get-enquiry/<int:enquiry_id>', methods=['GET'])
def get_enquiry(enquiry_id):
    enquiry = db.session.execute(db.select(Enquiry).filter_by(enquiry_id=enquiry_id)).scalars().first()

    if enquiry:
        return jsonify({
            'success': True,
            'enquiry': {
                'enquiry_id': enquiry.enquiry_id,
                'first_name': enquiry.first_name,
                'last_name': enquiry.last_name,
                'email': enquiry.email,
                'phone': enquiry.phone,
                'message': enquiry.message,
                'status': enquiry.status,
                'notes': enquiry.notes
            }
        })
    else:
        return jsonify({'success': False, 'error': 'Enquiry not found'}), 404


@bp.route('/enquiries/<int:enquiry_id>', methods=['PATCH'])
def update_enquiry(enquiry_id):
    try:
        data = request.json
        enquiry = db.session.execute(db.select(Enquiry).filter_by(enquiry_id=enquiry_id)).scalars().first()

        if enquiry:
            enquiry.first_name = data.get('first_name', enquiry.first_name)
            enquiry.last_name = data.get('last_name', enquiry.last_name)
            enquiry.phone = data.get('phone', enquiry.phone)
            enquiry.email = data.get('email', enquiry.email)
            enquiry.message = data.get('message', enquiry.message)
            enquiry.status = data.get('status', enquiry.status)
            enquiry.notes = data.get('notes', enquiry.notes)

            db.session.commit()

            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'error': 'Enquiry not found'}), 404

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/get-booking/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    try:
        booking = db.session.execute(db.select(Booking).filter_by(booking_id=booking_id)).scalars().first()
        if not booking:
            return jsonify({'success': False, 'error': 'Booking not found'}), 404
        
        start_dt = datetime.combine(booking.date, booking.time)
        datetime_str = start_dt.strftime('%Y-%m-%dT%H:%M')
        
        booking_data = {
            'booking_id': booking.booking_id,
            'booking_type': booking.booking_type,
            'first_name': booking.first_name,
            'last_name': booking.last_name,
            'email': booking.email,
            'phone': booking.phone,
            'reg': booking.reg,
            'date_time': datetime_str,
            'date': booking.date.strftime('%d-%m-%y'),
            'time': booking.time.strftime('%H:%M'),
            'status': booking.status,
            'message': booking.message,
            'notes': booking.notes,
            'created_at': booking.created_at,
            'enquiry_id': booking.enquiry_id
        }
        
        return jsonify({'success': True, 'booking': booking_data})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


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
                'status': booking.status,
                'type': booking.booking_type
            }
        })
    
    return jsonify(events)


@bp.route('/bookings/<int:booking_id>', methods=['PATCH'])
def update_booking(booking_id):
    try:
        data = request.json
        booking = db.session.execute(db.select(Booking).filter_by(booking_id=booking_id)).scalars().first()
        
        if booking:
            date_time = datetime.strptime(data.get('start'), '%Y-%m-%dT%H:%M')
            
            booking.status = data.get('status', booking.status)
            booking.notes = data.get('notes', booking.notes)
            booking.booking_type = data.get('type', booking.booking_type)
            booking.first_name = data.get('firstName', booking.first_name)
            booking.last_name = data.get('lastName', booking.last_name)
            booking.phone = data.get('phone', booking.phone)
            booking.email = data.get('email', booking.email)
            booking.reg = data.get('vehicle', booking.reg)
            booking.message = data.get('message', booking.message)
            booking.date = date_time.date()
            booking.time = date_time.time()
            
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
