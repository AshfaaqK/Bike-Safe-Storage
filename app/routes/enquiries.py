from flask import Blueprint, render_template, redirect, url_for, flash, request
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from app import db
from app.models import Enquiry
from app.forms import MakeEnquiryForm
from app.services.notifications import send_customer_enquiry_confirmation, send_dealer_new_enquiry_notification

bp = Blueprint('enquiries', __name__)


@bp.route('/make-an-enquiry', methods=["GET", "POST"])
def make_enquiry():
    form = MakeEnquiryForm()
    if form.validate_on_submit():
        data = request.form
        raw_phone = data.get('phone')

        new_enquiry = Enquiry(
            message=data.get('message'),
            first_name=data.get('firstName'),
            last_name=data.get('lastName'),
            email=data.get('email'),
            phone=raw_phone.replace(' ', ''),
            created_at=datetime.now().strftime("%d-%m-%y %H:%M"),
            status='Lead'
        )
        db.session.add(new_enquiry)
        db.session.commit()
        
        send_customer_enquiry_confirmation(new_enquiry)
        send_dealer_new_enquiry_notification(new_enquiry)
        
        flash("Enquiry received! ✅ We've sent your details to our team. You'll hear back from us within 24 hours. For urgent matters, call us at 0787 650 2001.", 'success')
        
        return redirect(url_for('enquiries.make_enquiry'))

    return render_template('make_enquiry.html', form=form)


@bp.route('/view-enquiries')
def view_enquiries():
    enquiries = db.session.execute(db.select(Enquiry).order_by(Enquiry.enquiry_id.desc())).scalars().all()
    return render_template('enquiries.html', enquiries=enquiries)


@bp.route('/delete-enquiry/<int:enquiry_id>')
def delete_enquiry(enquiry_id):
    try:
        enquiry = db.session.execute(db.select(Enquiry).filter_by(enquiry_id=enquiry_id)).scalars().first()
        db.session.delete(enquiry)
        db.session.commit()
        
        flash(f'🗑️ Enquiry #{enquiry_id} deleted successfully!', 'success')
        
    except SQLAlchemyError as e:
        db.session.rollback()
        
        flash(f'❌ Failed to delete Enquiry #{enquiry_id}. Error: {str(e)}', 'danger')
        
    return redirect(url_for('enquiries.view_enquiries'))
