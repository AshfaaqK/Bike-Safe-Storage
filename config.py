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
    TEST_DVLA_API_KEY = os.getenv('TEST_DVLA_API_KEY')
