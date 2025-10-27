// Email validation
export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

// Name validation
export const validateName = (name, fieldName = 'Name') => {
  if (!name) {
    return `${fieldName} is required`;
  }
  if (name.length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  if (name.length > 50) {
    return `${fieldName} must not exceed 50 characters`;
  }
  return null;
};

// Number validation
export const validateNumber = (value, fieldName = 'Value', min = null, max = null) => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (min !== null && num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (max !== null && num > max) {
    return `${fieldName} must not exceed ${max}`;
  }
  
  return null;
};

// Weight validation (kg)
export const validateWeight = (weight) => {
  return validateNumber(weight, 'Weight', 20, 300);
};

// Height validation (cm)
export const validateHeight = (height) => {
  return validateNumber(height, 'Height', 100, 250);
};

// Age validation
export const validateAge = (age) => {
  return validateNumber(age, 'Age', 13, 120);
};

// Body fat percentage validation
export const validateBodyFat = (bodyFat) => {
  if (!bodyFat) return null; // Optional field
  return validateNumber(bodyFat, 'Body fat percentage', 3, 60);
};

// Date validation
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) {
    return `${fieldName} is required`;
  }
  
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return `Please enter a valid ${fieldName.toLowerCase()}`;
  }
  
  // Check if date is not in the future
  if (d > new Date()) {
    return `${fieldName} cannot be in the future`;
  }
  
  return null;
};

// Required field validation
export const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined || value === '' || 
      (Array.isArray(value) && value.length === 0)) {
    return `${fieldName} is required`;
  }
  return null;
};

// Select validation
export const validateSelect = (value, fieldName = 'Field') => {
  if (!value || value === '') {
    return `Please select a ${fieldName.toLowerCase()}`;
  }
  return null;
};

// Calories validation
export const validateCalories = (calories) => {
  return validateNumber(calories, 'Calories', 0, 10000);
};

// Macros validation
export const validateMacros = (value, macroName) => {
  return validateNumber(value, macroName, 0, 1000);
};

// Exercise sets validation
export const validateSets = (sets) => {
  return validateNumber(sets, 'Sets', 1, 20);
};

// Exercise reps validation
export const validateReps = (reps) => {
  return validateNumber(reps, 'Reps', 1, 100);
};

// Exercise weight validation
export const validateExerciseWeight = (weight) => {
  if (!weight) return null; // Optional for bodyweight exercises
  return validateNumber(weight, 'Weight', 0, 500);
};

// Duration validation (minutes)
export const validateDuration = (duration) => {
  return validateNumber(duration, 'Duration', 1, 480);
};

// URL validation
export const validateURL = (url) => {
  if (!url) return null; // Optional field
  
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

// Phone number validation
export const validatePhone = (phone) => {
  if (!phone) return null; // Optional field
  
  const re = /^[\d\s\-\+\(\)]+$/;
  if (!re.test(phone)) {
    return 'Please enter a valid phone number';
  }
  
  if (phone.replace(/\D/g, '').length < 10) {
    return 'Phone number must be at least 10 digits';
  }
  
  return null;
};

// Form validation helper
export const validateForm = (values, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = values[field];
    
    if (rule.required) {
      const error = validateRequired(value, rule.label || field);
      if (error) {
        errors[field] = error;
        return;
      }
    }
    
    if (rule.type === 'email') {
      const error = validateEmail(value);
      if (error) errors[field] = error;
    }
    
    if (rule.type === 'password') {
      const error = validatePassword(value);
      if (error) errors[field] = error;
    }
    
    if (rule.type === 'number') {
      const error = validateNumber(value, rule.label, rule.min, rule.max);
      if (error) errors[field] = error;
    }
    
    if (rule.type === 'date') {
      const error = validateDate(value, rule.label);
      if (error) errors[field] = error;
    }
    
    if (rule.custom) {
      const error = rule.custom(value, values);
      if (error) errors[field] = error;
    }
  });
  
  return errors;
};

// Check if form has errors
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

// Get first error message
export const getFirstError = (errors) => {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
};
