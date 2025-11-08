from flask import Blueprint, render_template
from . import create_app

app = create_app()

@app.route('/')
def main():
    return render_template('main.html')

@app.route('/index')
def index():
    return render_template('index.html')