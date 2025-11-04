# FitNutrition - Fitness & Nutrition Tracking Web Application

A comprehensive fitness and nutrition tracking platform built with Django REST Framework and React.js, featuring AI-powered recommendations using Groq API.

## 🚀 Features

### 1. User Profile & Body Measurements
- User registration and authentication
- Body measurements tracking (weight, height, age, gender, body fat %)
- Eating habits and food preferences
- Fitness goals (weight loss, muscle building, maintenance)

### 2. Data Analysis Engine
- BMR (Basal Metabolic Rate) calculation using Mifflin-St Jeor equation
- TDEE (Total Daily Energy Expenditure) calculation
- Nutrition quality analysis
- Body composition tracking and progress monitoring

### 3. Recommendation System (AI-Powered)
- Personalized workout plans using Groq API
- Custom meal plans and dietary strategies
- Daily/weekly calorie and macronutrient targets
- Adaptive recommendations based on progress

### 4. Progress Tracking
- Workout and meal logging
- Body measurements over time
- Progress visualization with charts and reports

### 5. User Interface
- Responsive design (desktop-first, mobile-compatible)
- Profile comparison views
- Interactive dashboards
- Calendar integration

### 6. Workout Management
- Pre-defined workout plans
- Custom workout creation
- Exercise library
- Calendar scheduling

### 7. Meal Management
- Pre-defined meal plans
- Custom meal creation
- Food database
- Favorite meals and recipes

## 🛠️ Technology Stack

### Backend
- **Python 3.10+**
- **Django 4.2+**
- **Django REST Framework 3.14+**
- **PostgreSQL** (Database)
- **JWT Authentication** (djangorestframework-simplejwt)
- **Groq API** (AI recommendations)

### Frontend
- **React 18+**
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **Axios** (API calls)
- **React Router v6** (Navigation)
- **Recharts** (Data visualization)
- **React Hook Form** (Form handling)
- **Zustand** (State management)

### Development Tools
- **Git** (Version control)
- **VS Code** (IDE)
- **Postman** (API testing)

## 📋 Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- PostgreSQL 14 or higher
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fitness-nutrition-app
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment Variables
Create a `.env` file in the `backend` directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=fitness_nutrition_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Groq API
GROQ_API_KEY=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

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
```

#### Setup PostgreSQL Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fitness_nutrition_db;

# Create user (if needed)
CREATE USER fitness_user WITH PASSWORD 'your-password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fitness_nutrition_db TO fitness_user;

# Exit
\q
```

#### Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

#### Create Superuser
```bash
python manage.py createsuperuser
```

#### Load Initial Data (Optional)
```bash
python manage.py loaddata initial_data.json
```

#### Run Development Server
```bash
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=FitNutrition
```

#### Run Development Server
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 📁 Project Structure

```
fitness-nutrition-app/
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── measurements/
│   │   ├── nutrition/
│   │   ├── workouts/
│   │   ├── analytics/
│   │   └── recommendations/
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── store/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/refresh/` - Refresh JWT token

### User Profile
- `GET /api/profile/` - Get user profile
- `PUT /api/profile/` - Update user profile
- `PATCH /api/profile/` - Partial update

### Body Measurements
- `GET /api/measurements/` - List measurements
- `POST /api/measurements/` - Create measurement
- `GET /api/measurements/{id}/` - Get specific measurement
- `GET /api/measurements/history/` - Get measurement history

### Nutrition
- `GET /api/foods/` - List foods
- `POST /api/foods/` - Create custom food
- `GET /api/meals/` - List meals
- `POST /api/meals/` - Create meal
- `GET /api/meal-plans/` - List meal plans

### Workouts
- `GET /api/exercises/` - List exercises
- `GET /api/workouts/` - List workouts
- `POST /api/workouts/` - Create workout
- `GET /api/workout-plans/` - List workout plans

### Analytics
- `GET /api/analytics/bmr/` - Calculate BMR
- `GET /api/analytics/tdee/` - Calculate TDEE
- `GET /api/analytics/nutrition/` - Nutrition analysis
- `GET /api/analytics/progress/` - Progress data

### Recommendations (AI-Powered)
- `POST /api/recommendations/workout/` - Get workout recommendations
- `POST /api/recommendations/meal/` - Get meal recommendations
- `POST /api/recommendations/adaptive/` - Get adaptive recommendations

## 🤖 Groq API Integration

The application uses Groq API for AI-powered recommendations:

```python
from groq import Groq

client = Groq(api_key=os.getenv('GROQ_API_KEY'))

def get_workout_recommendation(user_data):
    response = client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[
            {"role": "system", "content": "You are a fitness expert..."},
            {"role": "user", "content": f"Create workout plan for: {user_data}"}
        ]
    )
    return response.choices[0].message.content
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🚀 Deployment

### Backend (Railway/Heroku)
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations
4. Deploy application

### Frontend (Vercel/Netlify)
1. Build production bundle: `npm run build`
2. Deploy `dist` folder
3. Configure environment variables

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

- Your Name

## 🙏 Acknowledgments

- Django REST Framework
- React.js
- Groq API
- Tailwind CSS
- Chart.js

## 📞 Support

For support, email support@fitnutrition.com or open an issue in the repository.
