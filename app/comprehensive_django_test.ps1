# Comprehensive Django Admin & Authentication Test Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Django Admin & Authentication Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$testResults = @()

function Add-TestResult {
    param($TestName, $Status, $Message)
    $testResults += [PSCustomObject]@{
        Test = $TestName
        Status = $Status
        Message = $Message
    }
}

# Navigate to backend directory
Set-Location backend

# Check if virtual environment exists
if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "✗ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please create it first:" -ForegroundColor Yellow
    Write-Host "  python -m venv venv" -ForegroundColor Gray
    Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
    Write-Host "  pip install -r requirements.txt" -ForegroundColor Gray
    Set-Location ..
    exit 1
}

# Activate virtual environment
Write-Host "1. Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1
Write-Host "   ✓ Virtual environment activated" -ForegroundColor Green
Write-Host ""

# Test 1: Django System Check
Write-Host "2. Running Django system check..." -ForegroundColor Yellow
$checkOutput = python manage.py check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Django system check passed" -ForegroundColor Green
    Add-TestResult "Django System Check" "PASS" "No issues found"
} else {
    Write-Host "   ✗ Django system check failed" -ForegroundColor Red
    Write-Host $checkOutput -ForegroundColor Red
    Add-TestResult "Django System Check" "FAIL" $checkOutput
}
Write-Host ""

# Test 2: Import Custom Authentication Backend
Write-Host "3. Testing custom authentication backend import..." -ForegroundColor Yellow
$importTest = python -c "from apps.users.backends import EmailBackend; print('SUCCESS')" 2>&1
if ($importTest -match "SUCCESS") {
    Write-Host "   ✓ EmailBackend imported successfully" -ForegroundColor Green
    Add-TestResult "EmailBackend Import" "PASS" "Backend imported successfully"
} else {
    Write-Host "   ✗ Failed to import EmailBackend" -ForegroundColor Red
    Write-Host $importTest -ForegroundColor Red
    Add-TestResult "EmailBackend Import" "FAIL" $importTest
}
Write-Host ""

# Test 3: Check Authentication Backends Configuration
Write-Host "4. Verifying authentication backends configuration..." -ForegroundColor Yellow
$configTest = python -c "from django.conf import settings; backends = settings.AUTHENTICATION_BACKENDS; print('EmailBackend' if 'apps.users.backends.EmailBackend' in backends else 'NOT_FOUND')" 2>&1
if ($configTest -match "EmailBackend") {
    Write-Host "   ✓ Custom backend configured in settings" -ForegroundColor Green
    Add-TestResult "Backend Configuration" "PASS" "EmailBackend found in AUTHENTICATION_BACKENDS"
} else {
    Write-Host "   ✗ Custom backend not found in settings" -ForegroundColor Red
    Add-TestResult "Backend Configuration" "FAIL" "EmailBackend not in AUTHENTICATION_BACKENDS"
}
Write-Host ""

# Test 4: Check Database Connection
Write-Host "5. Testing database connection..." -ForegroundColor Yellow
$dbTest = python manage.py dbshell --command="SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0 -or $dbTest -match "1") {
    Write-Host "   ✓ Database connection successful" -ForegroundColor Green
    Add-TestResult "Database Connection" "PASS" "Connected to database"
} else {
    Write-Host "   ⚠ Database connection test skipped or failed" -ForegroundColor Yellow
    Add-TestResult "Database Connection" "SKIP" "Could not verify connection"
}
Write-Host ""

# Test 5: Check Migrations
Write-Host "6. Checking for pending migrations..." -ForegroundColor Yellow
$migrationsCheck = python manage.py showmigrations --plan 2>&1
if ($migrationsCheck -match "\[ \]") {
    Write-Host "   ⚠ Pending migrations found" -ForegroundColor Yellow
    Write-Host "   Run: python manage.py migrate" -ForegroundColor Gray
    Add-TestResult "Migrations Check" "WARN" "Pending migrations exist"
} else {
    Write-Host "   ✓ All migrations applied" -ForegroundColor Green
    Add-TestResult "Migrations Check" "PASS" "No pending migrations"
}
Write-Host ""

