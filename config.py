from flask_uploads import IMAGES
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATA_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    RECAPTCHA_USE_SSL = True
    RECAPTCHA_PUBLIC_KEY = os.getenv('RECAPTCHA_PUBLIC_KEY')
    RECAPTCHA_PRIVATE_KEY = os.getenv('RECAPTCHA_PRIVATE_KEY')
    RECAPTCHA_DATA_ATTRS = {'theme': 'dark'}
    DVLA_API_KEY = os.getenv('DVLA_API_KEY')
    UPLOADED_IMAGES_DEST = 'app/static/uploads/vehicle_images'
    UPLOADED_IMAGES_URL = '/app/static/uploads/vehicle_images/'
    UPLOADED_IMAGES_ALLOW = IMAGES
    UPLOADS_DEFAULT_DEST = 'app/static/uploads'
    MAIL_SERVER = os.getenv('MAIL_SERVER')
    MAIL_PORT = os.getenv('MAIL_PORT')
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER')
    DEALER_EMAIL = os.getenv('DEALER_EMAIL')
