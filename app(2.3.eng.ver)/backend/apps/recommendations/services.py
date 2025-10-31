"""
Recommendation service for generating personalized workout and meal suggestions
"""
import os
from datetime import datetime, timedelta
from django.db.models import Avg, Count, Q
from apps.measurements.models import BodyMeasurement
from apps.nutrition.models import Meal, Food
from apps.users.models import FoodPreference
from apps.workouts.models import Workout, Exercise, WorkoutPlan
from apps.analytics.services import MetabolismCalculator, ProgressAnalyzer


class WorkoutRecommendationEngine:
    """Generate workout recommendations based on user data"""
    
    @staticmethod
    def get_workout_plan_recommendations(user):
        """Recommend workout plans based on user's goal and level"""
        try:
            profile = user.profile
            goal = profile.fitness_goal
            
            # Get suitable workout plans
            plans = WorkoutPlan.objects.filter(
                Q(goal=goal) | Q(is_custom=False)
            ).order_by('-created_at')[:5]
            
            recommendations = []
            for plan in plans:
                score = 0
                reasons = []
                
                # Match goal
                if plan.goal == goal:
                    score += 40
                    reasons.append(f"Matches your {goal} goal")
                
                # Match difficulty (prefer plans at or slightly above current level)
                if plan.difficulty == profile.activity_level:
                    score += 30
                    reasons.append("Matches your fitness level")
                elif plan.difficulty == 'beginner' and profile.activity_level == 'sedentary':
                    score += 25
                    reasons.append("Good starting point")
                
                # Consider duration
                if 4 <= plan.duration_weeks <= 12:
                    score += 15
                    reasons.append("Optimal duration")
                
                # Consider frequency
                if 3 <= plan.days_per_week <= 5:
                    score += 15
                    reasons.append("Balanced frequency")
                
                recommendations.append({
                    'plan': plan,
                    'score': score,
                    'reasons': reasons,
                    'match_percentage': min(score, 100)
                })
            
            # Sort by score
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            
            return recommendations[:3]
        
        except Exception as e:
            return []
    
    @staticmethod
    def get_exercise_recommendations(user):
        """Recommend exercises based on user's history and goals"""
        try:
            profile = user.profile
            
            # Get user's workout history
            recent_workouts = Workout.objects.filter(
                user=user,
                date__gte=datetime.now().date() - timedelta(days=30)
            ).prefetch_related('exercises__exercise')
            
            # Get exercises user has done
            done_exercise_ids = set()
            exercise_counts = {}
            
            for workout in recent_workouts:
                for workout_exercise in workout.exercises.all():
                    exercise = workout_exercise.exercise
                    done_exercise_ids.add(exercise.id)
                    exercise_counts[exercise.id] = exercise_counts.get(exercise.id, 0) + 1
            
            # Get exercises user hasn't tried or rarely does
            all_exercises = Exercise.objects.filter(
                Q(is_custom=False) | Q(created_by=user)
            )
            
            recommendations = []
            
            for exercise in all_exercises:
                score = 0
                reasons = []
                
                # Prefer exercises not done recently
                if exercise.id not in done_exercise_ids:
                    score += 30
                    reasons.append("New exercise to try")
                elif exercise_counts.get(exercise.id, 0) < 3:
                    score += 15
                    reasons.append("Haven't done this much")
                
                # Match with goal
                if profile.fitness_goal == 'weight_loss' and exercise.exercise_type == 'cardio':
                    score += 25
                    reasons.append("Great for weight loss")
                elif profile.fitness_goal == 'muscle_gain' and exercise.exercise_type == 'strength':
                    score += 25
                    reasons.append("Builds muscle")
                
                # Consider difficulty
                if exercise.difficulty == 'beginner':
                    score += 10
                    reasons.append("Easy to learn")
                
                # High calorie burn
                if exercise.calories_per_minute and float(exercise.calories_per_minute) > 8:
                    score += 20
                    reasons.append("High calorie burn")
                
                if score > 0:
                    recommendations.append({
                        'exercise': exercise,
                        'score': score,
                        'reasons': reasons
                    })
            
            # Sort by score
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            
            return recommendations[:10]
        
        except Exception as e:
            return []
    
    @staticmethod
    def get_daily_workout_tip(user):
        """Get a daily workout tip based on user's progress"""
        try:
            # Get recent workout stats
            recent_workouts = Workout.objects.filter(
                user=user,
                date__gte=datetime.now().date() - timedelta(days=7)
            )
            
            workout_count = recent_workouts.count()
            completed_count = recent_workouts.filter(completed=True).count()
            
            tips = []
            
            if workout_count == 0:
                tips.append({
                    'type': 'motivation',
                    'title': 'Time to Get Moving!',
                    'message': "You haven't worked out this week. Start with a light 20-minute session today!",
                    'icon': '💪'
                })
            elif workout_count < 3:
                tips.append({
                    'type': 'encouragement',
                    'title': 'Keep Going!',
                    'message': f"You've completed {completed_count} workouts this week. Try to hit 3-4 for optimal results!",
                    'icon': '🎯'
                })
            else:
                tips.append({
                    'type': 'praise',
                    'title': 'Great Work!',
                    'message': f"You've completed {completed_count} workouts this week. You're crushing it!",
                    'icon': '🔥'
                })
            
            # Add recovery tip if working out too much
            if workout_count > 6:
                tips.append({
                    'type': 'recovery',
                    'title': 'Rest Day Reminder',
                    'message': "You've been working hard! Consider taking a rest day to let your muscles recover.",
                    'icon': '😴'
                })
            
            return tips
        
        except Exception as e:
            return []


