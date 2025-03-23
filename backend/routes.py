from app import app  # Import app from app.py
from flask import request, jsonify
from utils import allowed_file, generate_product_description, generate_search_query, query_oxylabs
import os
import base64
import requests

retailers_list = ["amazon_search", "target_search"]

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
            "https://vision.googleapis.com/v1/images:annotate",
            params={"key": app.config['API_KEY']},
            json=request_data
        )

        if response.status_code == 200:
            response_data = response.json().get('responses', [{}])[0]

            labels = [label['description'] for label in response_data.get('labelAnnotations', [])] or None
            logos = [logo['description'] for logo in response_data.get('logoAnnotations', [])] or None
            text = response_data.get('textAnnotations', []) or None
            labels = [label['description'] for label in response_data.get('labelAnnotations', [])] or None
            logos = [logo['description'] for logo in response_data.get('logoAnnotations', [])] or None
            text = response_data.get('textAnnotations', []) or None
            extracted_text = text[0]['description'] if text else ""
                
            label = labels[0] if labels else None
            logo = logos[0] if logos else None
            ai_description = generate_product_description(label, logo, extracted_text)
            search_query = generate_search_query(logos, labels)

            # Pass the search query to Oxylabs
            retailers_info = []
            ratings = []
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
                'results': retailers_info,
                'ai_description': ai_description,
            }), 200
        else:
            return jsonify({'error': 'Failed to analyze image'}), 500

    return jsonify({'error': 'Invalid file format'}), 400
