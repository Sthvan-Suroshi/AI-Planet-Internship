# How to Start the Application

This document outlines the steps to start the application, which consists of a frontend built with React using Vite and a backend built with FastAPI. The backend requires a `GOOGLE_API_KEY` environment variable for certain functionalities.

## Backend Setup (FastAPI)

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment (recommended):**

    ```bash
    python3 -m venv .venv        # Create a virtual environment
    source .venv/bin/activate   # Activate on Linux/macOS
    .venv\Scripts\activate      # Activate on Windows
    ```

3.  **Install dependencies:**

    ```bash
    pip install fastapi python-multipart langchain langchain-google-genai faiss-cpu python-dotenv uvicorn PyPDF2 google-generativeai
    ```

4.  **Set the `GOOGLE_API_KEY` environment variable:**

    - **Linux/macOS:**

      ```bash
      export GOOGLE_API_KEY="YOUR_ACTUAL_GOOGLE_API_KEY"
      ```

    - **Windows (PowerShell):**

      ```powershell
      $env:GOOGLE_API_KEY = "YOUR_ACTUAL_GOOGLE_API_KEY"
      ```

    - **Windows (CMD):**

      ```cmd
      set GOOGLE_API_KEY="YOUR_ACTUAL_GOOGLE_API_KEY"
      ```

      For a more persistent solution on any OS, consider creating a `.env` file in the backend directory and using a library like `python-dotenv`:

      - Install the library: `pip install python-dotenv`
      - Create a `.env` file with the following content:

        ```
        GOOGLE_API_KEY=YOUR_ACTUAL_GOOGLE_API_KEY
        ```

5.  **Start the backend server:**

    ```bash
    uvicorn main:app --reload
    ```

## Frontend Setup (React with Vite)

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install         # or yarn install or pnpm install
    ```

3.  **Start the development server:**

    ```bash
    npm run dev       # or yarn dev or pnpm dev
    ```

This will start the frontend development server, usually on `http://localhost:5173/`.

## Accessing the Application

Once both the backend and frontend servers are running, you can access the application in your web browser at the address provided by the frontend development server (usually `http://localhost:5173/`).
