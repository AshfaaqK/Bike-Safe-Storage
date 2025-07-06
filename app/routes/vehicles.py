from flask import Blueprint, flash, render_template, redirect, url_for, current_app, request
import os
from datetime import datetime
from app import db
from app.models import Vehicle, VehicleImage
from app.forms import RegistrationLookUpForm, AddVehicleForm

bp = Blueprint('vehicles', __name__)


@bp.route('/edit_vehicle/<int:vehicle_id>', methods=["GET", "POST"])
def edit_vehicle(vehicle_id):
    vehicle = db.session.execute(db.select(Vehicle).filter_by(vehicle_id=vehicle_id)).scalars().first()
    
    return render_template('edit_vehicle.html', vehicle=vehicle)


@bp.route('/add-stock', methods=["GET", "POST"])
def add_stock():
    lookup_form = RegistrationLookUpForm()
    form = AddVehicleForm(price=0)
    
    if form.validate_on_submit():
        try:
            f_make = form.make.data.upper()
            f_colour = form.colour.data.upper()
            f_euro = form.euro.data.upper()
            f_reg = form.reg.data.upper()
            vehicle = Vehicle(
                vehicle_type=form.vehicle_type.data,
                price=form.price.data,
                make=f_make,
                model=form.model.data,
                reg=f_reg,
                mileage=form.mileage.data,
                trans=form.transmission.data,
                category=form.category.data,
                engine_cc=form.engine_size.data,
                colour=f_colour,
                fuel_type=form.fuel_type.data,
                first_reg=form.first_reg.data,
                created=form.created.data,
                euro=f_euro,
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
            return redirect(url_for('vehicles.add_stock'))
            
        except Exception as e:
            db.session.rollback()
            flash(f'❌ Error adding vehicle: {str(e)}', 'danger')
    
    return render_template('add_stock.html', lookup_form=lookup_form, form=form)
