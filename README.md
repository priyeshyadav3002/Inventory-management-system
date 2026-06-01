# Inventory & Order Management System

This is a full-stack Inventory & Order Management System built with FastAPI, React, and PostgreSQL, fulfilling the assignment requirements.

## Features
- **Backend**: Python FastAPI with SQLAlchemy ORM and PostgreSQL.
- **Frontend**: React (Vite) with a modern, responsive UI using Tailwind CSS v4 and Lucide React icons.
- **Business Logic**: 
  - Unique product SKUs and unique customer emails.
  - Automatic stock reduction upon order placement.
  - Validation to prevent ordering out-of-stock items.
- **Dockerized**: Fully containerized using `Dockerfile` for both frontend and backend, orchestrated with `docker-compose`.

## Running Locally with Docker Compose

1. **Prerequisites**: Install Docker and Docker Compose.
2. **Start the Application**:
   Run the following command in the root directory:
   ```bash
   docker compose up --build -d
   ```
3. **Access the Application**:
   - **Frontend UI**: http://localhost:3000
   - **Backend API Docs**: http://localhost:8000/docs
   - **PostgreSQL Database**: Accessible internally on port 5432.

## Deployment Instructions

### Backend & Database (e.g., Render)
1. **Database**: Create a free PostgreSQL database on Render. Copy the Internal or External Database URL.
2. **Backend**:
   - Create a new "Web Service" on Render.
   - Connect your GitHub repository.
   - Set the Root Directory to `backend/`.
   - Set the Environment to `Docker`.
   - Add the Environment Variable `DATABASE_URL` with your PostgreSQL database URL.
   - Deploy the service.

### Frontend (e.g., Vercel)
1. Import your GitHub repository into Vercel.
2. Set the Framework Preset to `Vite`.
3. Set the Root Directory to `frontend/`.
4. Add the Environment Variable `VITE_API_URL` pointing to your deployed backend URL (e.g., `https://your-backend.onrender.com`).
5. Deploy.

### Delivery
Submit the following links as requested:
- **GitHub Repository Link**: [Your Repo Link]
- **Docker Image Link**: [Your Docker Hub Image Link]
- **Live Application URLs**: 
  - Frontend: [Your Vercel Link]
  - Backend API: [Your Render Link]
