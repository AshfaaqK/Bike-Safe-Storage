from flask import Blueprint, render_template, flash, redirect, url_for, current_app, request
from flask_uploads import UploadSet, IMAGES
import os
from datetime import datetime
from app import db
from app.models import Booking, Vehicle, VehicleImage
from app.forms import RegistrationLookUpForm, AddVehicleForm

images = UploadSet('images', IMAGES)

bp = Blueprint('views', __name__)


@bp.route('/')
def home():
    
    return render_template('index.html')


@bp.route('/calendar')
def view_calendar():
    bookings = db.session.execute(db.select(Booking).order_by(Booking.booking_id.desc())).scalars().all()
    
    return render_template('calendar.html', bookings=bookings)


@bp.route('/view-stock', methods=['GET', 'POST'])
def view_stock():
    lookup_form = RegistrationLookUpForm()
    form = AddVehicleForm()
    
    if form.validate_on_submit():
        try:
            vehicle = Vehicle(
                vehicle_type=form.vehicle_type.data,
                make=form.make.data,
                model=form.model.data,
                reg=form.reg.data,
                mileage=form.mileage.data,
                trans=form.transmission.data,
                category=form.category.data,
                engine_cc=form.engine_size.data,
                colour=form.colour.data,
                fuel_type=form.fuel_type.data,
                first_reg=form.first_reg.data,
                created=form.created.data,
                euro=form.euro.data,
                co2_em=form.co2_em.data,
                status=form.status.data
            )
            
            db.session.add(vehicle)
            db.session.flush()
            
            if not form.skip_images.data:
                first_image = form.first_image.data
                uploaded_files = request.files.getlist('images')
                if uploaded_files and uploaded_files[0].filename:
                    vehicle_dir = os.path.join(current_app.config['UPLOADED_IMAGES_DEST'], str(vehicle.vehicle_id))
                    os.makedirs(vehicle_dir, exist_ok=True)
                    
                    if first_image:
                        timestamp = datetime.now().strftime('%Y%m%d_%H%M')
                        first_filename = f"{timestamp}_primary.jpg"
                        first_image.save(os.path.join(vehicle_dir, first_filename))
                        
                        vehicle_image = VehicleImage(
                            vehicle_id=vehicle.vehicle_id,
                            image_path=f"{vehicle.vehicle_id}/{first_filename}",
                            is_primary=True
                        )
                        
                        db.session.add(vehicle_image)
                    
                    for i, image in enumerate(uploaded_files):
                        if image.filename:
                            timestamp = datetime.now().strftime('%Y%m%d_%H%M')
                            filename = f"{timestamp}_{i}.jpg"
                            
                            image.save(os.path.join(vehicle_dir, filename))
                            
                            vehicle_image = VehicleImage(
                                vehicle_id=vehicle.vehicle_id,
                                image_path=f"{vehicle.vehicle_id}/{filename}",
                                is_primary=False
                            )
                            
                            db.session.add(vehicle_image)
                    
                    db.session.commit()
            
            flash('✅ Vehicle added successfully!', 'success')
            return redirect(url_for('views.view_stock'))
            
        except Exception as e:
            db.session.rollback()
            flash(f'❌ Error adding vehicle: {str(e)}', 'danger')
    
    return render_template('inventory.html', lookup_form=lookup_form, form=form)
