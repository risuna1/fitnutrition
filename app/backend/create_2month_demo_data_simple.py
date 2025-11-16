"""
Script sederhana untuk membuat data demo 2 bulan untuk user demo@fitnutrition.com
"""
import os
import django
import random
from datetime import date, datetime, timedelta
from decimal import Decimal

# Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.users.models import UserProfile, FoodPreference
from apps.measurements.models import BodyMeasurement
from apps.nutrition.models import Food, Meal, MealItem
from apps.workouts.models import WorkoutPlan, WorkoutSession, Exercise, ExerciseSet

User = get_user_model()

def create_2month_demo_data():
    """Membuat data demo untuk 2 bulan"""
    
    # Cari atau buat user demo
    try:
        demo_user = User.objects.get(email='demo@fitnutrition.com')
        print(f"✅ User demo ditemukan: {demo_user.email}")
    except User.DoesNotExist:
        print("❌ User demo tidak ditemukan. Membuat user baru...")
        demo_user = User.objects.create_user(
            username='demo_user',
            email='demo@fitnutrition.com',
            password='demo123456',
            first_name='Demo',
            last_name='User',
            date_of_birth=date(1990, 1, 1)
        )
        print(f"✅ User demo dibuat: {demo_user.email}")
    
    # Pastikan user profile ada
    profile, created = UserProfile.objects.get_or_create(
        user=demo_user,
        defaults={
            'gender': 'male',
            'height': 175.0,
            'current_weight': 80.0,
            'target_weight': 70.0,
            'activity_level': 'moderate',
            'fitness_goal': 'weight_loss',
            'body_fat_percentage': 22.0,
            'chest': 95.0,
            'waist': 90.0,
            'hips': 95.0,
            'arms': 32.0,
            'thighs': 55.0,
            'calves': 38.0
        }
    )
    
    if created:
        print(f"✅ Profile baru dibuat untuk user demo")
    else:
        print(f"✅ Profile user demo sudah ada")
    
    # Buat food preferences jika belum ada
    food_pref, created = FoodPreference.objects.get_or_create(
        user=demo_user,
        defaults={
            'diet_type': 'omnivore',
            'allergies': 'Tidak ada',
            'dislikes': 'Makanan pedas berlebihan',
            'preferred_foods': 'Ayam, ikan, sayuran hijau, buah-buahan',
            'avoid_ingredients': 'MSG berlebihan'
        }
    )
    
    if created:
        print(f"✅ Food preferences dibuat")
    else:
        print(f"✅ Food preferences sudah ada")
    
    # Hapus data lama untuk regenerasi
    print("Menghapus data lama...")
    BodyMeasurement.objects.filter(user=demo_user).delete()
    Meal.objects.filter(user=demo_user).delete()
    WorkoutSession.objects.filter(user=demo_user).delete()
    
    print("Membuat data 2 bulan (60 hari)...")
    
    today = date.today()
    start_date = today - timedelta(days=59)  # 60 hari ke belakang
    
    # Data untuk progress yang realistis
    initial_weight = 80.0
    target_weight = 70.0
    weight_loss_per_week = 0.5  # kg per minggu (realistis)
    
    # Buat sample food items jika belum ada
    create_sample_food_items()
    
    # Buat sample exercises jika belum ada  
    create_sample_exercises()
    
    for day in range(60):
        current_date = start_date + timedelta(days=day)
        
        # Progress weight loss yang realistis dengan fluktuasi
        weeks_passed = day / 7.0
        base_weight = initial_weight - (weeks_passed * weight_loss_per_week)
        # Tambahkan fluktuasi harian yang realistis
        daily_fluctuation = random.uniform(-0.5, 0.3)  # Berat bisa naik sedikit kadang
        current_weight = max(base_weight + daily_fluctuation, target_weight)
        
        # Body measurements dengan progress
        body_fat_start = 22.0
        body_fat_current = max(body_fat_start - (weeks_passed * 0.3), 15.0)
        
        muscle_mass_start = 55.0
        muscle_mass_current = min(muscle_mass_start + (weeks_passed * 0.1), 60.0)  # Sedikit naik
        
        waist_start = 90.0
        waist_current = max(waist_start - (weeks_passed * 0.4), 80.0)
        
        # Buat body measurement
        BodyMeasurement.objects.create(
            user=demo_user,
            date=current_date,
            weight=round(current_weight, 1),
            height=175.0,
            body_fat_percentage=round(body_fat_current, 1),
            muscle_mass=round(muscle_mass_current, 1),
            chest=95.0,
            waist=round(waist_current, 1),
            hips=95.0,
            arms_left=32.0,
            arms_right=32.0,
            thighs_left=55.0,
            thighs_right=55.0,
            calves_left=38.0,
            calves_right=38.0,
            notes=f'Pengukuran hari ke-{day + 1}'
        )
        
        # Buat meals (sarapan, makan siang, makan malam)
        create_daily_meals(demo_user, current_date)
        
        # Buat workout sessions (3-4x per minggu)
        if day % 2 == 0 or day % 3 == 0:  # Tidak setiap hari
            create_workout_session(demo_user, current_date, day)
    
    print(f"✅ Data 60 hari berhasil dibuat!")
    print_demo_summary(demo_user, profile)

