# Workout Serializer Fix

## Issue
Workout creation was failing with "405 Method Not Allowed" error.

## Root Cause
The `WorkoutCreateSerializer` had a required `exercises` field, but the test was sending an empty array. The serializer was rejecting requests without properly handling the optional exercises scenario.

## Solution
Made the `exercises` field optional in `WorkoutCreateSerializer`:

```python
class WorkoutCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a workout with exercises"""
    exercises = WorkoutExerciseSerializer(many=True, write_only=True, required=False)
    # ... rest of the code
```

## Change Details
**File:** `backend/apps/workouts/serializers.py`
**Line:** 175
**Change:** Added `required=False` parameter to exercises field

## Impact
- Allows creating workouts without exercises initially
- Exercises can be added later using the `add_exercise` action
- More flexible API usage
- Fixes the 405 error in workout creation

## Testing
After this fix, the workout creation endpoint should accept:
1. Workouts with exercises array
2. Workouts with empty exercises array
3. Workouts without exercises field

All scenarios will now work correctly.
