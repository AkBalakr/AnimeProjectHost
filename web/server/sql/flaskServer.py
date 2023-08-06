from flask import Flask, request, jsonify
import pandas as pd
import sqlite3
import json
import pickle
from sklearn.neighbors import NearestNeighbors
import re
import os

from flask_cors import CORS  # Import the CORS extension

app = Flask(__name__)
CORS(app)  # Enable CORS for the entire app, or you can specify origins using CORS(app, resources={r"/getRecs": {"origins": "http://localhost:3000"}})

database = 'animeDatabase.db'
trained_model = 'knn_model.pkl'

# Connect to database and fetch data into Pandas DataFrame
def connect_to_db():
    conn = sqlite3.connect(database)
    tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
    tables = [table[0] for table in tables]
    dataframes = {table: pd.read_sql(f'SELECT * FROM {table}', conn) for table in tables}
    conn.close()
    return dataframes

# Parses the JSON retrieved from the database 
def parse_json(data):
    try:
        return [i['name'] for i in json.loads(data.replace("'", "\""))]
    except:
        return []

# Function to help clean_data
def clean(title):
    if ":" in title: #remove stuff after :
        title = title.split(":", 1)[0].strip()
    if "(" in title: #remove stuff after (
        title = title.split("(", 1)[0].strip()
    return title

# Removes duplicate anime titles from dataframe
def clean_data(dataframe):
    pattern = r':\s+\w+(\s+\w+)*$' # :+more words
    clean_df = dataframe.copy()
    #put back Irene's
    clean_df['clean_title'] = clean_df['title'].str.replace(pattern, '', regex=True).str.strip() #store the 'cleaned' title in clean_title
    clean_df['title_length'] = clean_df['title'].str.len() #new column that has title length
    clean_df.sort_values(by='title_length', ascending=True, inplace=True) #sord by length
    clean_df['clean_title'] = clean_df['clean_title'].apply(clean)
    clean_df.drop_duplicates(subset='clean_title', keep='first', inplace=True) #dont delete the first instance of the cleaned title

    for index, row in clean_df.iterrows():
        clean_title = row['clean_title']
        # clean_title = re.sub(r':.*$', '', title)
        clean_title = re.sub(r'\b\d+\b', '', clean_title) #remove all numbers
        clean_title = re.sub(r':\s+\w+(\s+\w+)*$','', clean_title, flags=re.IGNORECASE) #should remove stuff after : but it doesnt so clean function does it
        clean_title = re.sub(r'\bthe\b', '', clean_title, flags=re.IGNORECASE)
        clean_title = re.sub(r'\bmovie|season|part|\b', '', clean_title, flags=re.IGNORECASE)
        clean_title = re.sub(r'\bmovie|season|part|episode|specials|special|PV|OVA|DVD|TV\b', '', clean_title, flags=re.IGNORECASE)
        clean_title = re.sub(r'\b(?:I{1,3}|IV|V|VI{0,3}|IX|X{1,3}|XL|L|LX{0,3}|XC|C{1,3}|CD|D|DC{0,3}|CM|M{1,3})\b', '', clean_title) #remove roman numeral
        clean_title = re.sub(r'\b2nd|3rd|4th|5th|6th|7th|8th|9th\b', '', clean_title, flags=re.IGNORECASE)
        clean_title = re.sub(r'\b\d+(?:st|nd|rd|th)\b', '', clean_title, flags=re.IGNORECASE)
        clean_title = re.sub(r'\W+', '', clean_title) #remove special characters This needs to be last
        clean_df.loc[index, 'clean_title'] = clean_title

    clean_df.drop_duplicates(subset='clean_title', keep='first', inplace=True)

    clean_df.drop('title_length', axis=1, inplace=True)
    clean_df.sort_values(by='id', ascending=True, inplace=True)

    return clean_df

# Function for loading ML model and feature vectors from saved fileName
def load(fileName):
    if os.path.exists(fileName):
        with open(fileName, 'rb') as f:
                return pickle.load(f)
    else:
        return None

# Helper function for vectorization 
# One hot encodes the given column if it exists in df and appends it to featureVectors 
# Returns: featureVectors with the joined one-hot encoded column
def one_hot_encode(df, column, featureVectors):
    encoded_df = df.copy()
    if column in df:
        encoded_df = encoded_df[column].str.join('|').str.get_dummies()
        featureVectors = pd.concat([featureVectors, encoded_df], axis=1)
    return featureVectors

# Encodes the genre, studio, themes, and demographics columns in the feature vectors for the KNN algorithm 
# Returns a dataframe with id and titles of anime, and the above columns one-hot encoded
def vectorization(df):
    featureVectors = df[['id', 'title']].copy(deep=True)

    columns = ['genres', 'studios', 'themes', 'demographics']
    for column in columns:
        featureVectors = one_hot_encode(df, column, featureVectors)

    return featureVectors

