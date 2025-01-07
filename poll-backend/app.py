from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from the frontend

# Path to the votes file
VOTES_FILE = "votes.json"

# Load votes from file or initialize
def load_votes():
    try:
        with open(VOTES_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"speed": 0, "design": 0, "visibility": 0}

# Save votes to file
def save_votes(votes):
    with open(VOTES_FILE, "w") as f:
        json.dump(votes, f)

# Get current vote counts
@app.route("/api/votes", methods=["GET"])
def get_votes():
    votes = load_votes()
    return jsonify(votes)

# Submit a vote
@app.route("/api/vote", methods=["POST"])
def submit_vote():
    data = request.json
    option = data.get("option")

    if option not in ["speed", "design", "visibility"]:
        return jsonify({"error": "Invalid vote option"}), 400

    votes = load_votes()
    votes[option] += 1
    save_votes(votes)

    return jsonify({"success": True, "votes": votes})

# Run the server
if __name__ == "__main__":
    app.run(debug=True, port=5000)
