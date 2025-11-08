"""
Script to backfill BodyMeasurement records for existing users
who have UserProfile data but no measurements.

Run this script with: python manage.py shell < backfill_measurements.py
Or: python backfill_measurements.py (if you add Django setup)
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from apps.users.models import UserProfile
from apps.measurements.models import BodyMeasurement


def backfill_measurements():
    """
    Create initial BodyMeasurement records for users who have profile data
    but no measurements yet.
    """
    print("Starting backfill process...")
    
    # Get all user profiles with height and weight
    profiles_with_data = UserProfile.objects.filter(
        height__isnull=False,
        current_weight__isnull=False
    )
    
    created_count = 0
    skipped_count = 0
    
    for profile in profiles_with_data:
        # Check if user already has measurements
        existing_measurements = BodyMeasurement.objects.filter(user=profile.user).exists()
        
        if not existing_measurements:
            # Create initial measurement
            BodyMeasurement.objects.create(
                user=profile.user,
                date=timezone.now().date(),
                weight=profile.current_weight,
                height=profile.height,
                body_fat_percentage=profile.body_fat_percentage if profile.body_fat_percentage else None,
                chest=profile.chest if profile.chest else None,
                waist=profile.waist if profile.waist else None,
                hips=profile.hips if profile.hips else None,
                arms_left=profile.arms if profile.arms else None,
                arms_right=profile.arms if profile.arms else None,
                thighs_left=profile.thighs if profile.thighs else None,
                thighs_right=profile.thighs if profile.thighs else None,
                calves_left=profile.calves if profile.calves else None,
                calves_right=profile.calves if profile.calves else None,
            )
            created_count += 1
            print(f"✓ Created measurement for user: {profile.user.email}")
        else:
            skipped_count += 1
            print(f"- Skipped user (already has measurements): {profile.user.email}")
    
    print("\n" + "="*50)
    print(f"Backfill complete!")
    print(f"Created: {created_count} measurements")
    print(f"Skipped: {skipped_count} users (already had measurements)")
    print("="*50)


if __name__ == '__main__':
    backfill_measurements()
