# Simple API Test Script

Write-Host "=== Testing FitNutrition API ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is running
Write-Host "Test 1: Checking backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/admin/" -Method GET -ErrorAction Stop
    Write-Host "✓ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Test registration endpoint (should fail with validation error for GET)
Write-Host "Test 2: Testing registration endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        username = "testuser$(Get-Random)"
        email = "test$(Get-Random)@example.com"
        password = "TestPass123!"
        password2 = "TestPass123!"
        first_name = "Test"
        last_name = "User"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/register/" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "✓ Registration endpoint works!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
