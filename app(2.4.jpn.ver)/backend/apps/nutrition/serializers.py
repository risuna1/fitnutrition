"""
Serializers for Nutrition models
"""
from rest_framework import serializers
from .models import (
    Food, Meal, MealItem, MealPlan, 
    FavoriteFood, FavoriteMeal, FavoriteMealItem
)


class FoodSerializer(serializers.ModelSerializer):
    """Serializer for Food model"""
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Food
        fields = [
            'id', 'name', 'category', 'brand', 'serving_size',
            'calories', 'protein', 'carbohydrates', 'fats',
            'fiber', 'sugar', 'sodium', 'vitamin_a', 'vitamin_c',
            'calcium', 'iron', 'description', 'image',
            'is_custom', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class FoodCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating custom foods"""
    
    class Meta:
        model = Food
        fields = [
            'name', 'category', 'brand', 'serving_size',
            'calories', 'protein', 'carbohydrates', 'fats',
            'fiber', 'sugar', 'sodium', 'vitamin_a', 'vitamin_c',
            'calcium', 'iron', 'description', 'image'
        ]


class MealItemSerializer(serializers.ModelSerializer):
    """Serializer for MealItem model"""
    food = FoodSerializer(read_only=True)
    food_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MealItem
        fields = [
            'id', 'food', 'food_id', 'serving_size',
            'calories', 'protein', 'carbohydrates', 'fats',
            'created_at'
        ]
        read_only_fields = ['id', 'calories', 'protein', 'carbohydrates', 'fats', 'created_at']


class MealSerializer(serializers.ModelSerializer):
    """Serializer for Meal model"""
    items = MealItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    total_calories = serializers.ReadOnlyField()
    total_protein = serializers.ReadOnlyField()
    total_carbs = serializers.ReadOnlyField()
    total_fats = serializers.ReadOnlyField()
    
    class Meta:
        model = Meal
        fields = [
            'id', 'user', 'user_name', 'name', 'meal_type', 'date', 'time',
            'notes', 'image', 'items', 'total_calories', 'total_protein',
            'total_carbs', 'total_fats', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class MealCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating meals"""
    items = MealItemSerializer(many=True, required=False)
    
    class Meta:
        model = Meal
        fields = ['name', 'meal_type', 'date', 'time', 'notes', 'image', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        meal = Meal.objects.create(**validated_data)
        
        for item_data in items_data:
            food_id = item_data.pop('food_id')
            MealItem.objects.create(
                meal=meal,
                food_id=food_id,
                **item_data
            )
        
        return meal


class MealPlanSerializer(serializers.ModelSerializer):
    """Serializer for MealPlan model"""
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = MealPlan
        fields = [
            'id', 'name', 'description', 'goal', 'daily_calories',
            'protein_percentage', 'carbs_percentage', 'fats_percentage',
            'duration_days', 'is_active', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class FavoriteFoodSerializer(serializers.ModelSerializer):
    """Serializer for FavoriteFood model"""
    food = FoodSerializer(read_only=True)
    food_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = FavoriteFood
        fields = ['id', 'user', 'food', 'food_id', 'added_at']
        read_only_fields = ['id', 'user', 'added_at']


class FavoriteMealItemSerializer(serializers.ModelSerializer):
    """Serializer for FavoriteMealItem model"""
    food = FoodSerializer(read_only=True)
    food_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = FavoriteMealItem
        fields = ['id', 'food', 'food_id', 'serving_size']
        read_only_fields = ['id']


class FavoriteMealSerializer(serializers.ModelSerializer):
    """Serializer for FavoriteMeal model"""
    items = FavoriteMealItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = FavoriteMeal
        fields = [
            'id', 'user', 'user_name', 'name', 'meal_type',
            'description', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class FavoriteMealCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating favorite meals"""
    items = FavoriteMealItemSerializer(many=True)
    
    class Meta:
        model = FavoriteMeal
        fields = ['name', 'meal_type', 'description', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        favorite_meal = FavoriteMeal.objects.create(**validated_data)
        
        for item_data in items_data:
            food_id = item_data.pop('food_id')
            FavoriteMealItem.objects.create(
                favorite_meal=favorite_meal,
                food_id=food_id,
                **item_data
            )
        
        return favorite_meal


class DailyNutritionSummarySerializer(serializers.Serializer):
    """Serializer for daily nutrition summary"""
    date = serializers.DateField()
    total_calories = serializers.DecimalField(max_digits=7, decimal_places=1)
    total_protein = serializers.DecimalField(max_digits=6, decimal_places=1)
    total_carbs = serializers.DecimalField(max_digits=6, decimal_places=1)
    total_fats = serializers.DecimalField(max_digits=6, decimal_places=1)
    meals_count = serializers.IntegerField()
    target_calories = serializers.DecimalField(max_digits=7, decimal_places=1, allow_null=True)
    calories_remaining = serializers.DecimalField(max_digits=7, decimal_places=1, allow_null=True)