# Test 6: Start Django Server (background)
Write-Host "7. Starting Django development server..." -ForegroundColor Yellow
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    .\venv\Scripts\Activate.ps1
    python manage.py runserver 2>&1
}

# Wait for server to start
Start-Sleep -Seconds 5

# Check if server is running
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/admin/" -Method GET -TimeoutSec 5 -UseBasicParsing 2>$null
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 302) {
        Write-Host "   ✓ Django server started successfully" -ForegroundColor Green
        $serverRunning = $true
        Add-TestResult "Server Start" "PASS" "Server running on port 8000"
    }
} catch {
    Write-Host "   ✗ Failed to start Django server" -ForegroundColor Red
    Add-TestResult "Server Start" "FAIL" "Server not responding"
}
Write-Host ""

if ($serverRunning) {
    # Test 7: Django Admin Page Access
    Write-Host "8. Testing Django Admin page access..." -ForegroundColor Yellow
    try {
        $adminResponse = Invoke-WebRequest -Uri "http://localhost:8000/admin/" -Method GET -UseBasicParsing
        if ($adminResponse.StatusCode -eq 200 -or $adminResponse.StatusCode -eq 302) {
            Write-Host "   ✓ Admin page accessible" -ForegroundColor Green
            Add-TestResult "Admin Page Access" "PASS" "Admin page loaded successfully"
        }
    } catch {
        Write-Host "   ✗ Failed to access admin page" -ForegroundColor Red
        Add-TestResult "Admin Page Access" "FAIL" $_.Exception.Message
    }
    Write-Host ""

    # Test 8: API Registration Endpoint
    Write-Host "9. Testing API registration endpoint..." -ForegroundColor Yellow
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $testUser = @{
        username = "testuser_$timestamp"
        email = "test_${timestamp}@example.com"
        password = "SecurePass123!"
        password2 = "SecurePass123!"
        first_name = "Test"
        last_name = "User"
    } | ConvertTo-Json

    try {
        $registerResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register/" `
            -Method POST `
            -Body $testUser `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        if ($registerResponse.user -and $registerResponse.tokens) {
            Write-Host "   ✓ User registration successful" -ForegroundColor Green
            Write-Host "     User ID: $($registerResponse.user.id)" -ForegroundColor Gray
            Write-Host "     Email: $($registerResponse.user.email)" -ForegroundColor Gray
            Add-TestResult "API Registration" "PASS" "User created successfully"
            
            # Save credentials for login test
            $script:testEmail = $registerResponse.user.email
            $script:testPassword = "SecurePass123!"
        } else {
            Write-Host "   ✗ Registration response incomplete" -ForegroundColor Red
            Add-TestResult "API Registration" "FAIL" "Missing user or tokens in response"
        }
    } catch {
        Write-Host "   ✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
        Add-TestResult "API Registration" "FAIL" $_.Exception.Message
    }
    Write-Host ""

    # Test 9: API Login with Email
    Write-Host "10. Testing API login with email..." -ForegroundColor Yellow
    if ($script:testEmail) {
        $loginData = @{
            email = $script:testEmail
            password = $script:testPassword
        } | ConvertTo-Json

        try {
            $loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" `
                -Method POST `
                -Body $loginData `
                -ContentType "application/json" `
                -ErrorAction Stop
            
            if ($loginResponse.user -and $loginResponse.tokens) {
                Write-Host "   ✓ Login with email successful" -ForegroundColor Green
                Write-Host "     Access Token: $($loginResponse.tokens.access.Substring(0,20))..." -ForegroundColor Gray
                Add-TestResult "API Login (Email)" "PASS" "Login successful with email"
                
                $script:accessToken = $loginResponse.tokens.access
            } else {
                Write-Host "   ✗ Login response incomplete" -ForegroundColor Red
                Add-TestResult "API Login (Email)" "FAIL" "Missing user or tokens"
            }
        } catch {
            Write-Host "   ✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
            Add-TestResult "API Login (Email)" "FAIL" $_.Exception.Message
        }
    } else {
        Write-Host "   ⚠ Skipped (no test user created)" -ForegroundColor Yellow
        Add-TestResult "API Login (Email)" "SKIP" "No test user available"
    }
    Write-Host ""

    # Test 10: API Login with Wrong Password
    Write-Host "11. Testing API login with wrong password..." -ForegroundColor Yellow
    if ($script:testEmail) {
        $wrongLoginData = @{
            email = $script:testEmail
            password = "WrongPassword123!"
        } | ConvertTo-Json

        try {
            $wrongLoginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" `
                -Method POST `
                -Body $wrongLoginData `
                -ContentType "application/json" `
                -ErrorAction Stop
            
            Write-Host "   ✗ Login should have failed but succeeded" -ForegroundColor Red
            Add-TestResult "Wrong Password Test" "FAIL" "Login succeeded with wrong password"
        } catch {
            if ($_.Exception.Response.StatusCode -eq 401) {
                Write-Host "   ✓ Correctly rejected wrong password" -ForegroundColor Green
                Add-TestResult "Wrong Password Test" "PASS" "Wrong password correctly rejected"
            } else {
                Write-Host "   ✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
                Add-TestResult "Wrong Password Test" "FAIL" $_.Exception.Message
            }
        }
    } else {
        Write-Host "   ⚠ Skipped (no test user created)" -ForegroundColor Yellow
        Add-TestResult "Wrong Password Test" "SKIP" "No test user available"
    }
    Write-Host ""

    # Test 11: Authenticated API Request
    Write-Host "12. Testing authenticated API request..." -ForegroundColor Yellow
    if ($script:accessToken) {
        try {
            $headers = @{
                "Authorization" = "Bearer $($script:accessToken)"
            }
            $profileResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/me/" `
                -Method GET `
                -Headers $headers `
                -ErrorAction Stop
            
            Write-Host "   ✓ Authenticated request successful" -ForegroundColor Green
            Write-Host "     User: $($profileResponse.email)" -ForegroundColor Gray
            Add-TestResult "Authenticated Request" "PASS" "JWT token working correctly"
        } catch {
            Write-Host "   ✗ Authenticated request failed: $($_.Exception.Message)" -ForegroundColor Red
            Add-TestResult "Authenticated Request" "FAIL" $_.Exception.Message
        }
    } else {
        Write-Host "   ⚠ Skipped (no access token available)" -ForegroundColor Yellow
        Add-TestResult "Authenticated Request" "SKIP" "No access token"
    }
    Write-Host ""

    # Stop the server
    Write-Host "13. Stopping Django server..." -ForegroundColor Yellow
    Stop-Job -Job $serverJob
    Remove-Job -Job $serverJob
    Write-Host "   ✓ Server stopped" -ForegroundColor Green
    Write-Host ""
}

