# Comprehensive Testing Script for FitNutrition App

Write-Host "=== FitNutrition App - Comprehensive Testing ===" -ForegroundColor Cyan
Write-Host ""

# Function to test API endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Body = $null,
        [string]$Token = $null,
        [string]$Description
    )
    
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    Write-Host "  Method: $Method" -ForegroundColor Gray
    Write-Host "  URL: $Url" -ForegroundColor Gray
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params["Body"] = $Body
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✓ SUCCESS" -ForegroundColor Green
        return @{
            Success = $true
            Data = $response
        }
    }
    catch {
        Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Gray
        }
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
    finally {
        Write-Host ""
    }
}

# Wait for servers to start
Write-Host "Waiting for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$baseUrl = "http://127.0.0.1:8000/api"
$testResults = @()

# Test 1: User Registration
Write-Host "`n=== 1. Authentication Tests ===" -ForegroundColor Cyan
$randomNum = Get-Random -Minimum 1000 -Maximum 9999
$testUser = @{
    username = "testuser$randomNum"
    email = "test$randomNum@example.com"
    password = "TestPass123!"
    password2 = "TestPass123!"
    first_name = "Test"
    last_name = "User"
} | ConvertTo-Json

$regResult = Test-Endpoint -Method "POST" -Url "$baseUrl/auth/register/" -Body $testUser -Description "User Registration"
$testResults += @{Test = "User Registration"; Result = $regResult.Success}

$accessToken = $null
if ($regResult.Success) {
    $accessToken = $regResult.Data.tokens.access
    Write-Host "Access Token obtained: $($accessToken.Substring(0, 20))..." -ForegroundColor Green
}

# Test 2: User Login
if ($regResult.Success) {
    $loginData = @{
        email = "test$randomNum@example.com"
        password = "TestPass123!"
    } | ConvertTo-Json
    
    $loginResult = Test-Endpoint -Method "POST" -Url "$baseUrl/auth/login/" -Body $loginData -Description "User Login"
    $testResults += @{Test = "User Login"; Result = $loginResult.Success}
    
    if ($loginResult.Success) {
        $accessToken = $loginResult.Data.tokens.access
    }
}

# Test 3: Get Current User Profile
if ($accessToken) {
    Write-Host "`n=== 2. Profile Tests ===" -ForegroundColor Cyan
    $profileResult = Test-Endpoint -Method "GET" -Url "$baseUrl/profile/" -Token $accessToken -Description "Get Current User Profile"
    $testResults += @{Test = "Get Profile"; Result = $profileResult.Success}
}

# Test 4: Create User Profile
if ($accessToken) {
    $profileData = @{
        gender = "male"
        height = 175
        current_weight = 75
        target_weight = 70
        activity_level = "moderate"
        fitness_goal = "weight_loss"
    } | ConvertTo-Json
    
    $createProfileResult = Test-Endpoint -Method "POST" -Url "$baseUrl/profile/create/" -Body $profileData -Token $accessToken -Description "Create User Profile"
    $testResults += @{Test = "Create Profile"; Result = $createProfileResult.Success}
}

# Test 5: Get User Stats
if ($accessToken) {
    $statsResult = Test-Endpoint -Method "GET" -Url "$baseUrl/profile/stats/" -Token $accessToken -Description "Get User Stats"
    $testResults += @{Test = "Get User Stats"; Result = $statsResult.Success}
}

# Test 6: Food Preferences
if ($accessToken) {
    $foodPrefData = @{
        diet_type = "vegetarian"
        allergies = "peanuts, shellfish"
        preferred_foods = "vegetables, fruits"
    } | ConvertTo-Json
    
    $foodPrefResult = Test-Endpoint -Method "PUT" -Url "$baseUrl/profile/food-preferences/" -Body $foodPrefData -Token $accessToken -Description "Update Food Preferences"
    $testResults += @{Test = "Food Preferences"; Result = $foodPrefResult.Success}
}

