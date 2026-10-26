"""Entrypoint to run TravelBuddy Flask REST API."""
import os
from app import create_app

env_name = os.environ.get('FLASK_ENV', 'development')
app = create_app(env_name)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '127.0.0.1')
    print(f"Starting TravelBuddy REST API server on http://{host}:{port}/")
    app.run(host=host, port=port, debug=True)
