import os
from flask import Flask

def create_app():
    app = Flask(__name__, template_folder=os.path.join('Trick or Click'))
    app.config['SECRET_KEY'] = 'your-secret-key'
    
    return app