def create_sample_food_items():
    """Buat sample food items untuk nutrition"""
    foods = [
        # Protein
        {'name': 'Dada Ayam (100g)', 'calories': 165, 'protein': 31, 'carbs': 0, 'fats': 3.6, 'category': 'protein'},
        {'name': 'Telur Ayam (1 butir)', 'calories': 155, 'protein': 13, 'carbs': 1.1, 'fats': 11, 'category': 'protein'},
        {'name': 'Ikan Salmon (100g)', 'calories': 208, 'protein': 25, 'carbs': 0, 'fats': 12, 'category': 'protein'},
        {'name': 'Tahu (100g)', 'calories': 76, 'protein': 8, 'carbs': 1.9, 'fats': 4.8, 'category': 'protein'},
        
        # Karbohidrat
        {'name': 'Nasi Putih (100g)', 'calories': 130, 'protein': 2.7, 'carbs': 28, 'fats': 0.3, 'category': 'carbs'},
        {'name': 'Roti Gandum (1 slice)', 'calories': 247, 'protein': 13, 'carbs': 41, 'fats': 4.2, 'category': 'grains'},
        {'name': 'Oatmeal (100g)', 'calories': 68, 'protein': 2.4, 'carbs': 12, 'fats': 1.4, 'category': 'grains'},
        {'name': 'Ubi Jalar (100g)', 'calories': 86, 'protein': 1.6, 'carbs': 20, 'fats': 0.1, 'category': 'carbs'},
        
        # Sayuran
        {'name': 'Brokoli (100g)', 'calories': 34, 'protein': 2.8, 'carbs': 7, 'fats': 0.4, 'category': 'vegetables'},
        {'name': 'Bayam (100g)', 'calories': 23, 'protein': 2.9, 'carbs': 3.6, 'fats': 0.4, 'category': 'vegetables'},
        {'name': 'Wortel (100g)', 'calories': 41, 'protein': 0.9, 'carbs': 10, 'fats': 0.2, 'category': 'vegetables'},
        
        # Buah
        {'name': 'Pisang (1 buah)', 'calories': 89, 'protein': 1.1, 'carbs': 23, 'fats': 0.3, 'category': 'fruits'},
        {'name': 'Apel (1 buah)', 'calories': 52, 'protein': 0.3, 'carbs': 14, 'fats': 0.2, 'category': 'fruits'},
        {'name': 'Jeruk (1 buah)', 'calories': 47, 'protein': 0.9, 'carbs': 12, 'fats': 0.1, 'category': 'fruits'},
        
        # Lemak sehat
        {'name': 'Alpukat (100g)', 'calories': 160, 'protein': 2, 'carbs': 9, 'fats': 15, 'category': 'fats'},
        {'name': 'Kacang Almond (30g)', 'calories': 579, 'protein': 21, 'carbs': 22, 'fats': 50, 'category': 'fats'},
    ]
    
    for food_data in foods:
        Food.objects.get_or_create(
            name=food_data['name'],
            defaults={
                'calories': Decimal(str(food_data['calories'])),
                'protein': Decimal(str(food_data['protein'])),
                'carbohydrates': Decimal(str(food_data['carbs'])),
                'fats': Decimal(str(food_data['fats'])),
                'category': food_data['category']
            }
        )

