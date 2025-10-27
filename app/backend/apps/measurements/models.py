"""
Models for body measurements tracking
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User


class BodyMeasurement(models.Model):
    """
    Model to track body measurements over time
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='measurements')
    date = models.DateField(verbose_name='Measurement Date')
    
    # Weight and Body Composition
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(20), MaxValueValidator(500)],
        verbose_name='Weight (kg)'
    )
    height = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(50), MaxValueValidator(300)],
        blank=True,
        null=True,
        help_text='Height in centimeters',
        verbose_name='Height (cm)'
    )
    body_fat_percentage = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        validators=[MinValueValidator(3), MaxValueValidator(60)],
        blank=True,
        null=True,
        verbose_name='Body Fat %'
    )
    muscle_mass = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Muscle Mass (kg)'
    )
    
    # Body Measurements (circumferences in cm)
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
    arms_left = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Left Arm (cm)'
    )
    arms_right = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Right Arm (cm)'
    )
    thighs_left = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Left Thigh (cm)'
    )
    thighs_right = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Right Thigh (cm)'
    )
    calves_left = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Left Calf (cm)'
    )
    calves_right = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Right Calf (cm)'
    )
    neck = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Neck (cm)'
    )
    shoulders = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        verbose_name='Shoulders (cm)'
    )
    
    # Additional metrics
    notes = models.TextField(blank=True, verbose_name='Notes')
    photo = models.ImageField(
        upload_to='measurement_photos/',
        blank=True,
        null=True,
        verbose_name='Progress Photo'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Body Measurement'
        verbose_name_plural = 'Body Measurements'
        ordering = ['-date', '-created_at']
        unique_together = ['user', 'date']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.date} - {self.weight}kg"
    
    @property
    def bmi(self):
        """Calculate BMI if height is available"""
        try:
            # Use measurement's height if available, otherwise fall back to profile height
            height_cm = self.height if self.height else (self.user.profile.height if hasattr(self.user, 'profile') else None)
            if height_cm:
                height_m = float(height_cm) / 100  # Convert cm to m
                return round(float(self.weight) / (height_m ** 2), 1)
            return None
        except:
            return None
    
    @property
    def weight_change(self):
        """Calculate weight change from previous measurement"""
        previous = BodyMeasurement.objects.filter(
            user=self.user,
            date__lt=self.date
        ).order_by('-date').first()
        
        if previous:
            return round(float(self.weight) - float(previous.weight), 2)
        return None
    
    @property
    def body_fat_change(self):
        """Calculate body fat percentage change from previous measurement"""
        if not self.body_fat_percentage:
            return None
        
        previous = BodyMeasurement.objects.filter(
            user=self.user,
            date__lt=self.date,
            body_fat_percentage__isnull=False
        ).order_by('-date').first()
        
        if previous and previous.body_fat_percentage:
            return round(float(self.body_fat_percentage) - float(previous.body_fat_percentage), 1)
        return None


class ProgressLog(models.Model):
    """
    Model for general progress logging and notes
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress_logs')
    date = models.DateField(verbose_name='Log Date')
    
    # Subjective metrics
    energy_level = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='Rate your energy level (1-10)',
        verbose_name='Energy Level'
    )
    mood = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='Rate your mood (1-10)',
        verbose_name='Mood'
    )
    sleep_quality = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='Rate your sleep quality (1-10)',
        verbose_name='Sleep Quality'
    )
    sleep_hours = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(24)],
        verbose_name='Sleep Hours'
    )
    
    # Physical condition
    soreness_level = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='Rate muscle soreness (1-10)',
        verbose_name='Soreness Level'
    )
    stress_level = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='Rate stress level (1-10)',
        verbose_name='Stress Level'
    )
    
    # Notes
    notes = models.TextField(blank=True, verbose_name='Notes')
    achievements = models.TextField(blank=True, verbose_name='Achievements')
    challenges = models.TextField(blank=True, verbose_name='Challenges')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Progress Log'
        verbose_name_plural = 'Progress Logs'
        ordering = ['-date', '-created_at']
        unique_together = ['user', 'date']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.date}"