class NutritionRecommendationEngine:
    """Generate nutrition recommendations"""
    
    @staticmethod
    def get_meal_recommendations(user):
        """Recommend meals based on user's preferences and goals"""
        try:
            profile = user.profile
            
            # Get user's food preferences
            try:
                preferences = FoodPreference.objects.get(user=user)
                diet_type = preferences.diet_type
                # Parse allergies from TextField (comma-separated)
                allergies = [a.strip() for a in preferences.allergies.split(',')] if preferences.allergies else []
            except FoodPreference.DoesNotExist:
                diet_type = 'omnivore'
                allergies = []
            
            # Get metabolism data
            metabolism = MetabolismCalculator.calculate_for_user(user)
            if not metabolism:
                return []
            
            target_calories = metabolism['tdee']
            
            # Adjust for goal
            if profile.fitness_goal == 'weight_loss':
                target_calories -= 500
            elif profile.fitness_goal == 'muscle_gain':
                target_calories += 300
            
            # Calculate meal distribution (breakfast: 25%, lunch: 35%, dinner: 30%, snacks: 10%)
            meal_targets = {
                'breakfast': target_calories * 0.25,
                'lunch': target_calories * 0.35,
                'dinner': target_calories * 0.30,
                'snack': target_calories * 0.10
            }
            
            recommendations = []
            
            for meal_type, target_cal in meal_targets.items():
                recommendations.append({
                    'meal_type': meal_type,
                    'target_calories': round(target_cal, 0),
                    'suggestions': [
                        f"Aim for {round(target_cal, 0)} calories",
                        f"Include protein, complex carbs, and healthy fats",
                        f"Stay hydrated with water"
                    ]
                })
            
            return recommendations
        
        except Exception as e:
            return []
    
    @staticmethod
    def get_nutrition_tips(user):
        """Get personalized nutrition tips"""
        try:
            # Get recent nutrition data
            recent_meals = Meal.objects.filter(
                user=user,
                date__gte=datetime.now().date() - timedelta(days=7)
            ).aggregate(
                avg_calories=Avg('total_calories'),
                avg_protein=Avg('total_protein'),
                avg_carbs=Avg('total_carbs'),
                avg_fats=Avg('total_fats')
            )
            
            tips = []
            
            # Get metabolism data
            metabolism = MetabolismCalculator.calculate_for_user(user)
            if metabolism:
                tdee = metabolism['tdee']
                avg_calories = recent_meals['avg_calories'] or 0
                
                if avg_calories < tdee - 500:
                    tips.append({
                        'type': 'warning',
                        'title': 'Eating Too Little',
                        'message': f"Your average intake ({round(avg_calories, 0)} cal) is too low. Aim for {round(tdee - 300, 0)} cal for healthy weight loss.",
                        'icon': '⚠️'
                    })
                elif avg_calories > tdee + 500:
                    tips.append({
                        'type': 'info',
                        'title': 'Calorie Surplus',
                        'message': f"You're eating {round(avg_calories - tdee, 0)} cal above your TDEE. Adjust if weight loss is your goal.",
                        'icon': 'ℹ️'
                    })
                else:
                    tips.append({
                        'type': 'success',
                        'title': 'Great Balance!',
                        'message': "Your calorie intake is well-balanced with your energy needs.",
                        'icon': '✅'
                    })
            
            # Protein tip
            avg_protein = recent_meals['avg_protein'] or 0
            if avg_protein < 80:
                tips.append({
                    'type': 'suggestion',
                    'title': 'Increase Protein',
                    'message': f"Your average protein ({round(avg_protein, 0)}g) is low. Aim for 1.6-2.2g per kg of body weight.",
                    'icon': '🥩'
                })
            
            # Hydration tip
            tips.append({
                'type': 'reminder',
                'title': 'Stay Hydrated',
                'message': "Drink at least 8 glasses of water daily. More if you're exercising!",
                'icon': '💧'
            })
            
            return tips
        
        except Exception as e:
            return []
    
    @staticmethod
    def get_food_suggestions(user, meal_type='lunch'):
        """Suggest foods for a specific meal"""
        try:
            profile = user.profile
            
            # Get metabolism data
            metabolism = MetabolismCalculator.calculate_for_user(user)
            if not metabolism:
                return []
            
            # Basic food suggestions by meal type
            suggestions = {
                'breakfast': [
                    {'name': 'Oatmeal with berries', 'calories': 300, 'protein': 10, 'carbs': 50, 'fats': 6},
                    {'name': 'Greek yogurt with granola', 'calories': 250, 'protein': 20, 'carbs': 30, 'fats': 5},
                    {'name': 'Scrambled eggs with toast', 'calories': 350, 'protein': 20, 'carbs': 30, 'fats': 15},
                ],
                'lunch': [
                    {'name': 'Grilled chicken salad', 'calories': 400, 'protein': 35, 'carbs': 25, 'fats': 15},
                    {'name': 'Quinoa bowl with vegetables', 'calories': 450, 'protein': 15, 'carbs': 60, 'fats': 12},
                    {'name': 'Turkey sandwich with avocado', 'calories': 420, 'protein': 25, 'carbs': 45, 'fats': 14},
                ],
                'dinner': [
                    {'name': 'Salmon with sweet potato', 'calories': 500, 'protein': 35, 'carbs': 45, 'fats': 18},
                    {'name': 'Lean beef with rice and broccoli', 'calories': 550, 'protein': 40, 'carbs': 50, 'fats': 16},
                    {'name': 'Chicken stir-fry with vegetables', 'calories': 480, 'protein': 38, 'carbs': 42, 'fats': 14},
                ],
                'snack': [
                    {'name': 'Protein shake', 'calories': 200, 'protein': 25, 'carbs': 15, 'fats': 5},
                    {'name': 'Apple with almond butter', 'calories': 180, 'protein': 4, 'carbs': 20, 'fats': 10},
                    {'name': 'Mixed nuts', 'calories': 170, 'protein': 6, 'carbs': 8, 'fats': 14},
                ]
            }
            
            return suggestions.get(meal_type, [])
        
        except Exception as e:
            return []


