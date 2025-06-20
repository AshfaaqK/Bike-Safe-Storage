from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models import User
from app.forms import RegisterForm, LoginForm

bp = Blueprint('auth', __name__)


@bp.route('/register', methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        flash("❌ You are already logged in.", 'danger')
        
        return redirect(url_for('views.home'))
        
    elif db.session.execute(db.select(User)).scalars().first():
        flash("🛑 Forbidden Access. Log in instead.", 'danger')
        
        return redirect(url_for('auth.login'))

    form = RegisterForm()

    if form.validate_on_submit():
        email = request.form.get('email')
        if db.session.execute(db.select(User).filter_by(email=email)).scalars().first():
            flash("❌ You've already signed up with that email, log in instead!", 'warning')
            
            return redirect(url_for('auth.login'))
        
        hash_and_salted_password = generate_password_hash(
            request.form.get('password'),
            method='pbkdf2:sha256',
            salt_length=8
        )
        
        new_user = User(
            email=email,
            password=hash_and_salted_password
        )

        db.session.add(new_user)
        db.session.commit()
        
        login_user(new_user)
        
        flash("✅ You have successfully created an account!", 'success')
        
        return redirect(url_for('views.home'))

    return render_template('register.html', form=form)


@bp.route('/login', methods=["GET", "POST"])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        email = request.form.get('email')
        password = request.form.get('password')
        user = db.session.execute(db.select(User).filter_by(email=email)).scalars().first()

        if not user or not check_password_hash(user.password, password):
            flash("🔒 Login failed - please try again", 'danger')
            
            return redirect(url_for('auth.login'))

        login_user(user)
        
        flash("✅ Successfully logged in.", 'success')
        
        return redirect(url_for('views.home'))

    return render_template('login.html', form=form)


@bp.route('/logout')
def logout():
    logout_user()
    flash("✅ Successfully logged out.", 'success')
    
    return redirect(url_for('views.home'))
