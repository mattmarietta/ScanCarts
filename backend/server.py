from flask import Flask, request, jsonify
import requests
import os
import base64
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()


app = Flask(__name__)
CORS(app)

# Set your Google API Key (Use environment variable for security)
API_KEY = os.environ.get("API_KEY")  # Ensure you set this in your environment
VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate"

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Check if file is allowed (We check the file extensions it has)
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Ensure uploads folder exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")

@app.route('/')
def home():
    return "Welcome to Scan Cart!"

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Save the image temporarily
        file_path = os.path.join("uploads", file.filename)
        file.save(file_path)

        # Convert the image to base64 format
        with open(file_path, 'rb') as image_file:
            image_content = base64.b64encode(image_file.read()).decode('utf-8')
        
        # Prepare the request payload for the Vision API
        request_data = {
            "requests": [
                {
                    "image": {
                        "content": image_content  # base64 encoding
                    },
                    "features": [
                        {"type": "LABEL_DETECTION", "maxResults": 10},  # Detect objects
                        {"type": "LOGO_DETECTION", "maxResults": 5},  # Detect brand logos
                        {"type": "TEXT_DETECTION", "maxResults": 5}  # Detect text
                    ]
                }
            ]
        }

        # Send the request to the Vision API
        response = requests.post(
            VISION_API_URL,
            params={"key": API_KEY},
            json=request_data
        )

        # Parse the response
        if response.status_code == 200:
            response_data = response.json().get('responses', [{}])[0]

            # Extract labels
            labels = [label['description'] for label in response_data.get('labelAnnotations', [])]

            # Extract logos
            logos = [logo['description'] for logo in response_data.get('logoAnnotations', [])]

            # Extract text
            text = response_data.get('textAnnotations', [])
            extracted_text = text[0]['description'] if text else ""

            return jsonify({'labels': labels, 'logos': logos, 'text': extracted_text}), 200
        else:
            return jsonify({'error': 'Failed to analyze image'}), 500

    return jsonify({'error': 'Invalid file format'}), 400


if __name__ == '__main__':
    app.run(debug=True)
