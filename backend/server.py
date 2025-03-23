from flask import Flask, request, jsonify
import requests
import os
import base64
from flask_cors import CORS
from dotenv import load_dotenv
from pprint import pprint
import model
from openai import OpenAI


retailers_list = ["amazon_search", "target_search"]
load_dotenv()

app = Flask(__name__)
CORS(app)

# Load API keys from environment variables
API_KEY = os.environ.get("API_KEY")  # Google Vision API Key
OXYLABS_USERNAME = os.environ.get("OXYLABS_USERNAME")
OXYLABS_PASSWORD = os.environ.get("OXYLABS_PASSWORD")
OPEN_API_KEY = os.environ.get("OPENAI_API_KEY")

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

            labels = [label['description'] for label in response_data.get('labelAnnotations', [])] or None
            logos = [logo['description'] for logo in response_data.get('logoAnnotations', [])] or None
            text = response_data.get('textAnnotations', []) or None
            extracted_text = text[0]['description'] if text else ""
                
            label = labels[0] if labels else None
            logo = logos[0] if logos else None
            ai_description = generate_product_description(label, logo, extracted_text)
            print(ai_description)
            search_query = generate_search_query(logos, labels)

            # Pass the search query to Oxylabs
            retailers_info = []
            ratings = []
            for retailer in retailers_list:
                oxylabs_results = query_oxylabs(search_query, retailer)
                if retailer == "amazon_search":
                    for i in range(5):
                        try:
                            title = oxylabs_results["results"][0]["content"]["results"]["organic"][i]["title"]
                            price = oxylabs_results["results"][0]["content"]["results"]["organic"][i]["price"]
                            rating = oxylabs_results["results"][0]["content"]["results"]["organic"][i]["rating"]
                            ratings.append(rating)
                            retailers_info.append({"retailer": retailer, "title": title, "price": price, "rating": rating})
                        except:
                            break
                            
                elif retailer == "target_search":
                    for i in range(5):
                        try:
                            title = oxylabs_results["results"][0]["content"]["results"]["organic"][i]["title"]
                            price = oxylabs_results["results"][0]["content"]["results"]["organic"][i]["price_data"]["price"]
                            rating = oxylabs_results["results"][0]["content"]["results"]["organic"][i]["rating_data"]["score"]
                            ratings.append(rating)
                            retailers_info.append({"retailer": retailer, "title": title, "price": price, "rating": rating})
                        except:
                            break
            

            return jsonify({
                'labels': labels,
                'logos': logos,
                'text': extracted_text,
                'search_query': search_query,
                'results': retailers_info,
                'ai_description': ai_description,
            }), 200
        else:
            return jsonify({'error': 'Failed to analyze image'}), 500

    return jsonify({'error': 'Invalid file format'}), 400

def generate_product_description(label, logo, description):
    # Ensure OpenAI API key is set
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    #Construct dynamically in case there is nothing on that portion and then feed it to prompt
    prompt_parts = []
    if logo:
        prompt_parts.append(f"Logo: {logo}")
    if label:
        prompt_parts.append(f"Label: {label}")
    if description:
        prompt_parts.append(f"Description: {description}")

    if prompt_parts:
        prompt_text = "Here are some details about a product: " + ", ".join(prompt_parts) + ". Provide a generic, non-advertisement description in 1-2 sentences."
    else:
        prompt_text = "Describe a generic product since no specific details were provided."

    # Send the request to OpenAI
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt_text}]
    )

    # Debug: Print the raw response
    print("Raw OpenAI Response:", response)

    # Extract the generated text from the response
    if hasattr(response, "choices") and response.choices:
        return response.choices[0].message.content.strip()
    else:
        return "No description available."


def generate_search_query(logos, labels):
    """Generates a search query for product lookup."""
    query = ""

    if logos:
        query += logos[0] + " "

    if labels:
        query += labels[0] + " "

    return query.strip()

def query_oxylabs(search_query, retailer):
    """Uses Oxylabs to get product data from e-commerce platforms."""
    payload = {
        'source': retailer,
        'parse': True,
        'query': search_query,
    }

    response = requests.request(
        'POST',
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
