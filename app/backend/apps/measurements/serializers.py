"""
Serializers for Measurements models
"""
from rest_framework import serializers
from .models import BodyMeasurement, ProgressLog


class BodyMeasurementSerializer(serializers.ModelSerializer):
    """Serializer for BodyMeasurement model"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    bmi = serializers.ReadOnlyField()
    weight_change = serializers.ReadOnlyField()
    body_fat_change = serializers.ReadOnlyField()
    
    class Meta:
        model = BodyMeasurement
        fields = [
            'id', 'user', 'user_name', 'date', 'weight', 'body_fat_percentage',
            'muscle_mass', 'chest', 'waist', 'hips', 'arms_left', 'arms_right',
            'thighs_left', 'thighs_right', 'calves_left', 'calves_right',
            'neck', 'shoulders', 'notes', 'photo', 'bmi', 'weight_change',
            'body_fat_change', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class BodyMeasurementCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating BodyMeasurement"""
    
    class Meta:
        model = BodyMeasurement
        fields = [
            'date', 'weight', 'body_fat_percentage', 'muscle_mass',
            'chest', 'waist', 'hips', 'arms_left', 'arms_right',
            'thighs_left', 'thighs_right', 'calves_left', 'calves_right',
            'neck', 'shoulders', 'notes', 'photo'
        ]
    
    def validate_date(self, value):
        """Ensure no duplicate measurements for the same date"""
        user = self.context['request'].user
        if BodyMeasurement.objects.filter(user=user, date=value).exists():
            raise serializers.ValidationError(
                "A measurement for this date already exists. Please update the existing one."
            )
        return value


class BodyMeasurementListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing measurements"""
    bmi = serializers.ReadOnlyField()
    weight_change = serializers.ReadOnlyField()
    
    class Meta:
        model = BodyMeasurement
        fields = [
            'id', 'date', 'weight', 'body_fat_percentage', 'bmi',
            'weight_change', 'created_at'
        ]


class ProgressLogSerializer(serializers.ModelSerializer):
    """Serializer for ProgressLog model"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = ProgressLog
        fields = [
            'id', 'user', 'user_name', 'date', 'energy_level', 'mood',
            'sleep_quality', 'sleep_hours', 'soreness_level', 'stress_level',
            'notes', 'achievements', 'challenges', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ProgressLogCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ProgressLog"""
    
    class Meta:
        model = ProgressLog
        fields = [
            'date', 'energy_level', 'mood', 'sleep_quality', 'sleep_hours',
            'soreness_level', 'stress_level', 'notes', 'achievements', 'challenges'
        ]
    
    def validate_date(self, value):
        """Ensure no duplicate logs for the same date"""
        user = self.context['request'].user
        if ProgressLog.objects.filter(user=user, date=value).exists():
            raise serializers.ValidationError(
                "A progress log for this date already exists. Please update the existing one."
            )
        return value


class MeasurementHistorySerializer(serializers.Serializer):
    """Serializer for measurement history data"""
    dates = serializers.ListField(child=serializers.DateField())
    weights = serializers.ListField(child=serializers.DecimalField(max_digits=5, decimal_places=2))
    body_fat_percentages = serializers.ListField(
        child=serializers.DecimalField(max_digits=4, decimal_places=1, allow_null=True)
    )
    bmis = serializers.ListField(child=serializers.FloatField(allow_null=True))


class ProgressSummarySerializer(serializers.Serializer):
    """Serializer for progress summary statistics"""
    total_measurements = serializers.IntegerField()
    total_progress_logs = serializers.IntegerField()
    starting_weight = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    current_weight = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    total_weight_change = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    starting_body_fat = serializers.DecimalField(max_digits=4, decimal_places=1, allow_null=True)
    current_body_fat = serializers.DecimalField(max_digits=4, decimal_places=1, allow_null=True)
    body_fat_change = serializers.DecimalField(max_digits=4, decimal_places=1, allow_null=True)
    average_energy_level = serializers.FloatField(allow_null=True)
    average_sleep_hours = serializers.FloatField(allow_null=True)
