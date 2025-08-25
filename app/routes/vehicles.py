from flask import Blueprint, flash, render_template, redirect, url_for, current_app, request
from flask_login import login_required
import os
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from app import db
from app.models import Vehicle, VehicleImage
from app.forms import RegistrationLookUpForm, AddVehicleForm
from flask_uploads import IMAGES

bp = Blueprint('vehicles', __name__)


def save_image_file(vehicle_id, image_file, index, is_primary=False):
    """Helper to save uploaded image and add to VehicleImage DB."""
    if not image_file or not getattr(image_file, 'filename', None):
        return None

    # Extract extension and normalize
    ext = os.path.splitext(image_file.filename)[1].lower().lstrip('.')
    if ext not in IMAGES:
        return None  # skip unsupported files

    # Timestamp filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{timestamp}_{index}.jpg"

    vehicle_dir = os.path.join(current_app.config['UPLOADED_IMAGES_DEST'], str(vehicle_id))
    os.makedirs(vehicle_dir, exist_ok=True)

    filepath = os.path.join(vehicle_dir, filename)
    image_file.save(filepath)

    # Create DB record
    vehicle_image = VehicleImage(
        vehicle_id=vehicle_id,
        image_path=f"{vehicle_id}/{filename}",
        is_primary=is_primary
    )
    db.session.add(vehicle_image)
    return filename


@bp.route('/upload_images/<int:vehicle_id>', methods=["POST"])
@login_required
def upload_images(vehicle_id):
    if 'images' not in request.files:
        flash('❗ No files were uploaded', 'danger')
        return redirect(url_for('vehicles.edit_vehicle', vehicle_id=vehicle_id))

    files = request.files.getlist('images')
    if not files or not files[0].filename:
        flash('❗ No files were selected', 'danger')
        return redirect(url_for('vehicles.edit_vehicle', vehicle_id=vehicle_id))

    try:
        vehicle_dir = os.path.join(current_app.config['UPLOADED_IMAGES_DEST'], str(vehicle_id))
        os.makedirs(vehicle_dir, exist_ok=True)

        for i, image in enumerate(files):
            filename = save_image_file(vehicle_id, image, i, is_primary=False)
            if not filename:
                flash(f"❌ Unsupported image skipped: {image.filename}", "danger")

        db.session.commit()
        flash('✅ Images uploaded successfully', 'success')

    except Exception as e:
        db.session.rollback()
        flash(f'❌ Error uploading images: {str(e)}', 'danger')

    return redirect(url_for('vehicles.edit_vehicle', vehicle_id=vehicle_id))


@bp.route('/delete_vehicle/<int:vehicle_id>')
@login_required
def delete_vehicle(vehicle_id):
    try:
        vehicle = db.session.execute(db.select(Vehicle).filter_by(vehicle_id=vehicle_id)).scalars().first()
        db.session.delete(vehicle)
        db.session.commit()
        flash(f'🗑️ Vehicle #{vehicle_id} deleted successfully!', 'success')
    except SQLAlchemyError as e:
        db.session.rollback()
        flash(f'❌ Failed to delete Vehicle #{vehicle_id}. Error: {str(e)}', 'danger')
    return redirect(url_for('views.view_used_vehicles'))


