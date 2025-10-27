from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    Exercise, WorkoutPlan, WorkoutPlanDay, WorkoutPlanExercise,
    Workout, WorkoutExercise, WorkoutSchedule, FavoriteExercise
)
from .serializers import (
    ExerciseSerializer, WorkoutPlanSerializer, WorkoutPlanDetailSerializer,
    WorkoutPlanDaySerializer, WorkoutSerializer, WorkoutCreateSerializer,
    WorkoutScheduleSerializer, FavoriteExerciseSerializer,
    WorkoutStatsSerializer, WorkoutExerciseSerializer
)


class ExerciseViewSet(viewsets.ModelViewSet):
    """ViewSet for Exercise model"""
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'primary_muscles', 'secondary_muscles']
    ordering_fields = ['name', 'difficulty', 'calories_per_minute', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        queryset = Exercise.objects.all()
        
        # Filter by exercise type
        exercise_type = self.request.query_params.get('type')
        if exercise_type:
            queryset = queryset.filter(exercise_type=exercise_type)
        
        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # Filter by equipment
        equipment = self.request.query_params.get('equipment')
        if equipment:
            queryset = queryset.filter(equipment=equipment)
        
        # Filter by muscle group
        muscle = self.request.query_params.get('muscle')
        if muscle:
            queryset = queryset.filter(
                Q(primary_muscles__contains=[muscle]) |
                Q(secondary_muscles__contains=[muscle])
            )
        
        # Show only user's custom exercises or all public exercises
        show_custom_only = self.request.query_params.get('custom_only')
        if show_custom_only == 'true':
            queryset = queryset.filter(created_by=self.request.user)
        
        return queryset

    def get_serializer_class(self):
        return ExerciseSerializer

    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get all exercise types"""
        types = Exercise.EXERCISE_TYPES
        return Response([{'value': t[0], 'label': t[1]} for t in types])

    @action(detail=False, methods=['get'])
    def equipment_list(self, request):
        """Get all equipment types"""
        equipment = Exercise.EQUIPMENT_CHOICES
        return Response([{'value': e[0], 'label': e[1]} for e in equipment])

    @action(detail=False, methods=['get'])
    def muscle_groups(self, request):
        """Get all muscle groups"""
        muscles = [
            'chest', 'back', 'shoulders', 'biceps', 'triceps',
            'forearms', 'abs', 'obliques', 'quads', 'hamstrings',
            'glutes', 'calves', 'traps', 'lats'
        ]
        return Response(muscles)


class WorkoutPlanViewSet(viewsets.ModelViewSet):
    """ViewSet for WorkoutPlan model"""
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'overview']
    ordering_fields = ['name', 'difficulty', 'duration_weeks', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = WorkoutPlan.objects.all()
        
        # Filter by goal
        goal = self.request.query_params.get('goal')
        if goal:
            queryset = queryset.filter(goal=goal)
        
        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # Show only user's custom plans or all public plans
        show_custom_only = self.request.query_params.get('custom_only')
        if show_custom_only == 'true':
            queryset = queryset.filter(created_by=self.request.user)
        
        return queryset.prefetch_related('plan_days__exercises__exercise')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return WorkoutPlanDetailSerializer
        return WorkoutPlanSerializer

    @action(detail=True, methods=['post'])
    def schedule(self, request, pk=None):
        """Schedule a workout plan"""
        workout_plan = self.get_object()
        start_date = request.data.get('start_date')
        
        if not start_date:
            return Response(
                {'error': 'start_date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Deactivate other active schedules
        WorkoutSchedule.objects.filter(
            user=request.user,
            is_active=True
        ).update(is_active=False)
        
        # Create new schedule
        serializer = WorkoutScheduleSerializer(
            data={
                'workout_plan_id': workout_plan.id,
                'start_date': start_date
            },
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WorkoutViewSet(viewsets.ModelViewSet):
    """ViewSet for Workout model"""
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'notes']
    ordering_fields = ['date', 'duration_minutes', 'total_calories_burned', 'created_at']
    ordering = ['-date', '-created_at']

    def get_queryset(self):
        queryset = Workout.objects.filter(user=self.request.user)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Filter by completion status
        completed = self.request.query_params.get('completed')
        if completed is not None:
            queryset = queryset.filter(completed=completed.lower() == 'true')
        
        # Filter by workout plan
        workout_plan_id = self.request.query_params.get('workout_plan')
        if workout_plan_id:
            queryset = queryset.filter(workout_plan_id=workout_plan_id)
        
        return queryset.prefetch_related('exercises__exercise')

    def get_serializer_class(self):
        if self.action == 'create':
            return WorkoutCreateSerializer
        return WorkoutSerializer

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's workouts"""
        today = timezone.now().date()
        workouts = self.get_queryset().filter(date=today)
        serializer = self.get_serializer(workouts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def this_week(self, request):
        """Get this week's workouts"""
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)
        
        workouts = self.get_queryset().filter(
            date__gte=start_of_week,
            date__lte=end_of_week
        )
        serializer = self.get_serializer(workouts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get workout statistics"""
        queryset = self.get_queryset()
        
        # Date range filter
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Calculate stats
        total_workouts = queryset.count()
        completed_workouts = queryset.filter(completed=True).count()
        
        aggregates = queryset.aggregate(
            total_duration=Sum('duration_minutes'),
            total_calories=Sum('total_calories_burned'),
            avg_duration=Avg('duration_minutes')
        )
        
        # This week and month
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)
        
        workouts_this_week = queryset.filter(date__gte=start_of_week).count()
        workouts_this_month = queryset.filter(date__gte=start_of_month).count()
        
        # Most used exercises
        exercise_counts = WorkoutExercise.objects.filter(
            workout__user=request.user
        ).values('exercise__name').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        most_used_exercises = [
            {'name': e['exercise__name'], 'count': e['count']}
            for e in exercise_counts
        ]
        
        # Favorite exercise type
        type_counts = WorkoutExercise.objects.filter(
            workout__user=request.user
        ).values('exercise__exercise_type').annotate(
            count=Count('id')
        ).order_by('-count').first()
        
        favorite_type = type_counts['exercise__exercise_type'] if type_counts else 'N/A'
        
        stats = {
            'total_workouts': total_workouts,
            'completed_workouts': completed_workouts,
            'total_duration_minutes': aggregates['total_duration'] or 0,
            'total_calories_burned': aggregates['total_calories'] or 0,
            'average_duration_minutes': aggregates['avg_duration'] or 0,
            'completion_rate': (completed_workouts / total_workouts * 100) if total_workouts > 0 else 0,
            'workouts_this_week': workouts_this_week,
            'workouts_this_month': workouts_this_month,
            'favorite_exercise_type': favorite_type,
            'most_used_exercises': most_used_exercises
        }
        
        serializer = WorkoutStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark workout as completed"""
        workout = self.get_object()
        workout.completed = True
        
        # Calculate duration if not set
        if not workout.duration_minutes:
            workout.calculate_duration()
        
        workout.save()
        serializer = self.get_serializer(workout)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_exercise(self, request, pk=None):
        """Add an exercise to the workout"""
        workout = self.get_object()
        serializer = WorkoutExerciseSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save(workout=workout)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WorkoutScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for WorkoutSchedule model"""
    permission_classes = [IsAuthenticated]
    serializer_class = WorkoutScheduleSerializer
    ordering = ['-start_date']

    def get_queryset(self):
        queryset = WorkoutSchedule.objects.filter(user=self.request.user)
        
        # Filter by active status
        is_active = self.request.query_params.get('active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.select_related('workout_plan')

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active workout schedule"""
        schedule = self.get_queryset().filter(is_active=True).first()
        if schedule:
            serializer = self.get_serializer(schedule)
            return Response(serializer.data)
        return Response({'detail': 'No active schedule found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a workout schedule"""
        schedule = self.get_object()
        schedule.is_active = False
        schedule.save()
        serializer = self.get_serializer(schedule)
        return Response(serializer.data)


class FavoriteExerciseViewSet(viewsets.ModelViewSet):
    """ViewSet for FavoriteExercise model"""
    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteExerciseSerializer
    http_method_names = ['get', 'post', 'delete']

    def get_queryset(self):
        return FavoriteExercise.objects.filter(
            user=self.request.user
        ).select_related('exercise')

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """Toggle favorite status for an exercise"""
        exercise_id = request.data.get('exercise_id')
        
        if not exercise_id:
            return Response(
                {'error': 'exercise_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            exercise = Exercise.objects.get(id=exercise_id)
        except Exercise.DoesNotExist:
            return Response(
                {'error': 'Exercise not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        favorite, created = FavoriteExercise.objects.get_or_create(
            user=request.user,
            exercise=exercise
        )
        
        if not created:
            favorite.delete()
            return Response(
                {'status': 'removed', 'is_favorited': False},
                status=status.HTTP_200_OK
            )
        
        serializer = self.get_serializer(favorite)
        return Response(
            {'status': 'added', 'is_favorited': True, 'data': serializer.data},
            status=status.HTTP_201_CREATED
        )
