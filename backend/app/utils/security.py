"""Security and authentication utilities for TravelBuddy."""
import time
import hmac
import hashlib
import base64
import json
from functools import wraps
from flask import request, current_app, g
from werkzeug.security import generate_password_hash, check_password_hash
from .errors import APIError

def hash_password(password: str) -> str:
    """Hashes a password with secure salt."""
    return generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

def verify_password(password: str, hashed: str) -> bool:
    """Verifies a plaintext password against the stored hash."""
    return check_password_hash(hashed, password)

def generate_auth_token(user_id: str) -> str:
    """Generates a secure HMAC-SHA256 signed bearer token."""
    secret = current_app.config['SECRET_KEY'].encode('utf-8')
    payload = {
        'sub': str(user_id),
        'exp': int(time.time()) + (current_app.config.get('TOKEN_EXPIRATION_HOURS', 72) * 3600),
        'iat': int(time.time())
    }
    encoded_payload = base64.urlsafe_b64encode(json.dumps(payload).encode('utf-8')).decode('utf-8').rstrip('=')
    signature = hmac.new(secret, encoded_payload.encode('utf-8'), hashlib.sha256).hexdigest()
    return f"{encoded_payload}.{signature}"

def decode_auth_token(token: str) -> str:
    """Decodes and validates a signed token, returning the user_id."""
    try:
        parts = token.split('.')
        if len(parts) != 2:
            raise APIError("Invalid authorization token format.", status_code=401)

        encoded_payload, signature = parts
        secret = current_app.config['SECRET_KEY'].encode('utf-8')
        expected_sig = hmac.new(secret, encoded_payload.encode('utf-8'), hashlib.sha256).hexdigest()

        if not hmac.compare_digest(signature, expected_sig):
            raise APIError("Token signature validation failed.", status_code=401)

        # Re-add base64 padding if needed
        padding = 4 - (len(encoded_payload) % 4)
        if padding != 4:
            encoded_payload += '=' * padding

        payload_bytes = base64.urlsafe_b64decode(encoded_payload.encode('utf-8'))
        payload = json.loads(payload_bytes.decode('utf-8'))

        if payload.get('exp', 0) < time.time():
            raise APIError("Authorization token has expired. Please log in again.", status_code=401)

        return str(payload['sub'])
    except APIError:
        raise
    except Exception as e:
        raise APIError("Could not decode authorization token.", status_code=401)

def get_token_from_request():
    """Extracts bearer token from Authorization header or session cookie."""
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        return auth_header.split(' ', 1)[1].strip()
    # Also check cookie fallback
    cookie_token = request.cookies.get('tb_token')
    if cookie_token:
        return cookie_token
    return None

def auth_required(f):
    """Decorator requiring valid authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        if not token:
            raise APIError("Authentication required. Please provide a valid Bearer token.", status_code=401)
        
        user_id = decode_auth_token(token)
        g.current_user_id = user_id
        return f(*args, **kwargs)
    return decorated

def optional_auth(f):
    """Decorator extracting authentication if present, without enforcing."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        g.current_user_id = None
        if token:
            try:
                g.current_user_id = decode_auth_token(token)
            except Exception:
                pass
        return f(*args, **kwargs)
    return decorated