def create_daily_meals(user, date):
    """Buat meals untuk satu hari"""
    food_items = list(Food.objects.all())
    
    if not food_items:
        return
    
    meal_types = ['breakfast', 'lunch', 'dinner']
    
    for meal_type in meal_types:
        # Buat meal
        meal = Meal.objects.create(
            user=user,
            name=f'{meal_type.title()} - {date}',
            meal_type=meal_type,
            date=date,
            notes=f'Meal otomatis untuk hari {date}'
        )
        
        # Tambahkan food items ke meal
        if meal_type == 'breakfast':
            selected_foods = [f for f in food_items if any(keyword in f.name for keyword in ['Telur', 'Oatmeal', 'Roti'])]
            num_items = random.randint(1, 2)
        elif meal_type == 'lunch':
            selected_foods = [f for f in food_items if any(keyword in f.name for keyword in ['Nasi', 'Ayam', 'Ikan', 'Sayur'])]
            num_items = random.randint(2, 3)
        else:  # dinner
            selected_foods = [f for f in food_items if any(keyword in f.name for keyword in ['Ikan', 'Tahu', 'Brokoli', 'Ubi'])]
            num_items = random.randint(2, 3)
        
        # Fallback jika tidak ada makanan yang cocok
        if not selected_foods:
            selected_foods = food_items
        
        # Pilih makanan secara random
        chosen_foods = random.sample(selected_foods, min(num_items, len(selected_foods)))
        
        for food in chosen_foods:
            serving_size = random.uniform(80, 200)  # gram
            
            # Buat MealItem (nutritional values akan dihitung otomatis oleh model)
            MealItem.objects.create(
                meal=meal,
                food=food,
                serving_size=Decimal(str(round(serving_size, 1)))
            )

def create_sample_exercises():
    """Buat sample exercises"""
    exercises_data = [
        # Strength Training
        {'name': 'Push Up', 'category': 'strength', 'muscle_groups': 'chest,shoulders,triceps'},
        {'name': 'Pull Up', 'category': 'strength', 'muscle_groups': 'back,biceps'},
        {'name': 'Squat', 'category': 'strength', 'muscle_groups': 'legs,glutes'},
        {'name': 'Deadlift', 'category': 'strength', 'muscle_groups': 'back,legs,glutes'},
        {'name': 'Bench Press', 'category': 'strength', 'muscle_groups': 'chest,shoulders,triceps'},
        {'name': 'Shoulder Press', 'category': 'strength', 'muscle_groups': 'shoulders,triceps'},
        {'name': 'Plank', 'category': 'strength', 'muscle_groups': 'core'},
        
        # Cardio
        {'name': 'Running', 'category': 'cardio', 'muscle_groups': 'legs,cardiovascular'},
        {'name': 'Cycling', 'category': 'cardio', 'muscle_groups': 'legs,cardiovascular'},
        {'name': 'Jumping Jacks', 'category': 'cardio', 'muscle_groups': 'full_body,cardiovascular'},
        {'name': 'Burpees', 'category': 'cardio', 'muscle_groups': 'full_body,cardiovascular'},
        {'name': 'Mountain Climbers', 'category': 'cardio', 'muscle_groups': 'core,cardiovascular'},
    ]
    
    for exercise_data in exercises_data:
        Exercise.objects.get_or_create(
            name=exercise_data['name'],
            defaults={
                'category': exercise_data['category'],
                'muscle_groups': exercise_data['muscle_groups'],
                'instructions': f'Lakukan {exercise_data["name"]} dengan teknik yang benar',
                'difficulty_level': 'beginner'
            }
        )

