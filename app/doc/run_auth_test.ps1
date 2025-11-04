# Authentication Fix Test Runner
Write-Host "=== Starting Authentication Test ===" -ForegroundColor Cyan
Write-Host ""

# Check if backend server is running
Write-Host "Checking if backend server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login/" -Method Options -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✓ Backend server is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend server is not running!" -ForegroundColor Red
    Write-Host "Please start the backend server first:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Gray
    Write-Host "  .\.venv\Scripts\Activate.ps1" -ForegroundColor Gray
    Write-Host "  python manage.py runserver" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host ""

# Run the authentication test
Write-Host "Running authentication tests..." -ForegroundColor Yellow
Write-Host ""

& .\test_auth_fix.ps1

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the frontend server: cd frontend && npm run dev" -ForegroundColor Gray
Write-Host "2. Open browser to http://localhost:5173/register" -ForegroundColor Gray
Write-Host "3. Test registration with the form" -ForegroundColor Gray
Write-Host "4. Test login with registered credentials" -ForegroundColor Gray
