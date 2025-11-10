# Measurement Date Preservation Fix - TODO

## Problem
When updating measurements in the "測定履歴" section, the date field is being reset to today's date instead of preserving the original date.

## Tasks

### Backend Changes
- [x] Fix `BodyMeasurementCreateSerializer.validate()` to preserve date during updates
  - File: `backend/apps/measurements/serializers.py`
  - Only set default date for CREATE operations, not UPDATE
  - ✅ Modified validate() to check if instance exists (UPDATE) and preserve original date

### Frontend Changes
- [x] Add `date` field to formData state
  - File: `frontend/src/pages/Measurements.jsx`
  - ✅ Added date field to initial formData state
- [x] Update `handleEdit()` to include date from measurement
  - ✅ Added date to formValues in handleEdit()
- [x] Add read-only date input field in edit modal
  - ✅ Added date input field that is read-only when editing
- [x] Ensure date is sent when submitting updates
  - ✅ Date is now included in formData and will be sent with updates

### Testing
- [ ] Test updating existing measurements - date should remain unchanged
- [ ] Test creating new measurements - should default to today
- [ ] Verify unique constraint still works

## Status
- Started: Completed
- Current Step: Ready for Testing
- All code changes implemented successfully!

## Summary of Changes

### Backend (backend/apps/measurements/serializers.py)
```python
# Modified validate() method to preserve date during updates
if 'date' not in data or data['date'] is None:
    if self.instance:  # UPDATE operation
        data['date'] = self.instance.date  # Preserve original date
    else:  # CREATE operation
        data['date'] = date_class.today()  # Default to today
```

### Frontend (frontend/src/pages/Measurements.jsx)
1. Added `date` field to formData state
2. Updated `handleEdit()` to include date from measurement
3. Added date input field in modal (read-only when editing)
4. Date is now sent with all form submissions
