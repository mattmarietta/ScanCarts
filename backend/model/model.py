import numpy as np

def calculate_average_rating(ratings):
    """Calculate the average rating across platforms."""
    if not ratings:
        return 0
    return np.mean(ratings)

def calculate_review_consistency(ratings):
    """Calculate the standard deviation of ratings to assess consistency."""
    if not ratings:
        return 0
    return np.std(ratings)

def recommend_product(ratings):
    """Recommend a product based on aggregated ratings."""
    average_rating = calculate_average_rating(ratings)
    review_consistency = calculate_review_consistency(ratings)

    # Criteria for recommendation (adjust thresholds as needed)
    if average_rating >= 4.0 and review_consistency <= 0.5:
        return "Based on customer reviews, we recommend this product for you!"
    elif average_rating < 3.0:
        return "Based on customer reviews, we do NOT recommend this product for you."
    else:
        return "Product ratings are mixed. Please read reviews carefully and purchase at your own risk."
