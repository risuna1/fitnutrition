"""
Serializers for User models
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile, FoodPreference


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    age = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'date_of_birth', 'age', 'profile_picture',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    # Profile fields
    gender = serializers.CharField(required=False, write_only=True)
    height = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, write_only=True)
    weight = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, write_only=True)
    activity_level = serializers.CharField(required=False, write_only=True)
    fitness_goal = serializers.CharField(required=False, write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'phone', 'date_of_birth',
            'gender', 'height', 'weight', 'activity_level', 'fitness_goal'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "パスワードが一致しません。"}
            )
        
        # Generate username from email if not provided
        if not attrs.get('username'):
            email = attrs.get('email', '')
            username = email.split('@')[0]
            # Ensure username is unique
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            attrs['username'] = username
        
        return attrs
    
    def create(self, validated_data):
        # Extract profile fields
        profile_data = {
            'gender': validated_data.pop('gender', None),
            'height': validated_data.pop('height', None),
            'current_weight': validated_data.pop('weight', None),
            'activity_level': validated_data.pop('activity_level', None),
            'fitness_goal': validated_data.pop('fitness_goal', None),
        }
        
        # Remove password2 and create user
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        
        # Create user profile if profile data is provided
        if any(profile_data.values()):
            UserProfile.objects.create(user=user, **{k: v for k, v in profile_data.items() if v is not None})
        
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    user = UserSerializer(read_only=True)
    bmi = serializers.ReadOnlyField()
    bmr = serializers.ReadOnlyField()
    tdee = serializers.ReadOnlyField()
    daily_calorie_target = serializers.ReadOnlyField()
    macro_targets = serializers.ReadOnlyField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'gender', 'height', 'current_weight', 'target_weight',
            'activity_level', 'fitness_goal', 'body_fat_percentage',
            'chest', 'waist', 'hips', 'arms', 'thighs', 'calves',
            'bmi', 'bmr', 'tdee', 'daily_calorie_target', 'macro_targets',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class UserProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating UserProfile"""
    
    class Meta:
        model = UserProfile
        fields = [
            'gender', 'height', 'current_weight', 'target_weight',
            'activity_level', 'fitness_goal', 'body_fat_percentage',
            'chest', 'waist', 'hips', 'arms', 'thighs', 'calves'
        ]


class FoodPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for FoodPreference model"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = FoodPreference
        fields = [
            'id', 'user', 'diet_type', 'allergies', 'dislikes',
            'preferred_foods', 'avoid_ingredients',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for User with profile and preferences"""
    profile = UserProfileSerializer(read_only=True)
    food_preferences = FoodPreferenceSerializer(read_only=True)
    age = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'date_of_birth', 'age', 'profile_picture',
            'profile', 'food_preferences',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password2 = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError(
                {"new_password": "パスワードが一致しません。"}
            )
        return attrs
