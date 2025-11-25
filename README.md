# Monorepo with React Frontend and Node.js Backend

## Prerequisites

- Node.js and npm: Make sure you have Node.js and npm installed. You can download them from [https://nodejs.org/](https://nodejs.org/).
- Supabase account: This project uses Supabase for the backend. You'll need a Supabase account and a project.

## Setup

1.  **Install Node.js and npm:**
    - If you're on a Debian-based Linux distribution, you can install Node.js and npm by running:
      ```bash
      sudo apt-get update
      sudo apt-get install -y nodejs npm
      ```
    - For other operating systems, please refer to the [official Node.js documentation](https://nodejs.org/en/download/package-manager/).

2.  **Set up the backend environment:**
    - Navigate to the `backend` directory:
      ```bash
      cd backend
      ```
    - Create a `.env` file by copying the example:
      ```bash
      cp .env.example .env
      ```
    - Edit the `.env` file and replace the placeholder values with your actual Supabase URL and anonymous key.

3.  **Install dependencies and run the application:**
    - From the root directory, run the `start.sh` script:
      ```bash
      bash start.sh
      ```
    - This will install the dependencies for both the frontend and backend, build the frontend, and start the backend server. The server will be running on port 3001 by default.
