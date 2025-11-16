"""
Analytics service for calculating BMR, TDEE, and other metrics
"""
from datetime import datetime, timedelta
from django.db import models
from django.db.models import Avg, Sum, Count
from django.utils import timezone
from apps.measurements.models import BodyMeasurement
from apps.nutrition.models import Meal
from apps.workouts.models import Workout


class MetabolismCalculator:
    """Calculate BMR and TDEE"""
    
    # Activity level multipliers
    ACTIVITY_MULTIPLIERS = {
        'sedentary': 1.2,        # Little or no exercise
        'light': 1.375,          # Light exercise 1-3 days/week
        'moderate': 1.55,        # Moderate exercise 3-5 days/week
        'active': 1.725,         # Hard exercise 6-7 days/week
        'very_active': 1.9       # Very hard exercise & physical job
    }
    
    @staticmethod
    def calculate_bmr(weight_kg, height_cm, age, gender):
        """
        Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
        
        Args:
            weight_kg: Weight in kilograms
            height_cm: Height in centimeters
            age: Age in years
            gender: 'male' or 'female'
        
        Returns:
            BMR in calories/day
        """
        if gender.lower() == 'male':
            bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
        else:  # female
            bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
        
        return round(bmr, 2)
    
    @classmethod
    def calculate_tdee(cls, bmr, activity_level):
        """
        Calculate Total Daily Energy Expenditure
        
        Args:
            bmr: Basal Metabolic Rate
            activity_level: Activity level key from ACTIVITY_MULTIPLIERS
        
        Returns:
            TDEE in calories/day
        """
        multiplier = cls.ACTIVITY_MULTIPLIERS.get(activity_level, 1.2)
        tdee = bmr * multiplier
        return round(tdee, 2)
    
    @classmethod
    def calculate_for_user(cls, user):
        """
        Calculate BMR and TDEE for a user
        
        Args:
            user: User object
        
        Returns:
            dict with bmr, tdee, and other metrics
        """
        try:
            profile = user.profile
            latest_measurement = BodyMeasurement.objects.filter(
                user=user
            ).order_by('-date').first()
            
            if not latest_measurement:
                return None
            
            # Calculate BMR
            # Get age from user, not profile
            age = user.age if user.age else 30  # Default to 30 if age not available
            
            bmr = cls.calculate_bmr(
                weight_kg=float(latest_measurement.weight),
                height_cm=float(latest_measurement.height),
                age=age,
                gender=profile.gender
            )
            
            # Calculate TDEE
            tdee = cls.calculate_tdee(bmr, profile.activity_level)
            
            # Calculate BMI
            height_m = float(latest_measurement.height) / 100
            bmi = float(latest_measurement.weight) / (height_m ** 2)
            
            # Determine BMI category
            if bmi < 18.5:
                bmi_category = 'underweight'
            elif 18.5 <= bmi < 25:
                bmi_category = 'normal'
            elif 25 <= bmi < 30:
                bmi_category = 'overweight'
            else:
                bmi_category = 'obese'
            
            return {
                'bmr': bmr,
                'tdee': tdee,
                'bmi': round(bmi, 2),
                'bmi_category': bmi_category,
                'weight': float(latest_measurement.weight),
                'height': float(latest_measurement.height),
                'age': age,
                'gender': profile.gender,
                'activity_level': profile.activity_level
            }
        
        except Exception as e:
            return None


class MacroCalculator:
    """Calculate macro distribution based on goals"""
    
    # Macro ratios for different goals (protein, carbs, fats)
    MACRO_RATIOS = {
        'weight_loss': (0.30, 0.40, 0.30),      # Higher protein, moderate carbs
        'muscle_gain': (0.30, 0.40, 0.30),      # High protein, high carbs
        'maintenance': (0.25, 0.45, 0.30),      # Balanced
        'endurance': (0.20, 0.55, 0.25),        # High carbs for energy
        'keto': (0.25, 0.05, 0.70),             # Very low carb, high fat
    }
    
    @classmethod
    def calculate_macros(cls, tdee, goal, calorie_adjustment=0):
        """
        Calculate macro distribution
        
        Args:
            tdee: Total Daily Energy Expenditure
            goal: Fitness goal
            calorie_adjustment: Calorie surplus/deficit
        
        Returns:
            dict with macro targets in grams
        """
        target_calories = tdee + calorie_adjustment
        
        # Get macro ratios
        ratios = cls.MACRO_RATIOS.get(goal, cls.MACRO_RATIOS['maintenance'])
        protein_ratio, carb_ratio, fat_ratio = ratios
        
        # Calculate grams (protein: 4 cal/g, carbs: 4 cal/g, fats: 9 cal/g)
        protein_grams = (target_calories * protein_ratio) / 4
        carb_grams = (target_calories * carb_ratio) / 4
        fat_grams = (target_calories * fat_ratio) / 9
        
        return {
            'target_calories': round(target_calories, 0),
            'protein_grams': round(protein_grams, 1),
            'carb_grams': round(carb_grams, 1),
            'fat_grams': round(fat_grams, 1),
            'protein_calories': round(protein_grams * 4, 0),
            'carb_calories': round(carb_grams * 4, 0),
            'fat_calories': round(fat_grams * 9, 0),
        }
    
    @classmethod
    def get_calorie_adjustment(cls, goal):
        """Get recommended calorie adjustment for goal"""
        adjustments = {
            'weight_loss': -500,      # 500 calorie deficit
            'muscle_gain': 300,       # 300 calorie surplus
            'maintenance': 0,
            'endurance': 200,
        }
        return adjustments.get(goal, 0)


