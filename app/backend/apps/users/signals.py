"""
Signals for Users app
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, UserProfile, FoodPreference


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create UserProfile and FoodPreference when a new user is created
    """
    if created:
        # Create empty profile (will be filled during onboarding)
        # UserProfile.objects.create(user=instance)
        # Create empty food preferences
        # FoodPreference.objects.create(user=instance)
        pass  # Let user create profile manually during onboarding
