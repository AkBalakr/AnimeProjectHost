from flask import Flask, request, jsonify
# Note: need to install flask (pip install Flask)

app = Flask(__name__)

# route for get requests, returns a json message
@app.route('/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Hello, from Flask!"}), 200

@app.route('/getRecs', methods=['POST'])
def getRecs_route():
    print("getRecs has been called from flask")
    json = request.get_json()
    print(json)
    return jsonify({"message:" : "Received favorites"}), 200

if __name__ == '__main__':
    app.run(port=5000)