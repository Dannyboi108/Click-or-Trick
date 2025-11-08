from flask import Blueprint, render_template

bp = Blueprint("main", __name__)

@bp.route('/')
def main():
    return render_template('index.html')

@bp.route('/voting')
def voting():
    return render_template('voting.html')

@bp.route('/jacko')
def jacko():
    return render_template('jacko.html')

@bp.route('/costume')
def costume():
    return render_template('costume.html')  