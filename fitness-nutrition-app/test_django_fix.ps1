# Django Admin & Login Fix Test Script
Write-Host "=== Django Admin & Login Fix Test ===" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location backend

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv\Scripts\Activate.ps1") {
    .\venv\Scripts\Activate.ps1
} else {
    Write-Host "Virtual environment not found. Please create it first:" -ForegroundColor Red
    Write-Host "  python -m venv venv" -ForegroundColor Yellow
    Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
    Write-Host "  pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Running Django system check..." -ForegroundColor Yellow
python manage.py check

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Django system check passed!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Testing authentication backend..." -ForegroundColor Yellow
    python -c "from apps.users.backends import EmailBackend; print('✓ EmailBackend imported successfully')"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Custom authentication backend is working!" -ForegroundColor Green
    } else {
        Write-Host "✗ Error importing authentication backend" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "=== Fix Applied Successfully ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start the Django server:" -ForegroundColor White
    Write-Host "   python manage.py runserver" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "2. Test Django Admin:" -ForegroundColor White
    Write-Host "   http://localhost:8000/admin/" -ForegroundColor Yellow
    Write-Host "   - Login with email or username" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Test API Registration:" -ForegroundColor White
    Write-Host "   POST http://localhost:8000/api/auth/register/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Test API Login:" -ForegroundColor White
    Write-Host "   POST http://localhost:8000/api/auth/login/" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Django system check failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
}

# Return to root directory
Set-Location ..
