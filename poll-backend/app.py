from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2 
from psycopg2 import pool

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://www.bluedobiedev.com"}})

# Database connection details (from Supabase dashboard)
DB_HOST = "aws-0-us-east-2.pooler.supabase.com"  # Replace with your Supabase host
DB_NAME = "postgres"
DB_USER = "postgres.nsbzownwwzfnhbqkpjer"  # Replace with your Supabase user
DB_PASSWORD = "Copjobs231!"  # Replace with your Supabase password
DB_PORT = 6543  # Default Postgres port for Supabase

# Initialize connection pool
try:
    connection_pool = pool.SimpleConnectionPool(
        1, 10,  # Minimum 1, Maximum 10 connections
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        sslmode="require"  # Ensure SSL is enabled for Supabase
    )
    if connection_pool:
        print("Connection pool created successfully")
except Exception as e:
    print(f"Error creating connection pool: {e}")

# Fetch a connection from the pool
def get_db_connection():
    try:
        return connection_pool.getconn()
    except Exception as e:
        print(f"Error getting connection from pool: {e}")
        return None

# Release a connection back to the pool
def release_db_connection(conn):
    if conn:
        connection_pool.putconn(conn)

# Test the database connection
@app.route("/api/test_connection", methods=["GET"])
def test_connection():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Failed to get a connection"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT 1;")
        cursor.close()
        release_db_connection(conn)
        return jsonify({"success": "Database connection successful"})
    except Exception as e:
        release_db_connection(conn)
        return jsonify({"error": str(e)}), 500

# Fetch current vote counts
@app.route("/votes", methods=["GET"])
def get_votes():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Failed to get a connection"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT option, count FROM votes;")
        results = cursor.fetchall()
        release_db_connection(conn)

        # Convert results to a dictionary
        votes = {row[0]: row[1] for row in results}
        return jsonify(votes)
    except Exception as e:
        release_db_connection(conn)
        return jsonify({"error": str(e)}), 500
print("GET /api/votes endpoint was called")

# Submit a vote
@app.route("/vote", methods=["POST"])
def submit_vote():
    data = request.json
    option = data.get("option")

    if option not in ["speed", "design", "visibility"]:
        return jsonify({"error": "Invalid vote option"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Failed to get a connection"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE votes SET count = count + 1 WHERE option = %s;", (option,)
        )
        conn.commit()
        cursor.close()
        release_db_connection(conn)
        return jsonify({"success": True})
    except Exception as e:
        release_db_connection(conn)
        return jsonify({"error": str(e)}), 500

# Run the server
if __name__ == "__main__":
    app.run(debug=True, port=5000)