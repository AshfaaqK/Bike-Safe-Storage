from config import Config
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()
login_manager = LoginManager()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    login_manager.init_app(app)

    from app.models import User

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    from app.routes import api, auth, bookings, enquiries, views
    app.register_blueprint(api.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(bookings.bp)
    app.register_blueprint(enquiries.bp)
    app.register_blueprint(views.bp)

    with app.app_context():
        db.create_all()

    return app
