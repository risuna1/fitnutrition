# Fix: Height and Weight Not Showing in Measurements Page

## Problem
When registering a new account with height (身長) and weight (体重), the data is saved to UserProfile but doesn't appear on the measurements page because it only displays BodyMeasurement records.

## Solution Plan
- [x] Analyze the issue
- [x] Update backend/apps/users/signals.py - Add signal to create initial BodyMeasurement
- [x] Create migration script for existing users
- [x] Create comprehensive documentation
- [ ] Test the fix with new user registration (Ready for testing)

## Files Edited
1. ✅ backend/apps/users/signals.py - Added post_save signal for UserProfile to create initial BodyMeasurement
2. ✅ backend/backfill_measurements.py - Created migration script for existing users

## Changes Made

### 1. Signal for Automatic Measurement Creation (signals.py)
- Added `create_initial_measurement` signal that triggers when a UserProfile is created
- Automatically creates a BodyMeasurement record with the registration data (height, weight, and other body measurements if provided)
- Only creates the measurement if the user doesn't already have any measurements
- This ensures new users will see their registration data on the measurements page

### 2. Backfill Script for Existing Users (backfill_measurements.py)
- Created a script to backfill measurements for users who registered before this fix
- Finds all users with profile data (height/weight) but no measurements
- Creates initial BodyMeasurement records for them
- Run with: `python backend/backfill_measurements.py`

## Testing Instructions
1. Register a new user with height and weight data
2. Login and navigate to the measurements page
3. Verify that the initial measurement appears with the registration data
4. For existing users, run the backfill script: `python backend/backfill_measurements.py`
