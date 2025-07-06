from config import Config
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_uploads import configure_uploads, IMAGES, UploadSet

db = SQLAlchemy()
login_manager = LoginManager()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    login_manager.init_app(app)
    
    images = UploadSet('images', IMAGES)
    configure_uploads(app, images)

    from app.models import User

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    from app.routes import api, auth, bookings, enquiries, views, vehicles
    app.register_blueprint(api.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(bookings.bp)
    app.register_blueprint(enquiries.bp)
    app.register_blueprint(views.bp)
    app.register_blueprint(vehicles.bp)
    
    @app.template_filter('titlecase_make')
    def titlecase_make_filter(s):
        if not s:
            return s
        # Handle special cases first
        special_cases = {
            'BMW': 'BMW',
            'KTM': 'KTM'
        }
        if s in special_cases:
            return special_cases[s]
        
        # Properly titlecase multi-word makes
        return ' '.join(word.capitalize() for word in s.split())

    with app.app_context():
        db.create_all()

    return app
