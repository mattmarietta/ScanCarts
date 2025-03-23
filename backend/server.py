from flask import Flask, request, jsonify
import requests
import os
import base64
from flask_cors import CORS
from dotenv import load_dotenv
from pprint import pprint

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load API keys from environment variables
API_KEY = os.environ.get("API_KEY")  # Google Vision API Key
OXYLABS_USERNAME = os.environ.get("OXYLABS_USERNAME")
OXYLABS_PASSWORD = os.environ.get("OXYLABS_PASSWORD")

VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate"
OXYLABS_API_URL = "https://realtime.oxylabs.io/v1/queries"

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
        file_path = os.path.join("uploads", file.filename)
        file.save(file_path)

        with open(file_path, 'rb') as image_file:
            image_content = base64.b64encode(image_file.read()).decode('utf-8')

        request_data = {
            "requests": [
                {
                    "image": {"content": image_content},
                    "features": [
                        {"type": "LABEL_DETECTION", "maxResults": 5},
                        {"type": "LOGO_DETECTION", "maxResults": 3},
                        {"type": "TEXT_DETECTION", "maxResults": 5}
                    ]
                }
            ]
        }

        response = requests.post(
            VISION_API_URL,
            params={"key": API_KEY},
            json=request_data
        )

        if response.status_code == 200:
            response_data = response.json().get('responses', [{}])[0]

            labels = [label['description'] for label in response_data.get('labelAnnotations', [])]
            logos = [logo['description'] for logo in response_data.get('logoAnnotations', [])]
            text = response_data.get('textAnnotations', [])
            extracted_text = text[0]['description'] if text else ""

            search_query = generate_search_query(logos, labels, extracted_text)

            # Pass the search query to Oxylabs
            oxylabs_results = query_oxylabs(search_query)

            return jsonify({
                'labels': labels,
                'logos': logos,
                'text': extracted_text,
                'search_query': search_query,
                'results': oxylabs_results
            }), 200
        else:
            return jsonify({'error': 'Failed to analyze image'}), 500

    return jsonify({'error': 'Invalid file format'}), 400

def generate_search_query(logos, labels, text):
    """Generates a search query for product lookup."""
    query = ""

    if logos:
        query += logos[0] + " "

    if labels:
        query += labels[0] + " "

    if text:
        query += " ".join(text.split()[:5]) 

    return query.strip()

def query_oxylabs(search_query):
    """Uses Oxylabs to get product data from e-commerce platforms."""
    payload = {
        'source': 'amazon_search',
        'parse': True,
        'query': search_query,
        'context': [{'key': 'filter', 'value': 1}]
    }

    response = requests.post(
        OXYLABS_API_URL,
        auth=(OXYLABS_USERNAME, OXYLABS_PASSWORD),
        json=payload
    )

    if response.status_code == 200:
        return response.json()
    else:
        return {'error': 'Failed to fetch product data'}

if __name__ == '__main__':
    app.run(debug=True)
