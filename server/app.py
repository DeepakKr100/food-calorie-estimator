from flask import Flask, request, jsonify
from flask_cors import CORS
import os, uuid
import cv2
import numpy as np

from utils.volume_estimation import estimate_volumes_via_gpt4o
from utils.openai_utils import get_food_density
from utils.nutritionix import get_nutrition_info

app = Flask(__name__)
CORS(app)  # enable CORS for all routes

# Load environment variables (if using python-dotenv)
try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/', methods=['GET'])
def home():
    return "Welcome to my Flask app! Use /analyze to POST your image."

@app.route('/analyze', methods=['POST'])
def analyze_image():
    """
    Endpoint to analyze an uploaded food image using GPT‑4o for volume estimation.
    Expects a file field 'image' in the request (multipart/form-data).
    Returns JSON with identified food items and their nutritional info.
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    # 1. Save the uploaded file
    file = request.files['image']
    filename = str(uuid.uuid4()) + "_" + file.filename
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # 2. Read the image with OpenCV
    image = cv2.imdecode(np.fromfile(filepath, dtype=np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        return jsonify({"error": "Invalid image"}), 400

    # 3. Call volume estimation
    volumes_info, raw_response = estimate_volumes_via_gpt4o(image, debug=True)

    if not volumes_info:
        print("DEBUG: response:\n", raw_response)
        return jsonify({
            "error": "No credit card found",
            "gpt4o_response": raw_response
        }), 400

    results = []
    total_cal = total_protein = total_fat = total_carbs = 0.0

    # 5. For each detected food item, get density + nutrition
    for item_info in volumes_info:
        food_name = item_info.get("item", "unknown")
        volume_ml = item_info.get("volume_ml", 0.0)

        #density
        density = get_food_density(food_name)
        if density is None:
            density = 1.0  # fallback

        # Convert volume to weight
        weight_g = volume_ml * density

        # Get detailed nutrition from NutritionIX
        nutrition = get_nutrition_info(food_name, weight_g)
        calories = nutrition.get("calories", 0)
        protein = nutrition.get("protein", 0)
        fat = nutrition.get("fat", 0)
        carbs = nutrition.get("carbs", 0)

        total_cal += calories
        total_protein += protein
        total_fat += fat
        total_carbs += carbs

        results.append({
            "name": nutrition.get("food_name", food_name),
            "volume_ml": volume_ml,
            "weight_g": nutrition.get("serving_weight", weight_g),
            "density": density,
            "calories": calories,
            "protein": protein,
            "fat": fat,
            "carbs": carbs
        })

    # 6. Summaries
    summary = {
        "total_calories": total_cal,
        "total_protein": total_protein,
        "total_fat": total_fat,
        "total_carbs": total_carbs
    }

    return jsonify({"items": results, "summary": summary})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)