class AIRecommendationEngine:
    """AI-powered recommendations (placeholder for OpenAI integration)"""
    
    @staticmethod
    def generate_personalized_plan(user):
        """Generate AI-powered personalized plan"""
        # This is a placeholder for OpenAI API integration
        # To implement: Add openai package and use GPT-4 to generate plans
        
        try:
            profile = user.profile
            metabolism = MetabolismCalculator.calculate_for_user(user)
            progress = ProgressAnalyzer.get_comprehensive_report(user, 30)
            
            # Rule-based recommendation (can be replaced with AI)
            plan = {
                'workout_recommendation': WorkoutRecommendationEngine.get_workout_plan_recommendations(user),
                'exercise_suggestions': WorkoutRecommendationEngine.get_exercise_recommendations(user),
                'meal_recommendations': NutritionRecommendationEngine.get_meal_recommendations(user),
                'nutrition_tips': NutritionRecommendationEngine.get_nutrition_tips(user),
                'workout_tips': WorkoutRecommendationEngine.get_daily_workout_tip(user),
                'summary': f"Based on your {profile.fitness_goal} goal and current progress, here's your personalized plan."
            }
            
            return plan
        
        except Exception as e:
            return None
    
    @staticmethod
    def get_ai_insights(user):
        """Get AI-generated insights (placeholder)"""
        # Placeholder for AI insights
        insights = [
            {
                'type': 'progress',
                'title': 'You\'re Making Progress!',
                'message': 'Your consistency is paying off. Keep up the great work!',
                'confidence': 0.85
            },
            {
                'type': 'suggestion',
                'title': 'Try Increasing Intensity',
                'message': 'Based on your progress, you might benefit from slightly more challenging workouts.',
                'confidence': 0.75
            }
        ]
        
        return insights
