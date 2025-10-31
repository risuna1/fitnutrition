# Authentication Fix Test Script
Write-Host "=== Authentication Fix Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Register new user
Write-Host "Test 1: User Registration" -ForegroundColor Yellow
Write-Host "Testing registration with profile data..." -ForegroundColor Gray

$registerData = @{
    email = "testuser_$(Get-Random)@example.com"
    password = "TestPass123!"
    password2 = "TestPass123!"
    first_name = "太郎"
    last_name = "テスト"
    date_of_birth = "1990-01-01"
    gender = "M"
    height = "175"
    weight = "70"
    activity_level = "MODERATE"
    fitness_goal = "MAINTAIN"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register/" `
        -Method Post `
        -Body $registerData `
        -ContentType "application/json"
    
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.user.id)" -ForegroundColor Gray
    Write-Host "Username: $($registerResponse.user.username)" -ForegroundColor Gray
    Write-Host "Email: $($registerResponse.user.email)" -ForegroundColor Gray
    
    # Save email for login test
    $testEmail = ($registerData | ConvertFrom-Json).email
    $testPassword = ($registerData | ConvertFrom-Json).password
    
    Write-Host ""
    
    # Test 2: Login with registered user
    Write-Host "Test 2: User Login" -ForegroundColor Yellow
    Write-Host "Testing login with registered credentials..." -ForegroundColor Gray
    
    $loginData = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" `
        -Method Post `
        -Body $loginData `
        -ContentType "application/json"
    
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "Access Token: $($loginResponse.tokens.access.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "User: $($loginResponse.user.first_name) $($loginResponse.user.last_name)" -ForegroundColor Gray
    
    # Test 3: Check if profile was created
    Write-Host ""
    Write-Host "Test 3: Profile Creation" -ForegroundColor Yellow
    Write-Host "Checking if user profile was created..." -ForegroundColor Gray
    
    $headers = @{
        "Authorization" = "Bearer $($loginResponse.tokens.access)"
    }
    
    $profileResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/profile/" `
        -Method Get `
        -Headers $headers
    
    if ($profileResponse.profile) {
        Write-Host "✓ Profile exists!" -ForegroundColor Green
        Write-Host "Gender: $($profileResponse.profile.gender)" -ForegroundColor Gray
        Write-Host "Height: $($profileResponse.profile.height) cm" -ForegroundColor Gray
        Write-Host "Weight: $($profileResponse.profile.current_weight) kg" -ForegroundColor Gray
        Write-Host "Activity Level: $($profileResponse.profile.activity_level)" -ForegroundColor Gray
        Write-Host "Fitness Goal: $($profileResponse.profile.fitness_goal)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Profile not found" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "=== All Tests Passed! ===" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Test failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
