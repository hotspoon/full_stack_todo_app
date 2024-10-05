import psycopg2
from flask import Flask, request, jsonify
import os
import logging
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Set up logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# Get database URL from environment variable
DB_URL = os.environ.get('DATABASE_URL')

def setup_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    file_handler = logging.FileHandler('logfile.log')
    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger


# Set up logging
logger = setup_logger(__name__)

# Flag to track if the connection success has been logged
connection_success_logged = False

def get_db_connection():
    global connection_success_logged  # Access the global flag
    try:
        conn = psycopg2.connect(DB_URL)
        if not connection_success_logged:
            logger.info("Database connection successful")
            connection_success_logged = True  # Set the flag to True
        return conn
    except psycopg2.DatabaseError as error:
        logger.error(f"Database connection failed: {error}")
        return None

# test connection
@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({'message': 'Pong 123!'})

def create_table():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        status BOOLEAN NOT NULL DEFAULT FALSE,
        last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()
    cur.close()
    conn.close()

# Create table when the application starts
with app.app_context():
    create_table()

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not Found'}), 404

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({'error': 'Internal Server Error'}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad Request'}), 400

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method Not Allowed'}), 405

@app.errorhandler(409)
def conflict(error):
    return jsonify({'error': 'Conflict'}), 409

@app.route('/todos', methods=['GET'])
def get_todos():
    try:
        conn = get_db_connection()
        if conn is None:
            return internal_server_error(None)

        cur = conn.cursor()
        cur.execute("SELECT * FROM todos ORDER BY last_update DESC;")
        todos = cur.fetchall()
        cur.close()
        conn.close()

        todo_list = []
        for todo in todos:
            todo_list.append({
                'id': todo[0], 
                'title': todo[1], 
                'status': todo[2],  # Use 'status' to match the column name
                'last_update': todo[3]  # Include last_update in the response
            })
        return jsonify(todo_list)
    except Exception as e:
        logger.error(f"An error occurred in get_todos: {e}")
        return internal_server_error(None)

@app.route('/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    try:
        conn = get_db_connection()
        if conn is None:
            return internal_server_error(None)

        cur = conn.cursor()
        cur.execute("SELECT * FROM todos WHERE id = %s;", (todo_id,))
        todo = cur.fetchone()
        cur.close()
        conn.close()

        if todo:
            return jsonify({
                'id': todo[0], 
                'title': todo[1], 
                'status': todo[2],  # Use 'status' to match the column name
                'last_update': todo[3]  # Include last_update in the response
            })
        else:
            return not_found(None)
    except Exception as e:
        logger.error(f"An error occurred in get_todo: {e}")
        return internal_server_error(None)

@app.route('/todos', methods=['POST'])
def create_todo():
    try:
        data = request.get_json()
        title = data.get('title')
        status = data.get('status', False)  # Use 'status' to match the column name

        conn = get_db_connection()
        if conn is None:
            return internal_server_error(None)

        cur = conn.cursor()
        cur.execute("INSERT INTO todos (title, status) VALUES (%s, %s) RETURNING id;", (title, status))
        todo_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'id': todo_id, 
            'title': title, 
            'status': status,  # Use 'status' to match the column name
            'last_update': None  # You might want to fetch the actual timestamp from the DB
        }), 201
    except Exception as e:
        logger.error(f"An error occurred in create_todo: {e}")
        return internal_server_error(None)

@app.route('/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    try:
        data = request.get_json()
        title = data.get('title')
        status = data.get('status')  # Use 'status' to match the column name

        conn = get_db_connection()
        if conn is None:
            return internal_server_error(None)

        cur = conn.cursor()
        cur.execute("UPDATE todos SET title = %s, status = %s WHERE id = %s;", (title, status, todo_id))

        # Check if any row was affected by the UPDATE
        if cur.rowcount == 0:
            conn.close()  # Close the connection before returning
            return jsonify({'error': 'Todo not found'}), 404
        
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({'message': 'Todo updated successfully'})
    except Exception as e:
        logger.error(f"An error occurred in update_todo: {e}")
        return internal_server_error(None)

@app.route('/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    try:
        conn = get_db_connection()
        if conn is None:
            return internal_server_error(None)

        cur = conn.cursor()
        cur.execute("DELETE FROM todos WHERE id = %s;", (todo_id,))

        # Check if any row was affected by the DELETE
        if cur.rowcount == 0:
            conn.close()  # Close the connection before returning
            return jsonify({'error': 'Todo not found'}), 404
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({'message': 'Todo deleted successfully'})
    except Exception as e:
        logger.error(f"An error occurred in delete_todo: {e}")
        return internal_server_error(None)

if __name__ == '__main__':
    app.run(debug=True)