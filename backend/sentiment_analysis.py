import nltk
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Download the VADER lexicon
nltk.download('vader_lexicon')

def analyze_sentiment(text):
    analyzer = SentimentIntensityAnalyzer()
    sentiment_scores = analyzer.polarity_scores(text)
    compound_score = sentiment_scores['compound']
    if compound_score >= 0.05:
        overall_sentiment = "Positive"
    elif compound_score <= -0.05:
        overall_sentiment = "Negative"
    else:
        overall_sentiment = "Neutral"
    return sentiment_scores, overall_sentiment

if __name__ == "__main__":
    import sys
    text = sys.argv[1]
    sentiment_scores, overall_sentiment = analyze_sentiment(text)
    print(f"Sentiment scores for the text: {text}")
    print(sentiment_scores)
    print(f"Overall Sentiment: {overall_sentiment}")
