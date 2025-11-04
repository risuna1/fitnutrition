# Start Both Servers Script

Write-Host "=== Starting FitNutrition App Servers ===" -ForegroundColor Cyan
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
$backendScript = @"
cd 'C:\Users\ykh2435058\Documents\sotsuken\fitness-nutrition-app\backend'
.\venv\Scripts\Activate.ps1
Write-Host 'Backend server starting...' -ForegroundColor Green
python manage.py runserver
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

Write-Host "Backend server started in new window" -ForegroundColor Green
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
$frontendScript = @"
cd 'C:\Users\ykh2435058\Documents\sotsuken\fitness-nutrition-app\frontend'
Write-Host 'Frontend server starting...' -ForegroundColor Green
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host "Frontend server started in new window" -ForegroundColor Green
Write-Host ""
Write-Host "=== Servers Starting ===" -ForegroundColor Cyan
Write-Host "Backend: http://127.0.0.1:8000/" -ForegroundColor White
Write-Host "Frontend: http://localhost:5174/" -ForegroundColor White
Write-Host ""
Write-Host "Waiting 10 seconds for servers to fully start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Servers should now be ready!" -ForegroundColor Green
Write-Host "You can now run: .\comprehensive_test.ps1" -ForegroundColor Cyan
