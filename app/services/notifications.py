from flask import current_app, render_template
from flask_mail import Mail, Message

mail = Mail()


def init_app(app):
    mail.init_app(app)


def send_email(to, subject, template, **kwargs):
    """Generic email sending function"""
    msg = Message(
        subject,
        sender=current_app.config['MAIL_DEFAULT_SENDER'],
        recipients=[to]
    )
    msg.html = render_template(template, **kwargs)
    
    try:
        mail.send(msg)
        current_app.logger.info(f"Email sent to {to} with subject: {subject}")
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email to {to}: {str(e)}")
        return False


def send_customer_enquiry_confirmation(enquiry):
    """Send confirmation email to customer after enquiry submission"""
    subject = "Thank you for your enquiry"
    template = "emails/enquiry_confirmation.html"
    return send_email(
        enquiry.email,
        subject,
        template,
        enquiry=enquiry
    )


def send_dealer_new_enquiry_notification(enquiry):
    """Send notification to dealer about new enquiry"""
    subject = f"New Enquiry Received - #{enquiry.enquiry_id}"
    template = "emails/dealer_enquiry_notification.html"
    dealer_email = current_app.config['DEALER_EMAIL']
    return send_email(
        dealer_email,
        subject,
        template,
        enquiry=enquiry
    )


def send_customer_booking_confirmation(booking):
    """Send confirmation email to customer after booking submission"""
    subject = "Your Service Booking Request"
    template = "emails/booking_confirmation.html"
    return send_email(
        booking.email,
        subject,
        template,
        booking=booking
    )


def send_dealer_new_booking_notification(booking):
    """Send notification to dealer about new booking"""
    subject = f"New Booking Received - #{booking.booking_id}"
    template = "emails/dealer_booking_notification.html"
    dealer_email = current_app.config['DEALER_EMAIL']
    return send_email(
        dealer_email,
        subject,
        template,
        booking=booking
    )


def send_booking_status_update(booking):
    """Send notification to customer when booking status changes"""
    if booking.status.lower() == 'confirmed':
        subject = "Your Booking Has Been Confirmed"
        template = "emails/booking_confirmed.html"
        return send_email(
            booking.email,
            subject,
            template,
            booking=booking
        )
    return False
