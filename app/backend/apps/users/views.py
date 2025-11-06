"""
Views for User authentication and profile management
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, UserProfile, FoodPreference, UserPreferences
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserProfileCreateSerializer,
    FoodPreferenceSerializer,
    UserDetailSerializer,
    UserPreferencesSerializer,
    ChangePasswordSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """
    API endpoint for user registration
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'ユーザー登録が完了しました'
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    """
    API endpoint for user login
    POST /api/auth/login/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'error': 'メールアドレスとパスワードの両方を入力してください'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user using custom backend (supports email or username)
        user = authenticate(request=request, username=email, password=password)
        
        if user is not None:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserDetailSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'message': 'ログインに成功しました'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'メールアドレスまたはパスワードが正しくありません'
        }, status=status.HTTP_401_UNAUTHORIZED)


class UserLogoutView(APIView):
    """
    API endpoint for user logout
    POST /api/auth/logout/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({
                'message': 'ログアウトしました'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint to retrieve, update, and delete user profile
    GET/PUT/PATCH/DELETE /api/profile/
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete user account and all related data
        """
        user = self.get_object()
        
        # Delete the user (this will cascade delete all related data)
        user.delete()
        
        return Response({
            'message': 'アカウントが正常に削除されました'
        }, status=status.HTTP_200_OK)


class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for user profile details
    GET/PUT/PATCH /api/profile/details/
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class UserProfileCreateView(generics.CreateAPIView):
    """
    API endpoint to create user profile
    POST /api/profile/create/
    """
    serializer_class = UserProfileCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FoodPreferenceView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for food preferences
    GET/PUT/PATCH /api/profile/food-preferences/
    """
    serializer_class = FoodPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        preference, created = FoodPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference


class UserPreferencesView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for user preferences
    GET/PUT/PATCH /api/profile/preferences/
    """
    serializer_class = UserPreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        preferences, created = UserPreferences.objects.get_or_create(
            user=self.request.user
        )
        return preferences


class ChangePasswordView(APIView):
    """
    API endpoint to change password
    POST /api/profile/change-password/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            # Check old password
            if not user.check_password(serializer.validated_data.get('old_password')):
                return Response({
                    'error': '現在のパスワードが正しくありません'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(serializer.validated_data.get('new_password'))
            user.save()
            
            return Response({
                'message': 'パスワードが正常に変更されました'
            }, status=status.HTTP_200_OK)
        
        # Return detailed error messages
        return Response({
            'error': 'パスワード変更に失敗しました',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_stats(request):
    """
    Get user statistics
    GET /api/profile/stats/
    """
    user = request.user
    
    try:
        profile = user.profile
        stats = {
            'bmi': profile.bmi,
            'bmr': profile.bmr,
            'tdee': profile.tdee,
            'daily_calorie_target': profile.daily_calorie_target,
            'macro_targets': profile.macro_targets,
        }
        return Response(stats, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({
            'error': 'プロフィールが見つかりません。まずプロフィールを完成させてください。'
        }, status=status.HTTP_404_NOT_FOUND)