class ProgressAnalyzer:
    """Analyze user progress over time"""
    
    @staticmethod
    def get_weight_progress(user, days=30):
        """Get weight progress over specified days"""
        start_date = timezone.now().date() - timedelta(days=days)
        
        measurements = BodyMeasurement.objects.filter(
            user=user,
            date__gte=start_date
        ).order_by('date').values('date', 'weight')
        
        if not measurements:
            return None
        
        data = list(measurements)
        first_weight = float(data[0]['weight'])
        last_weight = float(data[-1]['weight'])
        weight_change = last_weight - first_weight
        
        return {
            'data': data,
            'start_weight': first_weight,
            'current_weight': last_weight,
            'weight_change': round(weight_change, 2),
            'percentage_change': round((weight_change / first_weight) * 100, 2) if first_weight > 0 else 0,
            'days': days
        }
    
    @staticmethod
    def get_body_composition_progress(user, days=30):
        """Get body composition progress"""
        start_date = timezone.now().date() - timedelta(days=days)
        
        measurements = BodyMeasurement.objects.filter(
            user=user,
            date__gte=start_date
        ).order_by('date')
        
        if not measurements:
            return None
        
        first = measurements.first()
        last = measurements.last()
        
        result = {
            'body_fat_change': None,
            'muscle_mass_change': None,
            'measurements': []
        }
        
        if first.body_fat_percentage and last.body_fat_percentage:
            result['body_fat_change'] = round(
                float(last.body_fat_percentage) - float(first.body_fat_percentage), 2
            )
        
        # Calculate estimated muscle mass (weight * (1 - body_fat_percentage))
        if first.body_fat_percentage and last.body_fat_percentage:
            first_muscle = float(first.weight) * (1 - float(first.body_fat_percentage) / 100)
            last_muscle = float(last.weight) * (1 - float(last.body_fat_percentage) / 100)
            result['muscle_mass_change'] = round(last_muscle - first_muscle, 2)
        
        result['measurements'] = [
            {
                'date': m.date,
                'weight': float(m.weight),
                'body_fat_percentage': float(m.body_fat_percentage) if m.body_fat_percentage else None
            }
            for m in measurements
        ]
        
        return result
    
    @staticmethod
    def get_nutrition_trends(user, days=30):
        """Get nutrition trends"""
        start_date = timezone.now().date() - timedelta(days=days)
        
        # Get all meals in the date range
        meals = Meal.objects.filter(
            user=user,
            date__gte=start_date
        )
        
        total_meals = meals.count()
        
        # Calculate totals from meal properties
        if total_meals > 0:
            total_calories = sum(meal.total_calories for meal in meals)
            total_protein = sum(meal.total_protein for meal in meals)
            total_carbs = sum(meal.total_carbs for meal in meals)
            total_fats = sum(meal.total_fats for meal in meals)
            
            avg_calories = total_calories / total_meals
            avg_protein = total_protein / total_meals
            avg_carbs = total_carbs / total_meals
            avg_fats = total_fats / total_meals
        else:
            avg_calories = avg_protein = avg_carbs = avg_fats = 0
        
        return {
            'average_daily_calories': round(avg_calories, 0),
            'average_daily_protein': round(avg_protein, 1),
            'average_daily_carbs': round(avg_carbs, 1),
            'average_daily_fats': round(avg_fats, 1),
            'total_meals_logged': total_meals,
            'days': days
        }
    
    @staticmethod
    def get_workout_trends(user, days=30):
        """Get workout trends"""
        start_date = timezone.now().date() - timedelta(days=days)
        
        workouts = Workout.objects.filter(
            user=user,
            date__gte=start_date
        ).aggregate(
            total_workouts=Count('id'),
            completed_workouts=Count('id', filter=models.Q(completed=True)),
            total_duration=Sum('duration_minutes'),
            total_calories=Sum('total_calories_burned'),
            avg_duration=Avg('duration_minutes')
        )
        
        return {
            'total_workouts': workouts['total_workouts'],
            'completed_workouts': workouts['completed_workouts'],
            'completion_rate': round(
                (workouts['completed_workouts'] / workouts['total_workouts'] * 100)
                if workouts['total_workouts'] > 0 else 0, 1
            ),
            'total_duration_minutes': workouts['total_duration'] or 0,
            'total_calories_burned': round(workouts['total_calories'] or 0, 0),
            'average_duration_minutes': round(workouts['avg_duration'] or 0, 1),
            'days': days
        }
    
    @classmethod
    def get_comprehensive_report(cls, user, days=30):
        """Get comprehensive progress report"""
        # Get individual reports
        weight_progress = cls.get_weight_progress(user, days)
        body_composition = cls.get_body_composition_progress(user, days)
        nutrition_trends = cls.get_nutrition_trends(user, days)
        workout_trends = cls.get_workout_trends(user, days)
        
        # Format data for frontend compatibility
        result = {
            'period_days': days,
            'weight_history': [],
            'body_fat_history': [],
            'workout_frequency': [],
            'calorie_trends': [],
            'weight_change': 0,
            'body_fat_change': 0,
            'total_workouts': 0,
            'workout_consistency': 0,
            'avg_calories': 0,
            'target_calories': 2000,
            'current_weight': 0,
            'weight_goal': 0,
            'current_body_fat': 0,
            'body_fat_goal': 0,
            'workout_goal': 5,
            'workouts_this_week': 0,
            'achievements': []
        }
        
        # Process weight data
        if weight_progress and weight_progress.get('data'):
            result['weight_history'] = [
                {'date': item['date'], 'weight': item['weight']} 
                for item in weight_progress['data']
            ]
            result['weight_change'] = weight_progress.get('weight_change', 0)
            result['current_weight'] = weight_progress.get('current_weight', 0)
        
        # Process body composition data
        if body_composition:
            if body_composition.get('measurements'):
                result['body_fat_history'] = [
                    {'date': item['date'], 'body_fat_percentage': item['body_fat_percentage']}
                    for item in body_composition['measurements']
                    if item['body_fat_percentage'] is not None
                ]
            result['body_fat_change'] = body_composition.get('body_fat_change', 0)
            if result['body_fat_history']:
                result['current_body_fat'] = result['body_fat_history'][-1]['body_fat_percentage']
        
        # Process nutrition data
        if nutrition_trends:
            result['avg_calories'] = nutrition_trends.get('average_daily_calories', 0)
            # Create mock calorie trends data if we have nutrition data
            if nutrition_trends.get('total_meals_logged', 0) > 0:
                start_date = timezone.now().date() - timedelta(days=days)
                for i in range(min(days, 10)):  # Show last 10 days max
                    date = start_date + timedelta(days=i)
                    result['calorie_trends'].append({
                        'date': date,
                        'calories': nutrition_trends.get('average_daily_calories', 0)
                    })
        
        # Process workout data
        if workout_trends:
            result['total_workouts'] = workout_trends.get('total_workouts', 0)
            result['workout_consistency'] = workout_trends.get('completion_rate', 0)
            # Create mock workout frequency data (weekly)
            weeks = max(1, days // 7)
            workouts_per_week = result['total_workouts'] / weeks if weeks > 0 else 0
            for i in range(weeks):
                result['workout_frequency'].append({
                    'week': f'Week {i+1}',
                    'count': int(workouts_per_week)
                })
        
        # Get user goals from profile
        try:
            profile = user.profile
            if hasattr(profile, 'target_weight') and profile.target_weight:
                result['weight_goal'] = float(profile.target_weight)
        except:
            pass
        
        return result


class GoalTracker:
    """Track progress towards goals"""
    
    @staticmethod
    def calculate_goal_progress(user):
        """Calculate progress towards user's goal"""
        try:
            profile = user.profile
            
            if not profile.target_weight:
                return None
            
            # Get starting and current weight
            measurements = BodyMeasurement.objects.filter(user=user).order_by('date')
            
            if measurements.count() < 2:
                return None
            
            start_measurement = measurements.first()
            current_measurement = measurements.last()
            
            start_weight = float(start_measurement.weight)
            current_weight = float(current_measurement.weight)
            target_weight = float(profile.target_weight)
            
            # Calculate progress
            total_to_lose = start_weight - target_weight
            lost_so_far = start_weight - current_weight
            
            if total_to_lose != 0:
                progress_percentage = (lost_so_far / total_to_lose) * 100
            else:
                progress_percentage = 100
            
            remaining = target_weight - current_weight
            
            # Estimate time to goal (assuming 0.5kg per week is healthy)
            weeks_to_goal = abs(remaining / 0.5) if remaining != 0 else 0
            
            return {
                'start_weight': start_weight,
                'current_weight': current_weight,
                'target_weight': target_weight,
                'weight_lost': round(lost_so_far, 2),
                'weight_remaining': round(remaining, 2),
                'progress_percentage': round(progress_percentage, 1),
                'estimated_weeks_to_goal': round(weeks_to_goal, 1),
                'on_track': -0.5 <= (lost_so_far / ((current_measurement.date - start_measurement.date).days / 7)) <= -0.3
            }
        
        except Exception as e:
            return None
