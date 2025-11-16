"""
Script untuk membuat data demo 2 bulan untuk user demo@fitnutrition.com
"""
import os
import django
import random
from datetime import date, datetime, timedelta

# Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.users.models import UserProfile, FoodPreference
from apps.measurements.models import BodyMeasurement
from apps.nutrition.models import Food, NutritionEntry, MealPlan, Meal
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
    NutritionEntry.objects.filter(user=demo_user).delete()
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
        
        # Buat nutrition entries (3 kali sehari + snack kadang-kadang)
        create_daily_nutrition(demo_user, current_date)
        
        # Buat workout sessions (3-4x per minggu)
        if day % 2 == 0 or day % 3 == 0:  # Tidak setiap hari
            create_workout_session(demo_user, current_date, day)
    
    print(f"✅ Data 60 hari berhasil dibuat!")
    print_demo_summary(demo_user, profile)

def create_sample_food_items():
    """Buat sample food items untuk nutrition"""
    foods = [
        # Protein
        {'name': 'Dada Ayam (100g)', 'calories_per_100g': 165, 'protein_per_100g': 31, 'carbs_per_100g': 0, 'fat_per_100g': 3.6},
        {'name': 'Telur Ayam (1 butir)', 'calories_per_100g': 155, 'protein_per_100g': 13, 'carbs_per_100g': 1.1, 'fat_per_100g': 11},
        {'name': 'Ikan Salmon (100g)', 'calories_per_100g': 208, 'protein_per_100g': 25, 'carbs_per_100g': 0, 'fat_per_100g': 12},
        {'name': 'Tahu (100g)', 'calories_per_100g': 76, 'protein_per_100g': 8, 'carbs_per_100g': 1.9, 'fat_per_100g': 4.8},
        
        # Karbohidrat
        {'name': 'Nasi Putih (100g)', 'calories_per_100g': 130, 'protein_per_100g': 2.7, 'carbs_per_100g': 28, 'fat_per_100g': 0.3},
        {'name': 'Roti Gandum (1 slice)', 'calories_per_100g': 247, 'protein_per_100g': 13, 'carbs_per_100g': 41, 'fat_per_100g': 4.2},
        {'name': 'Oatmeal (100g)', 'calories_per_100g': 68, 'protein_per_100g': 2.4, 'carbs_per_100g': 12, 'fat_per_100g': 1.4},
        {'name': 'Ubi Jalar (100g)', 'calories_per_100g': 86, 'protein_per_100g': 1.6, 'carbs_per_100g': 20, 'fat_per_100g': 0.1},
        
        # Sayuran
        {'name': 'Brokoli (100g)', 'calories_per_100g': 34, 'protein_per_100g': 2.8, 'carbs_per_100g': 7, 'fat_per_100g': 0.4},
        {'name': 'Bayam (100g)', 'calories_per_100g': 23, 'protein_per_100g': 2.9, 'carbs_per_100g': 3.6, 'fat_per_100g': 0.4},
        {'name': 'Wortel (100g)', 'calories_per_100g': 41, 'protein_per_100g': 0.9, 'carbs_per_100g': 10, 'fat_per_100g': 0.2},
        
        # Buah
        {'name': 'Pisang (1 buah)', 'calories_per_100g': 89, 'protein_per_100g': 1.1, 'carbs_per_100g': 23, 'fat_per_100g': 0.3},
        {'name': 'Apel (1 buah)', 'calories_per_100g': 52, 'protein_per_100g': 0.3, 'carbs_per_100g': 14, 'fat_per_100g': 0.2},
        {'name': 'Jeruk (1 buah)', 'calories_per_100g': 47, 'protein_per_100g': 0.9, 'carbs_per_100g': 12, 'fat_per_100g': 0.1},
        
        # Lemak sehat
        {'name': 'Alpukat (100g)', 'calories_per_100g': 160, 'protein_per_100g': 2, 'carbs_per_100g': 9, 'fat_per_100g': 15},
        {'name': 'Kacang Almond (30g)', 'calories_per_100g': 579, 'protein_per_100g': 21, 'carbs_per_100g': 22, 'fat_per_100g': 50},
    ]
    
    for food_data in foods:
        Food.objects.get_or_create(
            name=food_data['name'],
            defaults={
                'calories': food_data['calories_per_100g'],
                'protein': food_data['protein_per_100g'],
                'carbohydrates': food_data['carbs_per_100g'],
                'fats': food_data['fat_per_100g'],
                'category': 'other'
            }
        )

