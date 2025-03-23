from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize the Flask app
app = Flask(__name__)
CORS(app)

# Load API keys from environment variables
app.config['API_KEY'] = os.getenv("API_KEY")
app.config['OXYLABS_USERNAME'] = os.getenv("OXYLABS_USERNAME")
app.config['OXYLABS_PASSWORD'] = os.getenv("OXYLABS_PASSWORD")
app.config['OPEN_API_KEY'] = os.getenv("OPENAI_API_KEY")

# Import routes
from routes import *
