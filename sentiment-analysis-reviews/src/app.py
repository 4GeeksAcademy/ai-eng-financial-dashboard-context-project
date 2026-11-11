"""
src/app.py — WeLoveReviews Production Inference Pipeline

Loads the pre-trained sentiment model once, runs inference on all 500 reviews,
writes enriched CSV and prints a sentiment breakdown.
"""

import os
import sys
from typing import Tuple

import pandas as pd
from transformers import pipeline

# ---------------------------------------------------------------------------
# 1. Constants — pin the model name so this never silently depends on "latest"
# ---------------------------------------------------------------------------
MODEL_NAME: str = "nlptown/bert-base-multilingual-uncased-sentiment"

# Paths relative to the project root (two levels up from this file)
PROJECT_ROOT: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_PATH: str = os.path.join(PROJECT_ROOT, "data", "raw", "reviews.csv")
OUTPUT_PATH: str = os.path.join(
    PROJECT_ROOT, "data", "processed", "reviews_with_sentiment.csv"
)


# ---------------------------------------------------------------------------
# 2. Mapping helpers
# ---------------------------------------------------------------------------
def stars_to_sentiment(label: str) -> str:
    """Map a Hugging Face label like '5 stars' → 'POSITIVE' / 'NEUTRAL' / 'NEGATIVE'."""
    if not label:
        return "UNKNOWN"
    star = int(str(label).split()[0])
    if star <= 2:
        return "NEGATIVE"
    if star == 3:
        return "NEUTRAL"
    return "POSITIVE"


# ---------------------------------------------------------------------------
# 3. I/O helpers
# ---------------------------------------------------------------------------
def load_reviews(path: str = RAW_PATH) -> pd.DataFrame:
    """Read the raw CSV and return a DataFrame."""
    if not os.path.exists(path):
        print(f"[ERROR] File not found: {path}", file=sys.stderr)
        sys.exit(1)
    df = pd.read_csv(path)
    print(f"[INFO] Loaded {len(df)} reviews from {path}")
    return df


def write_output(df: pd.DataFrame, path: str = OUTPUT_PATH) -> None:
    """Persist the enriched DataFrame as CSV."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_csv(path, index=False)
    print(f"[INFO] Enriched CSV written → {path}")


# ---------------------------------------------------------------------------
# 4. Inference
# ---------------------------------------------------------------------------
def run_inference(df: pd.DataFrame, classifier) -> pd.DataFrame:
    """Loop over every review, predict stars & sentiment, attach confidence."""
    texts = df["review_text"].tolist()
    results = classifier(texts, truncation=True, padding=True)

    predicted_stars = []
    predicted_sentiment = []
    confidence = []

    for r in results:
        label = r["label"]
        score = r["score"]
        predicted_stars.append(int(label.split()[0]))
        predicted_sentiment.append(stars_to_sentiment(label))
        confidence.append(round(score, 4))

    df = df.copy()
    df["predicted_stars"] = predicted_stars
    df["predicted_sentiment"] = predicted_sentiment
    df["confidence"] = confidence
    return df


# ---------------------------------------------------------------------------
# 5. Breakdown
# ---------------------------------------------------------------------------
def print_breakdown(df: pd.DataFrame) -> None:
    """Print a human-readable sentiment breakdown."""
    n = len(df)
    print(f"\n{'='*50}")
    print(f"Total reviews analyzed: {n}")
    print(f"Mean user rating: {df['rating'].mean():.2f} / 5")
    print(f"Mean predicted stars: {df['predicted_stars'].mean():.2f} / 5")
    print()

    print("Sentiment breakdown (from nlptown model):")
    for sentiment in ["POSITIVE", "NEUTRAL", "NEGATIVE"]:
        count = (df["predicted_sentiment"] == sentiment).sum()
        pct = count / n * 100
        print(f"  {sentiment:>10s}: {count:3d} ({pct:5.1f}%)")
    print(f"{'='*50}\n")


# ---------------------------------------------------------------------------
# 6. Main entry point
# ---------------------------------------------------------------------------
def main() -> None:
    print(f"[INFO] Using model: {MODEL_NAME}")

    # Load model ONCE before the inference loop
    classifier = pipeline("text-classification", model=MODEL_NAME)

    # Load data
    df = load_reviews()

    # Run inference
    df = run_inference(df, classifier)

    # Write enriched output
    write_output(df)

    # Print breakdown
    print_breakdown(df)


if __name__ == "__main__":
    main()