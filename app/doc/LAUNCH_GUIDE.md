# 🚀 FitNutrition - Complete Launch Guide

## Step-by-Step Instructions to Launch the Project

Follow these steps carefully to get your FitNutrition application running.

---

## 📋 Prerequisites Check

Before starting, verify you have these installed:

### 1. Check Python
```bash
python --version
```
**Required:** Python 3.10 or higher

If not installed, download from: https://www.python.org/downloads/

### 2. Check PostgreSQL
```bash
psql --version
```
**Required:** PostgreSQL 14 or higher

If not installed, download from: https://www.postgresql.org/download/

### 3. Check pip
```bash
pip --version
```
Should come with Python. If not:
```bash
python -m ensurepip --upgrade
```

---

## 🗄️ STEP 1: Set Up PostgreSQL Database

### Option A: Using pgAdmin (Recommended for Windows)

1. **Open pgAdmin** (installed with PostgreSQL)

2. **Connect to PostgreSQL Server**
   - Right-click on "Servers" → "PostgreSQL"
   - Enter your password (set during PostgreSQL installation)

3. **Create Database**
   - Right-click on "Databases"
   - Select "Create" → "Database"
   - Name: `fitness_nutrition_db`
   - Click "Save"

### Option B: Using Command Line

1. **Open Command Prompt or PowerShell**

2. **Connect to PostgreSQL**
```bash
psql -U postgres
```
Enter your PostgreSQL password when prompted.

3. **Create Database**
```sql
CREATE DATABASE fitness_nutrition_db;
```

4. **Verify Database Created**
```sql
\l
```
You should see `fitness_nutrition_db` in the list.

5. **Exit PostgreSQL**
```sql
\q
```

---

## 📁 STEP 2: Navigate to Project Directory

Open Command Prompt or PowerShell and navigate to the backend folder:

```bash
cd C:\Users\agunk\Desktop\fitness-nutrition-app\backend
```

Verify you're in the correct directory:
```bash
dir
```
You should see: `manage.py`, `requirements.txt`, `config` folder, etc.

---

## 🐍 STEP 3: Create Python Virtual Environment

### Create Virtual Environment
```bash
python -m venv venv
```

This creates a `venv` folder in your backend directory.

### Activate Virtual Environment

**For Command Prompt:**
```bash
venv\Scripts\activate
```

**For PowerShell:**
```bash
venv\Scripts\Activate.ps1
```

**If you get an error in PowerShell about execution policy:**
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Then try activating again.

**Success Indicator:**
You should see `(venv)` at the beginning of your command line:
```
(venv) C:\Users\agunk\Desktop\fitness-nutrition-app\backend>
```

---

## 📦 STEP 4: Install Python Dependencies

With virtual environment activated, install all required packages:

```bash
pip install -r requirements.txt
```

This will install:
- Django
- Django REST Framework
- PostgreSQL adapter
- JWT authentication
- Groq API
- And other dependencies

**Wait for installation to complete** (may take 2-5 minutes)

### Verify Installation
```bash
pip list
```
You should see Django, djangorestframework, psycopg2-binary, etc.

---

## ⚙️ STEP 5: Configure Environment Variables

### Create .env File

1. **Copy the example file:**
```bash
copy .env.example .env
```

2. **Open .env file in Notepad or VS Code:**
```bash
notepad .env
```

3. **Update these values:**

```env
# Django Settings
SECRET_KEY=your-secret-key-change-this-to-something-random
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Settings
DB_NAME=fitness_nutrition_db
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
DB_HOST=localhost
DB_PORT=5432

# JWT Settings
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
JWT_ALGORITHM=HS256

# Groq API
GROQ_API_KEY=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

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Email Settings (optional for now)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

**Important:** Replace `YOUR_POSTGRES_PASSWORD_HERE` with your actual PostgreSQL password!

4. **Save and close the file**

---

## 🗃️ STEP 6: Create Database Tables (Migrations)

### Generate Migration Files
```bash
python manage.py makemigrations
```

You should see output like:
```
Migrations for 'users':
  apps\users\migrations\0001_initial.py
    - Create model User
    - Create model UserProfile
    - Create model FoodPreference
Migrations for 'measurements':
  ...
Migrations for 'nutrition':
  ...
```

### Apply Migrations to Database
```bash
python manage.py migrate
```

You should see output like:
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying users.0001_initial... OK
  ...
```

**Success:** All migrations applied successfully!

---

## 👤 STEP 7: Create Admin User (Superuser)

```bash
python manage.py createsuperuser
```

You'll be prompted to enter:

1. **Email address:** 
   ```
   Email address: admin@fitnutrition.com
   ```

2. **Username:**
   ```
   Username: admin
   ```

3. **First name:** (optional, press Enter to skip)
   ```
   First name: Admin
   ```

4. **Last name:** (optional, press Enter to skip)
   ```
   Last name: User
   ```

