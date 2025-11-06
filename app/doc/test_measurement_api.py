"""
Quick test script to verify measurement API works correctly
Run this after starting the Django server
"""
import requests
import json
from datetime import date

# Configuration
BASE_URL = "http://localhost:8000/api"
# You'll need to replace these with actual credentials or token
USERNAME = "demo@example.com"
PASSWORD = "demo123"

def get_auth_token():
    """Get authentication token"""
    response = requests.post(
        f"{BASE_URL}/users/login/",
        json={"email": USERNAME, "password": PASSWORD}
    )
    if response.status_code == 200:
        return response.json().get('access')
    else:
        print(f"Login failed: {response.status_code}")
        print(response.text)
        return None

def test_create_measurement(token):
    """Test creating a measurement with simplified field names"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test data using simplified field names (as frontend sends)
    measurement_data = {
        "weight": 70.5,
        "height": 175,
        "body_fat_percentage": 18.5,
        "chest": 98,
        "waist": 82,
        "hips": 95,
        "arms": 35,      # Simplified field
        "thighs": 58,    # Simplified field
        "calves": 38,    # Simplified field
    }
    
    print("\n=== Testing Measurement Creation ===")
    print(f"Sending data: {json.dumps(measurement_data, indent=2)}")
    
    response = requests.post(
        f"{BASE_URL}/measurements/",
        headers=headers,
        json=measurement_data
    )
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Body: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        print("\n✅ SUCCESS: Measurement created successfully!")
        return response.json()
    else:
        print("\n❌ FAILED: Could not create measurement")
        return None

def test_get_measurements(token):
    """Test getting measurements list"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n=== Testing Get Measurements ===")
    
    response = requests.get(
        f"{BASE_URL}/measurements/",
        headers=headers
    )
    
    print(f"Response Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', data)
        print(f"\n✅ SUCCESS: Retrieved {len(results)} measurements")
        
        if results:
            print("\nLatest measurement:")
            print(json.dumps(results[0], indent=2))
        
        return results
    else:
        print(f"\n❌ FAILED: Could not get measurements")
        print(response.text)
        return None

def main():
    print("=" * 60)
    print("Measurement API Test Script")
    print("=" * 60)
    
    # Get authentication token
    print("\n1. Authenticating...")
    token = get_auth_token()
    
    if not token:
        print("\n❌ Authentication failed. Please check credentials.")
        return
    
    print("✅ Authentication successful!")
    
    # Test creating measurement
    print("\n2. Testing measurement creation...")
    created = test_create_measurement(token)
    
    # Test getting measurements
    print("\n3. Testing measurement retrieval...")
    measurements = test_get_measurements(token)
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    if created and measurements:
        print("✅ All tests passed!")
        print("\nVerify in the frontend:")
        print("1. Login to the application")
        print("2. Go to Measurements page (身体測定)")
        print("3. Check if the data appears in the table")
        print("4. Check if charts display the data")
    else:
        print("❌ Some tests failed. Check the output above.")

if __name__ == "__main__":
    main()
