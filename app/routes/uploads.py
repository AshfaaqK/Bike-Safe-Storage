from flask import Blueprint, send_from_directory, current_app

bp = Blueprint('uploads', __name__)

@bp.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(
        current_app.config['UPLOADED_IMAGES_DEST'],
        filename
    )
