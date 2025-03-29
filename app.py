from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Load dataset
df = pd.read_csv("final2.csv")  # Ensure "final2.csv" is in the same folder

# Prepare data for KNN recommendation
new_df = df.drop(["title", "overview"], axis=1)
X = new_df.drop(['movie_id'], axis=1)
Y = new_df['movie_id']

# Train KNN model
model = KNeighborsClassifier(n_neighbors=20, p=2)
model.fit(X, Y)

@app.route('/healthcheck')
def check():
    return "Server is running"

@app.route('/recommend_movies', methods=["POST"])
def get_recommendations():
    data = request.get_json()
    movie_name = data.get("movie_name", "").strip().lower()

    # Convert all movie titles to lowercase and handle missing values
    lower_title = df['title'].fillna("").str.lower()

    # Check if the movie exists
    if movie_name not in lower_title.values:
        return jsonify({"error": f"{movie_name} Movie not found"}), 404

    # Filter the dataset with the matching movie
    df_new = df[lower_title == movie_name]
    
    # Perform KNN to find similar movies
    results = model.kneighbors(df_new.drop(['title', 'overview', 'movie_id'], axis=1), return_distance=False)[0]

    recommended_movies = df.iloc[results][['title', 'overview']].iloc[1:].to_dict(orient="records")

    return jsonify(recommended_movies)


@app.route('/director_related', methods=['POST'])
def recommend_movies_by_director():
    data = request.json
    movie_name = data.get("movie_name", "").strip().lower()

    # Ensure case-insensitive title matching
    lower_title = df['title'].str.lower()

    if movie_name not in lower_title.values:
        return jsonify({"error": f"'{movie_name}' Movie not found"}), 404

    # Get movie details
    df_movie = df[lower_title == movie_name]

    if df_movie.empty:
        return jsonify({"error": "Movie not found"}), 404

    director = df_movie['Director_name'].values[0]

    # Filter movies by the same director
    director_movies = df[df['Director_name'] == director]

    if director_movies.shape[0] <= 1:
        return jsonify({"error": "No other movies found by this director"}), 404

    # Prepare data for KNN (excluding movie_id, title, overview)
    feature_columns = [col for col in director_movies.columns if col not in ['title', 'overview', 'movie_id', 'Director_name']]
    
    director_X = director_movies[feature_columns]
    
    # Ensure that there are at least `n_neighbors` movies for KNN
    n_neighbors = min(5, len(director_movies))  # Set neighbors based on available data

    knn = KNeighborsClassifier(n_neighbors=n_neighbors, p=2)
    knn.fit(director_X, director_movies['movie_id'])

    # Find recommendations for the input movie
    df_new = df_movie[feature_columns]

    results = knn.kneighbors(df_new, return_distance=False)[0]

    recommended_movies = director_movies.iloc[results][['title', 'overview']].iloc[1:].to_dict(orient="records")

    return jsonify(recommended_movies)


if __name__ == '__main__':
    app.run(host="0.0.0.0",debug=True)