@bp.route('/edit_vehicle/<int:vehicle_id>', methods=["GET", "POST"])
@login_required
def edit_vehicle(vehicle_id):
    vehicle = db.session.execute(db.select(Vehicle).filter_by(vehicle_id=vehicle_id)).scalars().first()

    if not vehicle:
        flash('Vehicle not found', 'danger')
        return redirect(url_for('views.home'))

    form = AddVehicleForm(
        vehicle_type=vehicle.vehicle_type,
        price=vehicle.price,
        make=vehicle.make,
        model=vehicle.model,
        reg=vehicle.reg,
        mileage=vehicle.mileage,
        transmission=vehicle.trans,
        category=vehicle.category,
        engine_size=vehicle.engine_cc,
        colour=vehicle.colour,
        fuel_type=vehicle.fuel_type,
        first_reg=vehicle.first_reg,
        created=vehicle.created,
        euro=vehicle.euro,
        co2_em=vehicle.co2_em,
        status=vehicle.status
    )

    if form.validate_on_submit():
        try:
            vehicle.vehicle_type = form.vehicle_type.data
            vehicle.price = form.price.data
            vehicle.make = form.make.data.upper()
            vehicle.model = form.model.data
            vehicle.reg = form.reg.data.upper()
            vehicle.mileage = form.mileage.data
            vehicle.trans = form.transmission.data
            vehicle.category = form.category.data
            vehicle.engine_cc = form.engine_size.data
            vehicle.colour = form.colour.data.upper()
            vehicle.fuel_type = form.fuel_type.data
            vehicle.first_reg = form.first_reg.data
            vehicle.created = form.created.data
            vehicle.euro = form.euro.data.upper()
            vehicle.co2_em = form.co2_em.data
            vehicle.status = form.status.data

            db.session.commit()
            flash('✅ Vehicle updated successfully!', 'success')
            return redirect(url_for('views.view_vehicle', vehicle_id=vehicle_id))
        except Exception as e:
            db.session.rollback()
            flash(f'❌ Error updating vehicle: {str(e)}', 'danger')

    images = db.session.execute(db.select(VehicleImage).filter_by(vehicle_id=vehicle_id)).scalars().all()
    return render_template('edit_vehicle.html', form=form, vehicle=vehicle, images=images)


@bp.route('/add-stock', methods=["GET", "POST"])
@login_required
def add_stock():
    lookup_form = RegistrationLookUpForm()
    form = AddVehicleForm(price=0, engine_size=0, created=0, co2_em=0)

    is_post = (request.method == "POST")

    # --- PRE-CHECK FILE EXTENSIONS BEFORE VALIDATION ---
    if is_post:
        bad_files = []

        first_image = form.first_image.data
        if first_image and getattr(first_image, 'filename', None):
            ext = os.path.splitext(first_image.filename)[1].lower().lstrip('.')
            if ext not in IMAGES:
                bad_files.append(("Primary image", first_image.filename))

        uploaded_files = request.files.getlist('images')
        for idx, f in enumerate(uploaded_files, start=1):
            if f and getattr(f, 'filename', None):
                ext = os.path.splitext(f.filename)[1].lower().lstrip('.')
                if ext not in IMAGES:
                    bad_files.append((f"Image {idx}", f.filename))

        if bad_files:
            allowed = ", ".join(IMAGES)
            for label, fname in bad_files:
                flash(f"❌ {label} error: Unsupported file type: {fname}. Allowed: {allowed}", "danger")
            return render_template('add_stock.html', lookup_form=lookup_form, form=form, show_vehicle_form=True)

    # --- NORMAL FORM VALIDATION ---
    form_ok = form.validate_on_submit()
    if not form_ok and is_post:
        for field_name, errors in form.errors.items():
            for err in errors:
                flash(f"❌ {field_name}: {err}", "danger")
        return render_template('add_stock.html', lookup_form=lookup_form, form=form, show_vehicle_form=True)

    if form_ok:
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

            # Only process images if skip_images not checked
            if not form.skip_images.data:
                # --- PRIMARY IMAGE ---
                first_image = form.first_image.data
                if first_image and getattr(first_image, 'filename', None):
                    filename = save_image_file(vehicle.vehicle_id, first_image, 0, is_primary=True)
                    if not filename:
                        flash(f"❌ Primary image '{first_image.filename}' unsupported and skipped.", "danger")

                # --- ADDITIONAL IMAGES ---
                for i, image in enumerate(uploaded_files, 1):
                    filename = save_image_file(vehicle.vehicle_id, image, i, is_primary=False)
                    if not filename:
                        flash(f"❌ Image {i} '{image.filename}' unsupported and skipped.", "danger")

            db.session.commit()
            flash('✅ Vehicle added successfully!', 'success')
            return redirect(url_for('vehicles.add_stock'))

        except Exception as e:
            db.session.rollback()
            flash(f'❌ Error adding vehicle: {str(e)}', 'danger')
            return render_template('add_stock.html', lookup_form=lookup_form, form=form, show_vehicle_form=True)

    # Default render for GET
    return render_template('add_stock.html', lookup_form=lookup_form, form=form)
