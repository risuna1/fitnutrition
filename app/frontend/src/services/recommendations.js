import api from './api';

const recommendationsService = {
  // Get workout recommendations
  getWorkoutRecommendations: async (type = 'plans') => {
    const response = await api.get('/recommendations/workouts/', { params: { type } });
    return response.data;
  },

  // Get nutrition recommendations
  getNutritionRecommendations: async (type = 'meals', mealType = 'lunch') => {
    const response = await api.get('/recommendations/nutrition/', { 
      params: { type, meal_type: mealType } 
    });
    return response.data;
  },

  // Get personalized plan
  getPersonalizedPlan: async () => {
    const response = await api.get('/recommendations/personalized-plan/');
    return response.data;
  },

  // Get AI insights
  getAIInsights: async () => {
    const response = await api.get('/recommendations/ai-insights/');
    return response.data;
  },

  // Get daily recommendations
  getDailyRecommendations: async (date = 'today') => {
    const response = await api.get('/recommendations/daily/', { params: { date } });
    return response.data;
  },
};

export default recommendationsService;
