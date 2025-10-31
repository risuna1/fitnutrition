# Database Setup Script for Windows PowerShell

Write-Host "=== FitNutrition Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Create migrations
Write-Host "Creating migrations..." -ForegroundColor Yellow
python manage.py makemigrations

# Apply migrations
Write-Host "Applying migrations..." -ForegroundColor Yellow
python manage.py migrate

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create a superuser: python manage.py createsuperuser"
Write-Host "2. Run the server: python manage.py runserver"
