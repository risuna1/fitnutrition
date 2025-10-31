"""
User Models for FitNutrition
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    """
    Custom User Model extending Django's AbstractUser
    """
    email = models.EmailField(unique=True, verbose_name='Email Address')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Phone Number')
    date_of_birth = models.DateField(blank=True, null=True, verbose_name='Date of Birth')
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True,
        verbose_name='Profile Picture'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def age(self):
        """Calculate user's age from date of birth"""
        if self.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None


class UserProfile(models.Model):
    """
    Extended User Profile with fitness-related information
    """
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    ACTIVITY_LEVEL_CHOICES = [
        ('sedentary', 'Sedentary (little or no exercise)'),
        ('light', 'Lightly Active (light exercise 1-3 days/week)'),
        ('moderate', 'Moderately Active (moderate exercise 3-5 days/week)'),
        ('very', 'Very Active (hard exercise 6-7 days/week)'),
        ('extra', 'Extra Active (very hard exercise, physical job)'),
    ]
    
    FITNESS_GOAL_CHOICES = [
        ('weight_loss', 'Weight Loss'),
        ('muscle_gain', 'Muscle Gain'),
        ('maintenance', 'Maintenance'),
        ('endurance', 'Endurance'),
        ('flexibility', 'Flexibility'),
        ('general_fitness', 'General Fitness'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, verbose_name='Gender')
    height = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(50), MaxValueValidator(300)],
        help_text='Height in centimeters',
        verbose_name='Height (cm)'
    )
    current_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(20), MaxValueValidator(500)],
        help_text='Current weight in kilograms',
        verbose_name='Current Weight (kg)'
    )
    target_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(20), MaxValueValidator(500)],
        blank=True,
        null=True,
        help_text='Target weight in kilograms',
        verbose_name='Target Weight (kg)'
    )
    activity_level = models.CharField(
        max_length=20,
        choices=ACTIVITY_LEVEL_CHOICES,
        default='moderate',
        verbose_name='Activity Level'
    )
    fitness_goal = models.CharField(
        max_length=20,
        choices=FITNESS_GOAL_CHOICES,
        default='general_fitness',
        verbose_name='Fitness Goal'
    )
    body_fat_percentage = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        validators=[MinValueValidator(3), MaxValueValidator(60)],
        blank=True,
        null=True,
        verbose_name='Body Fat Percentage'
    )
    
    # Body Measurements (optional)
    chest = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Chest (cm)'
    )
    waist = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Waist (cm)'
    )
    hips = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Hips (cm)'
    )
    arms = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Arms (cm)'
    )
    thighs = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Thighs (cm)'
    )
    calves = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Calves (cm)'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.get_full_name()}'s Profile"
    
    @property
    def bmi(self):
        """Calculate Body Mass Index"""
        if self.height and self.current_weight:
            height_m = float(self.height) / 100
            return round(float(self.current_weight) / (height_m ** 2), 1)
        return None
    
    @property
    def bmr(self):
        """Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation"""
        if not all([self.current_weight, self.height, self.user.age, self.gender]):
            return None
        
        weight = float(self.current_weight)
        height = float(self.height)
        age = self.user.age
        
        if self.gender == 'male':
            return round(10 * weight + 6.25 * height - 5 * age + 5, 0)
        else:  # female or other
            return round(10 * weight + 6.25 * height - 5 * age - 161, 0)
    
    @property
    def tdee(self):
        """Calculate Total Daily Energy Expenditure"""
        if not self.bmr:
            return None
        
        activity_multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'very': 1.725,
            'extra': 1.9,
        }
        
        multiplier = activity_multipliers.get(self.activity_level, 1.55)
        return round(self.bmr * multiplier, 0)
    
    @property
    def daily_calorie_target(self):
        """Calculate daily calorie target based on fitness goal"""
        if not self.tdee:
            return None
        
        goal_adjustments = {
            'weight_loss': -500,  # 500 calorie deficit
            'muscle_gain': 300,   # 300 calorie surplus
            'maintenance': 0,
            'endurance': 200,
            'flexibility': 0,
            'general_fitness': 0,
        }
        
        adjustment = goal_adjustments.get(self.fitness_goal, 0)
        return round(self.tdee + adjustment, 0)
    
    @property
    def macro_targets(self):
        """Calculate macronutrient targets based on fitness goal"""
        if not self.daily_calorie_target:
            return None
        
        calories = float(self.daily_calorie_target)
        weight = float(self.current_weight)
        
        # Macro ratios based on fitness goal
        if self.fitness_goal == 'weight_loss':
            protein_ratio = 0.35
            carb_ratio = 0.35
            fat_ratio = 0.30
        elif self.fitness_goal == 'muscle_gain':
            protein_ratio = 0.30
            carb_ratio = 0.45
            fat_ratio = 0.25
        else:  # maintenance, endurance, etc.
            protein_ratio = 0.30
            carb_ratio = 0.40
            fat_ratio = 0.30
        
        return {
            'protein': round((calories * protein_ratio) / 4, 0),  # 4 cal/g
            'carbs': round((calories * carb_ratio) / 4, 0),       # 4 cal/g
            'fats': round((calories * fat_ratio) / 9, 0),         # 9 cal/g
        }


class FoodPreference(models.Model):
    """
    User's food preferences, allergies, and dietary restrictions
    """
    DIET_TYPE_CHOICES = [
        ('omnivore', 'Omnivore'),
        ('vegetarian', 'Vegetarian'),
        ('vegan', 'Vegan'),
        ('pescatarian', 'Pescatarian'),
        ('keto', 'Ketogenic'),
        ('paleo', 'Paleo'),
        ('mediterranean', 'Mediterranean'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='food_preferences')
    diet_type = models.CharField(
        max_length=20,
        choices=DIET_TYPE_CHOICES,
        default='omnivore',
        verbose_name='Diet Type'
    )
    allergies = models.TextField(
        blank=True,
        help_text='List any food allergies (comma-separated)',
        verbose_name='Allergies'
    )
    dislikes = models.TextField(
        blank=True,
        help_text='Foods you dislike (comma-separated)',
        verbose_name='Dislikes'
    )
    preferred_foods = models.TextField(
        blank=True,
        help_text='Your favorite foods (comma-separated)',
        verbose_name='Preferred Foods'
    )
    avoid_ingredients = models.TextField(
        blank=True,
        help_text='Ingredients to avoid (comma-separated)',
        verbose_name='Avoid Ingredients'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Food Preference'
        verbose_name_plural = 'Food Preferences'
    
    def __str__(self):
        return f"{self.user.get_full_name()}'s Food Preferences"
