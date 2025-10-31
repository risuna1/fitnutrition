import api from './api';

const usersService = {
  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data) => {
    const response = await api.put('/profile/', data);
    return response.data;
  },

  // Get user profile details
  getProfileDetails: async () => {
    const response = await api.get('/profile/details/');
    return response.data;
  },

  // Create user profile
  createProfile: async (data) => {
    const response = await api.post('/profile/create/', data);
    return response.data;
  },

  // Get user stats
  getUserStats: async () => {
    const response = await api.get('/profile/stats/');
    return response.data;
  },

  // Get food preferences
  getFoodPreferences: async () => {
    const response = await api.get('/profile/food-preferences/');
    return response.data;
  },

  // Update food preferences
  updateFoodPreferences: async (data) => {
    const response = await api.put('/profile/food-preferences/', data);
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword, newPassword2) => {
    const response = await api.post('/profile/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword2,
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await api.delete('/profile/');
    return response.data;
  },
};

export default usersService;
