from flask import Flask
import os

def create_app():

    template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../Trick or Click"))

    app = Flask(__name__, template_folder=template_dir)
    app.config['SECRET_KEY'] = 'your-secret-key'

    from .routes import bp as routes_bp
    app.register_blueprint(routes_bp)
    
    return app