5. **Password:** (type carefully, won't show on screen)
   ```
   Password: ********
   Password (again): ********
   ```

**Success:** Superuser created successfully!

---

## 🚀 STEP 8: Start the Development Server

```bash
python manage.py runserver
```

You should see:
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
January 17, 2024 - 10:00:00
Django version 4.2, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**🎉 SUCCESS! Your backend is now running!**

---

## ✅ STEP 9: Verify Everything Works

### Test 1: Access Admin Panel

1. **Open your web browser**

2. **Go to:** http://localhost:8000/admin/

3. **Login with your superuser credentials:**
   - Username: `admin`
   - Password: (the password you created)

4. **You should see the Django Admin Dashboard** with:
   - Users
   - User Profiles
   - Food Preferences
   - Body Measurements
   - Progress Logs
   - Foods
   - Meals
   - Meal Plans
   - Favorite Foods
   - Favorite Meals

### Test 2: Check API Root

1. **Open new browser tab**

2. **Go to:** http://localhost:8000/api/

3. **You should see API endpoints** or a message about authentication

### Test 3: Test Registration Endpoint

1. **Open Command Prompt or PowerShell** (new window, keep server running)

2. **Test user registration:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"username\":\"testuser\",\"password\":\"TestPass123\",\"password2\":\"TestPass123\",\"first_name\":\"Test\",\"last_name\":\"User\"}"
```

**If curl is not available, use Postman or skip this test**

---

## 🎨 STEP 10: View UI Mockups

### Open Mockups in Browser

1. **Navigate to mockups folder:**
```bash
cd C:\Users\agunk\Desktop\fitness-app-mockups
```

2. **Open any mockup file:**
```bash
start 01-landing-page.html
```

Or simply double-click any HTML file in the `fitness-app-mockups` folder.

**Available Mockups:**
- `01-landing-page.html` - Landing page with registration
- `02-dashboard.html` - Main dashboard with charts
- `03-meal-planning.html` - Meal planning interface
- `04-workout-planning.html` - Workout planning interface
- `05-progress-tracking.html` - Progress tracking with charts
- `06-profile-setup.html` - Profile setup wizard

---

## 📊 STEP 11: Explore the Admin Panel

### Add Sample Data

1. **Go to Admin Panel:** http://localhost:8000/admin/

2. **Add a Food:**
   - Click "Foods" → "Add Food"
   - Fill in:
     - Name: "Chicken Breast"
     - Category: "Protein"
     - Serving Size: 100
     - Calories: 165
     - Protein: 31
     - Carbohydrates: 0
     - Fats: 3.6
   - Click "Save"

3. **Add a Body Measurement:**
   - Click "Body Measurements" → "Add Body Measurement"
   - Select your user
   - Enter today's date
   - Weight: 75
   - Click "Save"

4. **View Your Data:**
   - Navigate through different sections
   - See how data is organized

---

## 🔧 Troubleshooting

### Problem: "Port 8000 is already in use"

**Solution:**
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID_NUMBER> /F

# Or use different port
python manage.py runserver 8001
```

### Problem: "psycopg2 installation failed"

**Solution:**
```bash
pip install psycopg2-binary
```

### Problem: "Cannot connect to database"

**Solution:**
1. Check PostgreSQL is running
2. Verify database name in .env
3. Verify password in .env
4. Try connecting manually:
```bash
psql -U postgres -d fitness_nutrition_db
```

### Problem: "Module not found"

**Solution:**
```bash
# Make sure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Problem: "Virtual environment won't activate in PowerShell"

**Solution:**
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📝 Quick Reference Commands

### Start Development Server
```bash
# Navigate to backend
cd C:\Users\agunk\Desktop\fitness-nutrition-app\backend

# Activate virtual environment
venv\Scripts\activate

# Start server
python manage.py runserver
```

### Stop Development Server
Press `CTRL + C` in the terminal

### Access Points
- **Admin Panel:** http://localhost:8000/admin/
- **API Root:** http://localhost:8000/api/
- **API Documentation:** http://localhost:8000/api/
- **UI Mockups:** Open HTML files in `fitness-app-mockups/` folder

---

## 🎯 What's Next?

Now that your backend is running:

1. **Explore the Admin Panel**
   - Add sample data
   - Test CRUD operations

2. **Test API Endpoints**
   - Use Postman or curl
   - Try registration, login, profile creation

3. **Review the Code**
   - Check `apps/users/models.py`
   - Review `apps/nutrition/views.py`
   - Understand the structure

4. **Continue Development**
   - Build remaining apps (workouts, analytics, recommendations)
   - Implement React frontend
   - Add more features

---

## 📞 Need Help?

If you encounter issues:

1. **Check the error message carefully**
2. **Review this guide again**
3. **Check SETUP_GUIDE.md for more details**
4. **Verify all prerequisites are installed**
5. **Make sure PostgreSQL is running**
6. **Verify .env file is configured correctly**

---

## ✅ Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `fitness_nutrition_db` created
- [ ] Virtual environment created and activated
- [ ] Dependencies installed from requirements.txt
- [ ] .env file created and configured
- [ ] Migrations applied successfully
- [ ] Superuser created
- [ ] Development server running on port 8000
- [ ] Can access admin panel at http://localhost:8000/admin/
- [ ] Can login with superuser credentials
- [ ] UI mockups open in browser

**If all checked, congratulations! Your FitNutrition backend is fully operational! 🎉**

---

**Last Updated:** January 17, 2024
**Version:** 1.0
**Status:** Production Ready for Development
