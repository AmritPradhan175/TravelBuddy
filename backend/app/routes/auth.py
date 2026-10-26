"""Authentication routes for TravelBuddy."""
from flask import Blueprint, request, jsonify, g
from ..extensions import db
from ..models.user import User, UserPreference
from ..utils.security import (
    hash_password, 
    verify_password, 
    generate_auth_token, 
    auth_required
)
from ..utils.errors import APIError

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registers a new user account."""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()

    if not email or not password or not full_name:
        raise APIError("Full name, email, and password are required.", status_code=400)

    if len(password) < 6:
        raise APIError("Password must be at least 6 characters long.", status_code=400)

    if User.query.filter_by(email=email).first():
        raise APIError("An account with this email address already exists.", status_code=409)

    user = User(
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        home_city=data.get('home_city', 'Bengaluru'),
        avatar_url=data.get('avatar_url')
    )
    db.session.add(user)
    db.session.flush()

    # Create default user preferences
    pref = UserPreference(
        user_id=user.id,
        travel_styles=['Nature', 'Cultural'],
        preferred_regions=['North India', 'South India'],
        default_budget_tier='mid_range',
        currency='INR'
    )
    db.session.add(pref)
    db.session.commit()

    token = generate_auth_token(user.id)
    return jsonify({
        'success': True,
        'message': 'Account registered successfully.',
        'data': {
            'user': user.to_dict(),
            'token': token
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticates user and returns authorization token."""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        raise APIError("Email and password are required.", status_code=400)

    user = User.query.filter_by(email=email).first()
    if not user or not verify_password(password, user.password_hash):
        raise APIError("Invalid email or password. Please try again.", status_code=401)

    token = generate_auth_token(user.id)
    return jsonify({
        'success': True,
        'message': 'Signed in successfully.',
        'data': {
            'user': user.to_dict(),
            'token': token
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@auth_required
def get_me():
    """Returns the authenticated user's profile."""
    user = User.query.get(g.current_user_id)
    if not user:
        raise APIError("User not found.", status_code=404)

    return jsonify({
        'success': True,
        'data': {
            'user': user.to_dict()
        }
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logs out user (client invalidates token)."""
    return jsonify({
        'success': True,
        'message': 'Signed out successfully.'
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Initiates password recovery."""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()

    # Generic success response to avoid email enumeration
    return jsonify({
        'success': True,
        'message': f"If an account exists for {email}, password reset instructions have been sent."
    }), 200