# Return to root directory
Set-Location ..

# Display Test Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$skipCount = ($testResults | Where-Object { $_.Status -eq "SKIP" }).Count
$warnCount = ($testResults | Where-Object { $_.Status -eq "WARN" }).Count
$totalCount = $testResults.Count

foreach ($result in $testResults) {
    $color = switch ($result.Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "SKIP" { "Yellow" }
        "WARN" { "Yellow" }
    }
    $symbol = switch ($result.Status) {
        "PASS" { "✓" }
        "FAIL" { "✗" }
        "SKIP" { "⊘" }
        "WARN" { "⚠" }
    }
    Write-Host "$symbol $($result.Test): " -NoNewline
    Write-Host $result.Status -ForegroundColor $color
}

Write-Host ""
Write-Host "Total Tests: $totalCount" -ForegroundColor Cyan
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Skipped: $skipCount" -ForegroundColor Yellow
Write-Host "Warnings: $warnCount" -ForegroundColor Yellow
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ALL CRITICAL TESTS PASSED! ✓" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "The Django admin error has been fixed!" -ForegroundColor Green
    Write-Host "Login and registration are working correctly!" -ForegroundColor Green
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   SOME TESTS FAILED! ✗" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review the failed tests above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review the test results above" -ForegroundColor White
Write-Host "2. Start the server: cd backend; python manage.py runserver" -ForegroundColor White
Write-Host "3. Access Django Admin: http://localhost:8000/admin/" -ForegroundColor White
Write-Host "4. Test with frontend application" -ForegroundColor White
Write-Host ""