def create_workout_session(user, date, day_number):
    """Buat workout session"""
    exercises = list(Exercise.objects.all())
    
    if not exercises:
        return
    
    # Tentukan tipe workout berdasarkan hari
    workout_types = ['Upper Body', 'Lower Body', 'Full Body', 'Cardio']
    workout_type = workout_types[day_number % len(workout_types)]
    
    # Filter exercises berdasarkan tipe workout
    if workout_type == 'Upper Body':
        filtered_exercises = [e for e in exercises if any(muscle in e.muscle_groups for muscle in ['chest', 'back', 'shoulders', 'biceps', 'triceps'])]
    elif workout_type == 'Lower Body':
        filtered_exercises = [e for e in exercises if 'legs' in e.muscle_groups or 'glutes' in e.muscle_groups]
    elif workout_type == 'Cardio':
        filtered_exercises = [e for e in exercises if e.category == 'cardio']
    else:  # Full Body
        filtered_exercises = exercises
    
    if not filtered_exercises:
        filtered_exercises = exercises
    
    # Buat workout session
    duration = random.randint(30, 90)  # 30-90 menit
    calories_burned = duration * random.uniform(5, 12)  # 5-12 kalori per menit
    
    workout_session = WorkoutSession.objects.create(
        user=user,
        date=date,
        workout_type=workout_type.lower().replace(' ', '_'),
        duration_minutes=duration,
        calories_burned=int(calories_burned),
        notes=f'Workout {workout_type} - hari ke-{day_number + 1}'
    )
    
    # Tambahkan exercises ke session
    selected_exercises = random.sample(filtered_exercises, k=min(random.randint(3, 6), len(filtered_exercises)))
    
    for exercise in selected_exercises:
        if exercise.category == 'cardio':
            # Untuk cardio, buat 1 set dengan durasi
            ExerciseSet.objects.create(
                workout_session=workout_session,
                exercise=exercise,
                set_number=1,
                reps=0,  # Tidak ada reps untuk cardio
                weight=Decimal('0'),  # Tidak ada weight untuk cardio  
                duration_seconds=random.randint(300, 1800),  # 5-30 menit
                notes=f'Cardio session'
            )
        else:
            # Untuk strength training, buat 3-4 sets
            sets_count = random.randint(3, 4)
            base_reps = random.randint(8, 15)
            base_weight = random.uniform(10, 50)  # kg
            
            for set_num in range(1, sets_count + 1):
                # Variasi reps dan weight per set
                reps = max(base_reps - random.randint(0, 3), 5)
                weight = base_weight + random.uniform(-5, 5)
                
                ExerciseSet.objects.create(
                    workout_session=workout_session,
                    exercise=exercise,
                    set_number=set_num,
                    reps=reps,
                    weight=Decimal(str(max(weight, 0))),
                    duration_seconds=0,
                    notes=f'Set {set_num}'
                )

def print_demo_summary(user, profile):
    """Print ringkasan data demo"""
    print("\n" + "="*80)
    print("🎉 DATA DEMO 2 BULAN BERHASIL DIBUAT!")
    print("="*80)
    
    print(f"\n📧 Login Info:")
    print(f"   Email: {user.email}")
    print(f"   Password: demo123456")
    
    print(f"\n👤 User Info:")
    print(f"   Nama: {user.first_name} {user.last_name}")
    print(f"   Tinggi: {profile.height} cm")
    print(f"   Berat awal: 80.0 kg")
    print(f"   Target berat: {profile.target_weight} kg")
    
    # Statistik data
    measurements_count = BodyMeasurement.objects.filter(user=user).count()
    meals_count = Meal.objects.filter(user=user).count()
    workout_count = WorkoutSession.objects.filter(user=user).count()
    
    print(f"\n📊 Data Statistik (60 hari):")
    print(f"   Body Measurements: {measurements_count} entries")
    print(f"   Meals: {meals_count} meals")
    print(f"   Workout Sessions: {workout_count} sessions")
    
    # Progress summary
    latest_measurement = BodyMeasurement.objects.filter(user=user).order_by('-date').first()
    if latest_measurement:
        weight_loss = 80.0 - latest_measurement.weight
        print(f"\n📈 Progress Summary:")
        print(f"   Berat terbaru: {latest_measurement.weight} kg")
        print(f"   Total penurunan berat: {weight_loss:.1f} kg")
        print(f"   Body fat: {latest_measurement.body_fat_percentage}%")
        print(f"   Lingkar pinggang: {latest_measurement.waist} cm")
    
    print("\n" + "="*80)
    print("✅ Silakan login ke aplikasi untuk melihat semua data!")
    print("="*80)

if __name__ == '__main__':
    create_2month_demo_data()