# Gets anime data from database, cleans duplicate anime titles, encodes and trains the data with knn, then saves the model
def train_and_save_model():
    df = connect_to_db()

    # parse and keep relevant columns
    df['anime']['studios'] = df['anime']['studios'].apply(parse_json)
    df['anime']['genres'] = df['anime']['genres'].apply(parse_json)
    df['anime']['themes'] = df['anime']['themes'].apply(parse_json)
    df['anime']['demographics'] = df['anime']['demographics'].apply(parse_json)

    df = df['anime'][['id', 'title', 'studios', 'genres', 'themes', 'demographics']]

    featureVectors = vectorization(df)

    k = 100

    knn = NearestNeighbors(n_neighbors=k, metric='cosine')
    knn.fit(featureVectors.drop(['id', 'title'], axis=1))

    with open(trained_model, 'wb') as f:
        pickle.dump(knn, f)
    
    with open('feature_vectors.pkl', 'wb') as f:
        pickle.dump(featureVectors, f)

# Returns a list of anime id recommendations
# favorites: list of anime titles to use for recommendations
# knn: file path for knn
# featureVectors: file path for featureVectors
# num: number of recommendations to return
def recommendations(favorites, knn, featureVectors, num, cleaned):
    user_anime_features = featureVectors[featureVectors['title'].isin(favorites)]
    distances, indices = knn.kneighbors(user_anime_features.drop(['id','title'], axis=1))
    recommendations = {}

    for anime_index in range(distances.shape[0]):
        for i in range(1, len(distances[anime_index])):
            recommended_anime_id = featureVectors.iloc[indices[anime_index][i]]['id']
            if recommended_anime_id in recommendations:
                recommendations[recommended_anime_id] += distances[anime_index][i]
            else:
                recommendations[recommended_anime_id] = distances[anime_index][i]
    
    for recommended_anime_id in recommendations.keys():
        recommendations[recommended_anime_id] /= distances.shape[0]
    
    recommendations = sorted(recommendations.items(), key=lambda item: item[1])

    if cleaned:
        recommendations_df = pd.DataFrame(recommendations, columns=['id', 'distance'])
        recommendations_df['title'] = recommendations_df['id'].apply(lambda id: featureVectors[featureVectors['id'] == id]['title'].values[0])

        recommendations_df = clean_data(recommendations_df)  

        favorites_dict = {title: featureVectors[featureVectors['title'] == title]['id'].values[0] for title in favorites}
        favorites_df = pd.DataFrame(list(favorites_dict.items()), columns=['title', 'id'])
        cleaned_favorites = clean_data(favorites_df)

        recommendations_df = recommendations_df[~recommendations_df['clean_title'].isin(cleaned_favorites['clean_title'])]

        top_recommendations = recommendations_df.sort_values(by='distance', ascending=True).head(num)['id'].values.tolist()
    else: 
        top_recommendations = [anime_id for anime_id, _ in recommendations[:num]]
    
    return top_recommendations


# Route for training data. Must be run prior to getting recommendations
@app.route('/train', methods=['POST'])
def train():
    train_and_save_model()
    return {
        'status': 'model trained and saved'
    }

# Route for getting recommendations. Requires a json body structured as such: {"anime_titles": ["Naruto", "Bleach", "One Piece"]}
# anime_titles list or json CANNOT be empty to get recommendations 
# Can specify number of recommendations through a query parameter in the URL (ex: '/getRecs?recs=20')
# Note: number of max recommendations possible is limited by k number used for training data. Defaults to 10.
# Returns a JSON list of anime ids (ex: [28755, 20, 7786, 13769, 2249, 25161, 12929, 1254, 10033, 36040])
@app.route('/getRecs', methods=['POST'])
def getRecs_route():
    data = request.get_json()
    favorites = data['anime_titles']

    if not favorites: 
        return jsonify({"message:" : "Favorites list is empty, cannot generate recommendations"}), 400
    
    num = request.args.get('recs', default=20, type=int)
    cleaned = request.args.get('cleaned', default='false', type=str)

    knn = load(trained_model)
    featureVectors = load('feature_vectors.pkl')
    
    if (knn is None or featureVectors is None):
        return jsonify({"message:" : "Error loading training data, Could not get Recommendations"}), 500

    recommendationList = recommendations(favorites, knn, featureVectors, num, cleaned.lower() == 'true')
        
    recommendationList = list(map(int, recommendationList))

    return jsonify(recommendationList), 200

print("training")
train_and_save_model()
if __name__ == '__main__':
    app.run(port=7000)