from flask import Blueprint, render_template

main = Blueprint('main', __name__)

@main.route('/')
def main():
    return render_template('main.html')

@main.route('/index')
def index():
    return render_template('index.html')