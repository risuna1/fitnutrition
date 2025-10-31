# FitNutrition - Quick Setup Guide

This guide will help you set up and run the FitNutrition application on your local machine.

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Python 3.10 or higher installed
- [ ] Node.js 18 or higher installed
- [ ] PostgreSQL 14 or higher installed
- [ ] Git installed
- [ ] A code editor (VS Code recommended)

## 🚀 Quick Start (Step-by-Step)

### Step 1: Verify Prerequisites

```bash
# Check Python version
python --version

# Check Node.js version
node --version

# Check PostgreSQL
psql --version

# Check Git
git --version
```

### Step 2: Set Up PostgreSQL Database

1. **Start PostgreSQL service** (if not running)
   ```bash
   # Windows (if using PostgreSQL service)
   # Open Services and start PostgreSQL
   
   # Or use pgAdmin to start the server
   ```

2. **Create the database**
   ```bash
   # Open Command Prompt or PowerShell
   psql -U postgres
   
   # In PostgreSQL prompt:
   CREATE DATABASE fitness_nutrition_db;
   
   # Create a user (optional, or use postgres user)
   CREATE USER fitness_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE fitness_nutrition_db TO fitness_user;
   
   # Exit
   \q
   ```

### Step 3: Set Up Backend

1. **Navigate to backend directory**
   ```bash
   cd C:\Users\agunk\Desktop\fitness-nutrition-app\backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**
   ```bash
   # Windows Command Prompt
   venv\Scripts\activate
   
   # Windows PowerShell
   venv\Scripts\Activate.ps1
   
   # If you get execution policy error in PowerShell:
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create .env file**
   ```bash
   # Copy the example file
   copy .env.example .env
   
   # Edit .env file with your settings
   # Use Notepad or VS Code to edit
   notepad .env
   ```

   **Update these values in .env:**
   ```env
   SECRET_KEY=your-secret-key-here-generate-a-random-string
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   
   DB_NAME=fitness_nutrition_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   
   GROQ_API_KEY=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
   ```

6. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create superuser**
   ```bash
   python manage.py createsuperuser
   
   # Follow the prompts:
   # - Email: your@email.com
   # - Username: admin
   # - Password: (your secure password)
   ```

8. **Run the development server**
   ```bash
   python manage.py runserver
   ```

   ✅ Backend should now be running at: http://localhost:8000

9. **Test the API** (in a new terminal)
   ```bash
   # Test if API is working
   curl http://localhost:8000/admin/
   ```

### Step 4: Set Up Frontend

1. **Open a new terminal** (keep backend running)

2. **Navigate to frontend directory**
   ```bash
   cd C:\Users\agunk\Desktop\fitness-nutrition-app\frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create .env file**
   ```bash
   # Create .env file
   echo VITE_API_BASE_URL=http://localhost:8000/api > .env
   echo VITE_APP_NAME=FitNutrition >> .env
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   ✅ Frontend should now be running at: http://localhost:5173

### Step 5: Verify Everything Works

1. **Open your browser** and go to:
   - Frontend: http://localhost:5173
   - Backend Admin: http://localhost:8000/admin/
   - API Root: http://localhost:8000/api/

2. **Test the admin panel**
   - Go to http://localhost:8000/admin/
   - Login with your superuser credentials
   - You should see the admin dashboard

## 🔧 Troubleshooting

### Issue: "psycopg2 installation failed"
**Solution:**
```bash
pip install psycopg2-binary
```

### Issue: "Port 8000 already in use"
**Solution:**
```bash
# Find and kill the process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Or use a different port:
python manage.py runserver 8001
```

### Issue: "Cannot connect to PostgreSQL"
**Solution:**
1. Check if PostgreSQL service is running
2. Verify your database credentials in .env
3. Try connecting manually:
   ```bash
   psql -U postgres -d fitness_nutrition_db
   ```

### Issue: "Module not found" errors
**Solution:**
```bash
# Make sure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Issue: "CORS errors in browser"
**Solution:**
- Check that CORS_ALLOWED_ORIGINS in settings.py includes your frontend URL
- Restart the Django server

## 📝 Next Steps

After successful setup:

1. **Explore the Admin Panel**
   - Go to http://localhost:8000/admin/
   - Create some test data

2. **Test API Endpoints**
   - Use Postman or curl to test endpoints
   - Check the API documentation

3. **Start Development**
   - Frontend code is in `frontend/src/`
   - Backend code is in `backend/apps/`

4. **Read the Documentation**
   - Check README.md for detailed information
   - Review API endpoints documentation

## 🎯 Common Commands

### Backend Commands
```bash
# Activate virtual environment
venv\Scripts\activate

# Run server
python manage.py runserver

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Collect static files
python manage.py collectstatic
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

## 📞 Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Review this guide again
3. Check the main README.md
4. Look for solutions in the troubleshooting section

## ✅ Success Checklist

- [ ] PostgreSQL database created
- [ ] Backend virtual environment created and activated
- [ ] Backend dependencies installed
- [ ] .env file configured
- [ ] Database migrations completed
- [ ] Superuser created
- [ ] Backend server running on port 8000
- [ ] Frontend dependencies installed
- [ ] Frontend .env configured
- [ ] Frontend server running on port 5173
- [ ] Can access admin panel
- [ ] Can access frontend

Congratulations! Your FitNutrition application is now set up and running! 🎉
