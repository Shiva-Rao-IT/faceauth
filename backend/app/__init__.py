from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize extensions
jwt = JWTManager()
client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_database() # The DB name is in the URI

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max upload size
    
    # Initialize extensions with app
    CORS(app)
    jwt.init_app(app)

    # Import and register blueprints
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    return app