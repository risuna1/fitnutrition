from rest_framework import serializers
from .models import (
    Exercise, WorkoutPlan, WorkoutPlanDay, WorkoutPlanExercise,
    Workout, WorkoutExercise, WorkoutSchedule, FavoriteExercise
)


class ExerciseSerializer(serializers.ModelSerializer):
    """Serializer for Exercise model"""
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Exercise
        fields = [
            'id', 'name', 'description', 'exercise_type', 'difficulty',
            'equipment', 'primary_muscles', 'secondary_muscles',
            'instructions', 'tips', 'calories_per_minute',
            'video_url', 'image_url', 'is_custom', 'created_by',
            'is_favorited', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return FavoriteExercise.objects.filter(
                user=request.user,
                exercise=obj
            ).exists()
        return False

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['is_custom'] = True
        validated_data['created_by'] = request.user
        return super().create(validated_data)


class WorkoutPlanExerciseSerializer(serializers.ModelSerializer):
    """Serializer for exercises in a workout plan"""
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.PrimaryKeyRelatedField(
        queryset=Exercise.objects.all(),
        source='exercise',
        write_only=True
    )

    class Meta:
        model = WorkoutPlanExercise
        fields = [
            'id', 'exercise', 'exercise_id', 'order', 'sets', 'reps',
            'duration_seconds', 'rest_seconds', 'weight_kg', 'notes'
        ]


class WorkoutPlanDaySerializer(serializers.ModelSerializer):
    """Serializer for workout plan days"""
    exercises = WorkoutPlanExerciseSerializer(many=True, read_only=True)
    exercise_count = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutPlanDay
        fields = [
            'id', 'day_number', 'name', 'description', 'rest_day',
            'exercises', 'exercise_count'
        ]

    def get_exercise_count(self, obj):
        return obj.exercises.count()


class WorkoutPlanSerializer(serializers.ModelSerializer):
    """Serializer for WorkoutPlan model"""
    plan_days = WorkoutPlanDaySerializer(many=True, read_only=True)
    total_days = serializers.SerializerMethodField()
    is_scheduled = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutPlan
        fields = [
            'id', 'name', 'description', 'goal', 'difficulty',
            'duration_weeks', 'days_per_week', 'overview', 'requirements',
            'is_custom', 'created_by', 'plan_days', 'total_days',
            'is_scheduled', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

    def get_total_days(self, obj):
        return obj.plan_days.count()

    def get_is_scheduled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return WorkoutSchedule.objects.filter(
                user=request.user,
                workout_plan=obj,
                is_active=True
            ).exists()
        return False

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['is_custom'] = True
        validated_data['created_by'] = request.user
        return super().create(validated_data)


class WorkoutPlanDetailSerializer(WorkoutPlanSerializer):
    """Detailed serializer for WorkoutPlan with all nested data"""
    plan_days = WorkoutPlanDaySerializer(many=True, read_only=True)


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    """Serializer for exercises in a workout log"""
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.PrimaryKeyRelatedField(
        queryset=Exercise.objects.all(),
        source='exercise',
        write_only=True
    )
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutExercise
        fields = [
            'id', 'exercise', 'exercise_id', 'order',
            'planned_sets', 'planned_reps', 'planned_duration_seconds',
            'planned_weight_kg', 'completed_sets', 'actual_reps',
            'actual_weight_kg', 'notes', 'completed', 'completion_percentage'
        ]

    def get_completion_percentage(self, obj):
        if obj.planned_sets > 0:
            return (obj.completed_sets / obj.planned_sets) * 100
        return 0


class WorkoutSerializer(serializers.ModelSerializer):
    """Serializer for Workout model"""
    exercises = WorkoutExerciseSerializer(many=True, read_only=True)
    workout_plan_name = serializers.CharField(
        source='workout_plan.name',
        read_only=True
    )
    exercise_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Workout
        fields = [
            'id', 'workout_plan', 'workout_plan_name', 'name', 'date',
            'start_time', 'end_time', 'duration_minutes',
            'total_calories_burned', 'notes', 'completed',
            'exercises', 'exercise_count', 'completion_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_exercise_count(self, obj):
        return obj.exercises.count()

    def get_completion_percentage(self, obj):
        total_exercises = obj.exercises.count()
        if total_exercises > 0:
            completed_exercises = obj.exercises.filter(completed=True).count()
            return (completed_exercises / total_exercises) * 100
        return 0

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


class WorkoutCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a workout with exercises"""
    exercises = WorkoutExerciseSerializer(many=True, write_only=True)

    class Meta:
        model = Workout
        fields = [
            'workout_plan', 'name', 'date', 'start_time', 'end_time',
            'notes', 'exercises'
        ]

    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises', [])
        request = self.context.get('request')
        validated_data['user'] = request.user
        
        workout = Workout.objects.create(**validated_data)
        
        # Create exercises
        for exercise_data in exercises_data:
            WorkoutExercise.objects.create(workout=workout, **exercise_data)
        
        return workout


class WorkoutScheduleSerializer(serializers.ModelSerializer):
    """Serializer for WorkoutSchedule model"""
    workout_plan = WorkoutPlanSerializer(read_only=True)
    workout_plan_id = serializers.PrimaryKeyRelatedField(
        queryset=WorkoutPlan.objects.all(),
        source='workout_plan',
        write_only=True
    )
    progress_percentage = serializers.SerializerMethodField()
    days_completed = serializers.SerializerMethodField()
    total_days = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutSchedule
        fields = [
            'id', 'workout_plan', 'workout_plan_id', 'start_date',
            'end_date', 'is_active', 'completed', 'progress_percentage',
            'days_completed', 'total_days', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_progress_percentage(self, obj):
        from datetime import date
        if obj.end_date:
            total_days = (obj.end_date - obj.start_date).days + 1
            days_passed = (date.today() - obj.start_date).days + 1
            if total_days > 0:
                return min((days_passed / total_days) * 100, 100)
        return 0

    def get_days_completed(self, obj):
        return Workout.objects.filter(
            user=obj.user,
            workout_plan=obj.workout_plan,
            date__gte=obj.start_date,
            date__lte=obj.end_date if obj.end_date else obj.start_date,
            completed=True
        ).count()

    def get_total_days(self, obj):
        if obj.end_date:
            return (obj.end_date - obj.start_date).days + 1
        return obj.workout_plan.duration_weeks * obj.workout_plan.days_per_week

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user
        
        # Calculate end date if not provided
        if not validated_data.get('end_date'):
            from datetime import timedelta
            workout_plan = validated_data['workout_plan']
            duration_days = workout_plan.duration_weeks * 7
            validated_data['end_date'] = validated_data['start_date'] + timedelta(days=duration_days)
        
        return super().create(validated_data)


class FavoriteExerciseSerializer(serializers.ModelSerializer):
    """Serializer for FavoriteExercise model"""
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.PrimaryKeyRelatedField(
        queryset=Exercise.objects.all(),
        source='exercise',
        write_only=True
    )

    class Meta:
        model = FavoriteExercise
        fields = ['id', 'exercise', 'exercise_id', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


class WorkoutStatsSerializer(serializers.Serializer):
    """Serializer for workout statistics"""
    total_workouts = serializers.IntegerField()
    completed_workouts = serializers.IntegerField()
    total_duration_minutes = serializers.IntegerField()
    total_calories_burned = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_duration_minutes = serializers.FloatField()
    completion_rate = serializers.FloatField()
    workouts_this_week = serializers.IntegerField()
    workouts_this_month = serializers.IntegerField()
    favorite_exercise_type = serializers.CharField()
    most_used_exercises = serializers.ListField()