def create_daily_nutrition(user, date):
    """Buat nutrition entries untuk satu hari"""
    food_items = list(Food.objects.all())
    
    if not food_items:
        return
    
    # Sarapan
    breakfast_foods = random.sample([f for f in food_items if 'Telur' in f.name or 'Oatmeal' in f.name or 'Roti' in f.name], k=min(2, len(food_items)))
    for food in breakfast_foods:
        quantity = random.uniform(80, 150)
        NutritionEntry.objects.create(
            user=user,
            date=date,
            meal_type='breakfast',
            food_item=food,
            quantity=quantity,
            calories=int((quantity/100) * food.calories_per_100g),
            protein=(quantity/100) * food.protein_per_100g,
            carbs=(quantity/100) * food.carbs_per_100g,
            fat=(quantity/100) * food.fat_per_100g
        )
    
    # Makan siang
    lunch_foods = random.sample([f for f in food_items if 'Nasi' in f.name or 'Ayam' in f.name or 'Ikan' in f.name or 'sayur' in f.name.lower()], k=min(3, len(food_items)))
    for food in lunch_foods:
        quantity = random.uniform(100, 200)
        NutritionEntry.objects.create(
            user=user,
            date=date,
            meal_type='lunch',
            food_item=food,
            quantity=quantity,
            calories=int((quantity/100) * food.calories_per_100g),
            protein=(quantity/100) * food.protein_per_100g,
            carbs=(quantity/100) * food.carbs_per_100g,
            fat=(quantity/100) * food.fat_per_100g
        )
    
    # Makan malam
    dinner_foods = random.sample([f for f in food_items if 'Ikan' in f.name or 'Tahu' in f.name or 'Brokoli' in f.name or 'Ubi' in f.name], k=min(2, len(food_items)))
    for food in dinner_foods:
        quantity = random.uniform(80, 150)
        NutritionEntry.objects.create(
            user=user,
            date=date,
            meal_type='dinner',
            food_item=food,
            quantity=quantity,
            calories=int((quantity/100) * food.calories_per_100g),
            protein=(quantity/100) * food.protein_per_100g,
            carbs=(quantity/100) * food.carbs_per_100g,
            fat=(quantity/100) * food.fat_per_100g
        )
    
    # Snack (kadang-kadang)
    if random.random() > 0.3:  # 70% kemungkinan ada snack
        snack_foods = random.sample([f for f in food_items if any(fruit in f.name for fruit in ['Pisang', 'Apel', 'Jeruk', 'Alpukat', 'Almond'])], k=min(1, len(food_items)))
        for food in snack_foods:
            quantity = random.uniform(50, 100)
            NutritionEntry.objects.create(
                user=user,
                date=date,
                meal_type='snack',
                food_item=food,
                quantity=quantity,
                calories=int((quantity/100) * food.calories_per_100g),
                protein=(quantity/100) * food.protein_per_100g,
                carbs=(quantity/100) * food.carbs_per_100g,
                fat=(quantity/100) * food.fat_per_100g
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
                weight=0,  # Tidak ada weight untuk cardio  
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
                    weight=max(weight, 0),
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
    nutrition_count = NutritionEntry.objects.filter(user=user).count()
    workout_count = WorkoutSession.objects.filter(user=user).count()
    
    print(f"\n📊 Data Statistik (60 hari):")
    print(f"   Body Measurements: {measurements_count} entries")
    print(f"   Nutrition Entries: {nutrition_count} entries")
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