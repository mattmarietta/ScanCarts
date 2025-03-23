import os
import base64
import requests
from openai import OpenAI

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_product_description(label, logo, description):
    # Ensure OpenAI API key is set
    client = OpenAI(api_key='')

    # Construct dynamically in case there is nothing on that portion and then feed it to prompt
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

    #Print the raw response for debugging
    #print("Raw OpenAI Response:", response)

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
        'https://realtime.oxylabs.io/v1/queries',
        auth=(os.getenv('OXYLABS_USERNAME'), os.getenv('OXYLABS_PASSWORD')),
        json=payload
    )

    if response.status_code == 200:
        return response.json()
    else:
        return {'error': 'Failed to fetch product data'}
