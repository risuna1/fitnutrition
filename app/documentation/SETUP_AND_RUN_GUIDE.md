# Setup and Run Guide

## Database Setup Instructions

The error you're seeing (`リレーション"users_user"は存在しません`) means the database tables haven't been created yet. Follow these steps:

### Step 1: Activate Virtual Environment

**On Windows PowerShell:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
```

**If you get an execution policy error, run:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**On Windows CMD:**
```cmd
cd backend
venv\Scripts\activate.bat
```

**On Linux/Mac:**
```bash
cd backend
source venv/bin/activate
```

### Step 2: Install Dependencies (if not already installed)

```bash
pip install -r requirements.txt
```

### Step 3: Create Database Migrations

```bash
python manage.py makemigrations
```

This should create migration files for all apps including the new `height` field we added.

### Step 4: Apply Migrations

```bash
python manage.py migrate
```

This will create all the database tables.

### Step 5: Create Superuser (Optional but recommended)

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin user.

### Step 6: Run the Development Server

```bash
python manage.py runserver
```

The backend should now be running at `http://localhost:8000`

## Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Run Development Server

```bash
npm run dev
```

The frontend should now be running at `http://localhost:5173`

## Troubleshooting

### Issue: Virtual environment not found
**Solution:** Create a new virtual environment:
```bash
cd backend
python -m venv venv
```

### Issue: PostgreSQL connection error
**Solution:** Make sure PostgreSQL is running and create the database:
```sql
CREATE DATABASE fitnutrition_db;
```

Or update `backend/config/settings.py` to use SQLite for development:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Issue: Port already in use
**Solution:** 
- Backend: Use a different port: `python manage.py runserver 8001`
- Frontend: The Vite dev server will automatically use the next available port

## Verification

After setup, verify everything works:

1. **Backend API:** Visit `http://localhost:8000/admin/` - You should see the Django admin login
2. **Frontend:** Visit `http://localhost:5173/` - You should see the app login page
3. **API Endpoints:** Visit `http://localhost:8000/api/` - You should see available endpoints

## Summary of Fixed Errors

All code errors have been fixed:
- ✅ Missing imports added
- ✅ Model fields corrected
- ✅ API endpoints aligned
- ✅ Calculations fixed
- ✅ Import paths corrected

The database just needs to be initialized with migrations!