# Test 7: Measurements
if ($accessToken) {
    Write-Host "`n=== 3. Measurements Tests ===" -ForegroundColor Cyan
    $measurementData = @{
        weight = 75.5
        height = 175
        date = (Get-Date -Format "yyyy-MM-dd")
        body_fat_percentage = 18.5
        chest = 95
        waist = 80
        hips = 95
    } | ConvertTo-Json
    
    $measurementResult = Test-Endpoint -Method "POST" -Url "$baseUrl/measurements/" -Body $measurementData -Token $accessToken -Description "Create Measurement"
    $testResults += @{Test = "Create Measurement"; Result = $measurementResult.Success}
    
    # Get measurements list
    $getMeasurementsResult = Test-Endpoint -Method "GET" -Url "$baseUrl/measurements/" -Token $accessToken -Description "Get Measurements List"
    $testResults += @{Test = "Get Measurements"; Result = $getMeasurementsResult.Success}
}

# Test 8: Nutrition
if ($accessToken) {
    Write-Host "`n=== 4. Nutrition Tests ===" -ForegroundColor Cyan
    $mealData = @{
        name = "Breakfast"
        meal_type = "breakfast"
        date = (Get-Date -Format "yyyy-MM-dd")
        foods = @(
            @{
                name = "Oatmeal"
                calories = 150
                protein = 5
                carbs = 27
                fats = 3
                serving_size = "1 cup"
            }
        )
    } | ConvertTo-Json -Depth 3
    
    $mealResult = Test-Endpoint -Method "POST" -Url "$baseUrl/nutrition/meals/" -Body $mealData -Token $accessToken -Description "Create Meal"
    $testResults += @{Test = "Create Meal"; Result = $mealResult.Success}
    
    # Get meals list
    $getMealsResult = Test-Endpoint -Method "GET" -Url "$baseUrl/nutrition/meals/" -Token $accessToken -Description "Get Meals List"
    $testResults += @{Test = "Get Meals"; Result = $getMealsResult.Success}
}

# Test 9: Workouts
if ($accessToken) {
    Write-Host "`n=== 5. Workouts Tests ===" -ForegroundColor Cyan
    $workoutData = @{
        name = "Morning Run"
        date = (Get-Date -Format "yyyy-MM-dd")
        notes = "Felt great!"
        exercises = @()  # Empty array for exercises
    } | ConvertTo-Json
    
    $workoutResult = Test-Endpoint -Method "POST" -Url "$baseUrl/workouts/" -Body $workoutData -Token $accessToken -Description "Create Workout"
    $testResults += @{Test = "Create Workout"; Result = $workoutResult.Success}
    
    # Get workouts list
    $getWorkoutsResult = Test-Endpoint -Method "GET" -Url "$baseUrl/workouts/" -Token $accessToken -Description "Get Workouts List"
    $testResults += @{Test = "Get Workouts"; Result = $getWorkoutsResult.Success}
}

# Test 10: Analytics
if ($accessToken) {
    Write-Host "`n=== 6. Analytics Tests ===" -ForegroundColor Cyan
    $dashboardResult = Test-Endpoint -Method "GET" -Url "$baseUrl/analytics/dashboard/" -Token $accessToken -Description "Get Dashboard Data"
    $testResults += @{Test = "Dashboard Analytics"; Result = $dashboardResult.Success}
}

# Test 11: Recommendations
if ($accessToken) {
    Write-Host "`n=== 7. Recommendations Tests ===" -ForegroundColor Cyan
    $nutritionRecResult = Test-Endpoint -Method "GET" -Url "$baseUrl/recommendations/nutrition/" -Token $accessToken -Description "Get Nutrition Recommendations"
    $testResults += @{Test = "Nutrition Recommendations"; Result = $nutritionRecResult.Success}
    
    $workoutRecResult = Test-Endpoint -Method "GET" -Url "$baseUrl/recommendations/workouts/" -Token $accessToken -Description "Get Workout Recommendations"
    $testResults += @{Test = "Workout Recommendations"; Result = $workoutRecResult.Success}
}

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host ""

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Result -eq $true }).Count
$failedTests = $totalTests - $passedTests

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host ""

if ($failedTests -gt 0) {
    Write-Host "Failed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Result -eq $false } | ForEach-Object {
        Write-Host "  - $($_.Test)" -ForegroundColor Red
    }
}

Write-Host ""
$successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 50) { "Yellow" } else { "Red" })

Write-Host "`n=== Testing Complete ===" -ForegroundColor Cyan
