# Todo App

This project is a full-stack Todo application built with a React frontend and a Flask backend. The frontend uses Vite for fast development and Tailwind CSS for styling. The backend uses Flask to handle API requests and PostgreSQL as the database.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### Backend

1. Navigate to the `services/backend` directory.
2. Install the required Python packages:

   ```sh
   pip install -r requirements.txt
   ```

3. Run the Flask application:

   ```sh
   flask run
   ```

### Frontend

1. Navigate to the `services/frontend` directory.
2. Install the required Node.js packages:

   ```sh
   npm install
   ```

3. Run the Vite development server:

   ```sh
   npm run dev
   ```

### Docker

To run the entire application using Docker, use the following command:

```sh
docker-compose up --build
```

## List of CURL

### Create a new todo

```sh
curl --location 'http://localhost:5000/todos' \
--header 'Content-Type: application/json' \
--data '{"title": "Book flight", "status": true}'
```

### Get all todos

```sh

curl --location 'http://localhost:5000/todos'
```

### Get a todo by ID

```sh

curl --location 'http://localhost:5000/todos/1'
```

### Update a todo

```sh

curl --location --request PUT 'http://localhost:5000/todos/1' \
--header 'Content-Type: application/json' \
--data '{"title": "Buy groceries for the party 123", "status": true}'
```

### Delete a todo

```sh

curl --location --request DELETE 'http://localhost:5000/todos/1'
```
