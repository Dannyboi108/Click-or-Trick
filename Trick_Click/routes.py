from flask import Blueprint, render_template

bp = Blueprint("main", __name__)

@bp.route('/')
def main():
    return render_template('voting.html')

@bp.route('/index')
def index():
    return render_template('jacko.html')