from flask import Flask, request, jsonify
import requests
import os
import base64
from flask_cors import CORS

app = Flask(__name__)

CORS(app)


# Set your Google API Key

API_KEY = os.environ.get("API_KEY")
VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate"

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Check if file is allowed (We check the file extensions it has)
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

#If the uploads folder does not exist, create it
if not os.path.exists("uploads"):
    os.makedirs("uploads")

@app.route('/')
def home():
    return "Welcome to the home page of ScanCart!"

# Define the upload route
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

        # Convert the image to base64 format (Google Vision API expects this)
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
                        {
                            "type": "LABEL_DETECTION",  # You can change this to other types like TEXT_DETECTION or LOGO_DETECTION
                            "maxResults": 10
                        }
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

        # Check if the request was successful
        if response.status_code == 200:
            annotations = response.json().get('responses')[0].get('labelAnnotations', [])
            labels = [label['description'] for label in annotations]

            return jsonify({'labels': labels}), 200
        else:
            return jsonify({'error': 'Failed to analyze image'}), 500

    return jsonify({'error': 'Invalid file format'}), 400


if __name__ == '__main__':
    app.run(debug=True)
