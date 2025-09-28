# Student Management Dashboard

## Overview

This project is a full-stack web application for managing student information. It features a modern user interface built with **Next.js (React)** and a robust REST API powered by **Flask (Python)** to handle data processing and database interactions.

## Project Structure

The repository is organized into two main directories, separating the frontend and backend concerns:

## Prerequisites

Before you begin, ensure you have the following installed on your system:
* **Node.js** (v18 or later)
* **npm** or **yarn**
* **Python** (v3.8 or later)
* **pip**

---

## Backend Setup (Flask API)

Follow these steps to get the backend server running.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a Python virtual environment:**
    * **Windows:**
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```
    * **macOS / Linux:**
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

3.  **Install dependencies:**
    The required Python packages are listed in `requirements.txt`.
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up the database:**
    This project is configured to use a database (likely PostgreSQL, given the `psycopg2-binary` dependency). Make sure your database server is running and, if necessary, update the connection string within the backend application's configuration files.

5.  **Seed the database with mock data (Optional):**
    Run the seed script to populate the database with initial data for testing.
    ```bash
    python seed_db.py
    ```

6.  **Run the backend server:**
    ```bash
    python run.py
    ```
    ✅ The backend API should now be running on **`http://127.0.0.1:5000`**.

---

## Frontend Setup (Next.js App)

Follow these steps to get the user interface running.

1.  **Navigate to the frontend directory from the root:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    *or* using yarn:
    ```bash
    yarn install
    ```

3.  **Configure environment variables:**
    Create a new file named `.env.local` in the `frontend` directory. You can do this by copying the provided example file:
    ```bash
    cp .env.local.example .env.local
    ```
    This file tells the frontend where the backend API is located. Its content should be:
    ```
    NEXT_PUBLIC_API_URL=[http://127.0.0.1:5000](http://127.0.0.1:5000)
    ```

4.  **Run the frontend development server:**
    Using npm:
    ```bash
    npm run dev
    ```
    *or* using yarn:
    ```bash
    yarn dev
    ```
    ✅ The application should now be running on **`http://localhost:3000`**.

---

## Usage

With both the backend and frontend servers running, open your web browser and navigate to `http://localhost:3000`. The frontend application will load and make API calls to your backend server to fetch and display data.