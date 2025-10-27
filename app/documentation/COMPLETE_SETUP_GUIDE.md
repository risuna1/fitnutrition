# 🚀 FitNutrition Complete Setup Guide

This guide will help you set up and run the complete FitNutrition application (Backend + Frontend).

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Testing the Application](#testing-the-application)
7. [Troubleshooting](#troubleshooting)
8. [Next Steps](#next-steps)

---

## Prerequisites

### Required Software

1. **Python 3.10+**
   - ✅ Already installed on your system
   - Verify: `python --version`

2. **PostgreSQL 14+**
   - ✅ Already installed on your system
   - Verify: `psql --version`

3. **Node.js 18+ and npm**
   - ❌ **NOT YET INSTALLED** - You need to install this
   - Download from: https://nodejs.org/
   - Choose the **LTS version** (Long Term Support)
   - This will install both Node.js and npm

4. **Git** (Optional, for version control)
   - Download from: https://git-scm.com/

---

## Project Overview

### Current Status: **70% Complete**

#### ✅ Completed Components

**Backend (Django REST Framework):**
- ✅ Project structure and configuration
- ✅ User authentication (JWT)
- ✅ User profiles and preferences
- ✅ Body measurements tracking
- ✅ Nutrition tracking (foods, meals, meal plans)
- ✅ Database models and migrations
- ✅ API endpoints and serializers
- ✅ Admin interface
- ✅ CORS configuration
- ✅ Groq AI integration setup

**Frontend (React + Vite):**
- ✅ Project structure created
- ✅ Configuration files (Vite, Tailwind, etc.)
- ✅ Routing setup (React Router)
- ✅ State management (Zustand)
- ✅ API service layer
- ✅ Authentication store
- ⏳ UI Components (need to be built)
- ⏳ Pages (need to be built)

**UI Mockups:**
- ✅ 6 HTML mockups created (English + Indonesian)
- ✅ Landing page
- ✅ Dashboard
- ✅ Meal planning
- ✅ Workout planning
- ✅ Progress tracking
- ✅ Profile setup

#### 🔄 In Progress / Pending

**Backend:**
- ⏳ Workouts app (exercises, workout plans, workout logs)
- ⏳ Analytics app (BMR/TDEE calculations, progress analysis)
- ⏳ Recommendations app (AI-powered suggestions)

**Frontend:**
- ⏳ All page components
- ⏳ Reusable UI components
- ⏳ Charts and visualizations
- ⏳ Forms and validation

---

## Backend Setup

### Step 1: Install Python Dependencies

```bash
# Navigate to backend directory
cd C:\Users\agunk\Desktop\fitness-nutrition-app\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Configure Database

1. **Create PostgreSQL Database:**

```bash
# Open PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE fitnutrition_db;

# Create user (optional, or use postgres user)
CREATE USER fitnutrition_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fitnutrition_db TO fitnutrition_user;

# Exit
\q
```

2. **Update Database Settings:**

Edit `backend/config/settings.py` if needed:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'fitnutrition_db',
        'USER': 'postgres',  # or 'fitnutrition_user'
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Step 3: Set Up Environment Variables

Create `.env` file in `backend/` directory:

```env
SECRET_KEY=your-secret-key-here-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=fitnutrition_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Groq AI API
GROQ_API_KEY=your-groq-api-key-here
```

### Step 4: Run Migrations

```bash
# Make sure you're in backend directory with venv activated
python manage.py makemigrations
python manage.py migrate
```

### Step 5: Create Superuser

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### Step 6: Load Sample Data (Optional)

```bash
# If you have fixtures
python manage.py loaddata sample_data.json
```

### Step 7: Test Backend

```bash
# Start development server
python manage.py runserver

# Server will run at: http://localhost:8000
# Admin panel: http://localhost:8000/admin
# API: http://localhost:8000/api
```

---

## Frontend Setup

### Step 1: Install Node.js

1. Go to https://nodejs.org/
2. Download the **LTS version** (e.g., 20.x.x)
3. Run the installer
4. Follow the installation wizard
5. **Restart your terminal/command prompt**

### Step 2: Verify Installation

```bash
node --version
# Should show: v20.x.x or similar

npm --version
# Should show: 10.x.x or similar
```

### Step 3: Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd C:\Users\agunk\Desktop\fitness-nutrition-app\frontend

# Install all dependencies (this may take a few minutes)
npm install
```

This will install:
- React 18
- React Router v6
- Axios
- Zustand
- Recharts
- Tailwind CSS
- Vite
- And all other dependencies

### Step 4: Configure Environment

The `.env` file is already created with:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=FitNutrition
```

### Step 5: Test Frontend

```bash
# Start development server
npm run dev

# Server will run at: http://localhost:5173
```

---

## Running the Application<create_file>
<path>fitness-nutrition-app/frontend/src/components/layout/MainLayout.jsx</path>
<content>
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
