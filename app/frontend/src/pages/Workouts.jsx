import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Grid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  Spinner,
  Center,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Badge,
  VStack,
  HStack,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Progress,
  Flex,
  Divider,
  Image,
  CloseButton,
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiCheck, 
  FiClock, 
  FiActivity, 
  FiChevronLeft, 
  FiChevronRight,
  FiPlay,
  FiEdit,
  FiTrash2,
  FiInfo,
  FiList,
  FiStar,
  FiImage,
  FiX,
} from 'react-icons/fi';
import workoutsService from '../services/workouts';
import { formatDate } from '../utils/helpers';
import { getImageUrl } from '../services/api';

const Workouts = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCreateExerciseOpen, onOpen: onCreateExerciseOpen, onClose: onCreateExerciseClose } = useDisclosure();
  const { isOpen: isEditExerciseOpen, onOpen: onEditExerciseOpen, onClose: onEditExerciseClose } = useDisclosure();
  const { isOpen: isDeleteExerciseOpen, onOpen: onDeleteExerciseOpen, onClose: onDeleteExerciseClose } = useDisclosure();
  const { isOpen: isEditWorkoutOpen, onOpen: onEditWorkoutOpen, onClose: onEditWorkoutClose } = useDisclosure();
  const { isOpen: isDeleteWorkoutOpen, onOpen: onDeleteWorkoutOpen, onClose: onDeleteWorkoutClose } = useDisclosure();
  const { isOpen: isExerciseMediaOpen, onOpen: onExerciseMediaOpen, onClose: onExerciseMediaClose } = useDisclosure();
  const { isOpen: isCreatePlanOpen, onOpen: onCreatePlanOpen, onClose: onCreatePlanClose } = useDisclosure();
  const { isOpen: isDeletePlanOpen, onOpen: onDeletePlanOpen, onClose: onDeletePlanClose } = useDisclosure();
  const { isOpen: isStartPlanOpen, onOpen: onStartPlanOpen, onClose: onStartPlanClose } = useDisclosure();
  const toast = useToast();
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [planToStart, setPlanToStart] = useState(null);
  const [planStartDate, setPlanStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [exerciseToEdit, setExerciseToEdit] = useState(null);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [workoutToEdit, setWorkoutToEdit] = useState(null);
  const [exerciseMediaView, setExerciseMediaView] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [plans, setPlans] = useState([]);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    notes: '',
  });
  const [newExerciseData, setNewExerciseData] = useState({
    name: '',
    exercise_type: '',
    muscle_group: '',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    primary_muscles: [],
    secondary_muscles: [],
    instructions: '',
    calories_per_minute: '5.0',
    image_url: '',
  });
  const [exerciseMediaFiles, setExerciseMediaFiles] = useState([]);
  const [exerciseMediaPreviews, setExerciseMediaPreviews] = useState([]);
  const [newPlanData, setNewPlanData] = useState({
    name: '',
    description: '',
    goal: '',
    difficulty: '',
    duration_weeks: '',
    days_per_week: '',
    overview: '',
    requirements: '',
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Helper function to get week start (Monday)
  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Get week days array
  function getWeekDays(weekStart) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
    return days;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workoutsResponse, exercisesResponse, plansResponse] = await Promise.all([
        workoutsService.workouts.getAll(),
        workoutsService.exercises.getAll(),
        workoutsService.workoutPlans.getAll(),
      ]);
      setWorkouts(workoutsResponse.results || workoutsResponse);
      setExercises(exercisesResponse.results || exercisesResponse);
      setPlans(plansResponse.results || plansResponse);
      
      // Load active schedule
      try {
        const scheduleResponse = await workoutsService.schedules.getActive();
        setActiveSchedule(scheduleResponse);
      } catch (scheduleError) {
        // No active schedule is fine
        setActiveSchedule(null);
      }
    } catch (error) {
      toast({
        title: 'データ読み込みエラー',
        description: error.response?.data?.detail || 'ワークアウトデータの読み込みに失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWorkoutModal = () => {
    // カレンダーで選択した日付をフォームに設定
    setFormData({
      name: '',
      date: selectedDate.toISOString().split('T')[0],
      duration: '',
      notes: '',
    });
    setSelectedExercises([]);
    onOpen();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleExerciseSelect = (exercise) => {
    setSelectedExercises([...selectedExercises, { ...exercise, sets: 3, reps: 10, weight: 0 }]);
    toast({
      title: 'エクササイズを追加しました',
      description: `${exercise.name}を追加しました`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleExerciseRemove = (index) => {
    const updatedExercises = selectedExercises.filter((_, i) => i !== index);
    setSelectedExercises(updatedExercises);
  };

  const handleExerciseUpdate = (index, field, value) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[index][field] = value;
    setSelectedExercises(updatedExercises);
  };

  // Calculate total calories using MET formula
  // Calories = MET × Weight (kg) × Duration (hours)
  const calculateTotalCalories = () => {
    if (!formData.duration || selectedExercises.length === 0) return 0;
    
    const durationMinutes = parseInt(formData.duration) || 0;
    const durationHours = durationMinutes / 60;
    
    // Use default weight of 70kg if user weight is not available
    // TODO: Get actual weight from user profile
    const userWeight = 70;
    
    // Calculate total calories using MET values
    const totalCalories = selectedExercises.reduce((sum, exercise) => {
      const metValue = parseFloat(exercise.met_value) || parseFloat(exercise.calories_per_minute) || 5.0;
      const calories = metValue * userWeight * durationHours;
      return sum + calories;
    }, 0);
    
    // Divide by number of exercises since they're done sequentially, not simultaneously
    return Math.round(totalCalories / selectedExercises.length);
  };

  const handleOpenCreateExercise = () => {
    // Reset all exercise form state
    setNewExerciseData({
      name: '',
      exercise_type: '',
      muscle_group: '',
      difficulty: 'intermediate',
      equipment: 'bodyweight',
      primary_muscles: [],
      secondary_muscles: [],
      instructions: '',
      calories_per_minute: '5.0',
      image_url: '',
    });
    setExerciseMediaFiles([]);
    setExerciseMediaPreviews([]);
    setExerciseToEdit(null);
    onCreateExerciseOpen();
  };

  const handleCloseCreateExercise = () => {
    // Reset state when closing
    setNewExerciseData({
      name: '',
      exercise_type: '',
      muscle_group: '',
      difficulty: 'intermediate',
      equipment: 'bodyweight',
      primary_muscles: [],
      secondary_muscles: [],
      instructions: '',
      calories_per_minute: '5.0',
      image_url: '',
    });
    setExerciseMediaFiles([]);
    setExerciseMediaPreviews([]);
    setExerciseToEdit(null);
    onCreateExerciseClose();
  };

  const handleNewExerciseChange = (e) => {
    setNewExerciseData({
      ...newExerciseData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = [];
    const newPreviews = [];

    files.forEach(file => {
      // Check if it's an image or video
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        newFiles.push(file);
        
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({
            url: reader.result,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            name: file.name
          });
          
          // Update state when all files are read
          if (newPreviews.length === files.length) {
            setExerciseMediaFiles(prev => [...prev, ...newFiles]);
            setExerciseMediaPreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeMedia = async (index) => {
    const preview = exerciseMediaPreviews[index];
    
    // If it's an existing media (from database), delete it via API
    if (preview.isExisting && preview.mediaId) {
      try {
        await workoutsService.deleteExerciseMedia(preview.mediaId);
        toast({
          title: 'メディアを削除しました',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Delete media error:', error);
        toast({
          title: '削除に失敗しました',
          description: error.response?.data?.detail || 'メディアの削除中にエラーが発生しました',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return; // Don't remove from UI if API call failed
      }
    }
    
    // Remove from state
    setExerciseMediaFiles(prev => prev.filter((_, i) => i !== index));
    setExerciseMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare data for backend
      const primaryMuscles = newExerciseData.muscle_group ? [newExerciseData.muscle_group] : [];
      
      // Use FormData if media files are selected
      let exerciseData;
      if (exerciseMediaFiles.length > 0) {
        exerciseData = new FormData();
        exerciseData.append('name', newExerciseData.name);
        exerciseData.append('description', `${newExerciseData.muscle_group}のエクササイズ`);
        exerciseData.append('exercise_type', newExerciseData.exercise_type);
        exerciseData.append('difficulty', newExerciseData.difficulty);
        exerciseData.append('equipment', newExerciseData.equipment);
        // Send primary_muscles as JSON string
        exerciseData.append('primary_muscles', JSON.stringify(primaryMuscles));
        // Send secondary_muscles as JSON string
        exerciseData.append('secondary_muscles', JSON.stringify(newExerciseData.secondary_muscles || []));
  exerciseData.append('instructions', newExerciseData.instructions);
        exerciseData.append('tips', '');
        exerciseData.append('calories_per_minute', parseFloat(newExerciseData.calories_per_minute) || 5.0);
        
        // Append all media files
        exerciseMediaFiles.forEach((file, index) => {
          if (file.type.startsWith('image/')) {
            exerciseData.append('images', file);
          } else if (file.type.startsWith('video/')) {
            exerciseData.append('videos', file);
          }
        });
        
        // Keep first image as main image for backward compatibility
        const firstImageFile = exerciseMediaFiles.find(f => f.type.startsWith('image/'));
        if (firstImageFile) {
          exerciseData.append('image', firstImageFile);
        }
      } else {
        exerciseData = {
          name: newExerciseData.name,
          description: `${newExerciseData.muscle_group}のエクササイズ`,
          exercise_type: newExerciseData.exercise_type,
          difficulty: newExerciseData.difficulty,
          equipment: newExerciseData.equipment,
          primary_muscles: primaryMuscles,
          secondary_muscles: newExerciseData.secondary_muscles,
          instructions: newExerciseData.instructions,
          tips: '',
          calories_per_minute: parseFloat(newExerciseData.calories_per_minute) || 5.0,
          image_url: newExerciseData.image_url || '',
        };
      }

      const response = await workoutsService.exercises.create(exerciseData);
      
      toast({
        title: 'エクササイズを作成しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      handleCloseCreateExercise();
      await loadData();
    } catch (error) {
      console.error('Exercise creation error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'エクササイズの作成に失敗しました';
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'object') {
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
        } else {
          errorMessage = errors.detail || JSON.stringify(errors);
        }
      }
      
      toast({
        title: 'エクササイズ作成エラー',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditExercise = (exercise) => {
    setExerciseToEdit(exercise);
    setNewExerciseData({
      name: exercise.name,
      exercise_type: exercise.exercise_type || 'strength',
      muscle_group: exercise.primary_muscles && exercise.primary_muscles.length > 0 ? exercise.primary_muscles[0] : '',
      difficulty: exercise.difficulty || 'intermediate',
      equipment: exercise.equipment || 'bodyweight',
      primary_muscles: exercise.primary_muscles || [],
      secondary_muscles: exercise.secondary_muscles || [],
      instructions: exercise.instructions || '',
      calories_per_minute: exercise.calories_per_minute?.toString() || '5.0',
      image_url: exercise.image_url || '',
    });
    
    // Load existing media as previews from media_files
    const existingPreviews = [];
    
    // Load from media_files (new multiple media system)
    if (exercise.media_files && exercise.media_files.length > 0) {
      exercise.media_files.forEach(media => {
        existingPreviews.push({
          url: getImageUrl(media.file),
          type: media.media_type,
          name: media.caption || `existing-${media.media_type}`,
          isExisting: true,
          mediaId: media.id
        });
      });
    } else if (exercise.image) {
      // Fallback to old single image field
      existingPreviews.push({
        url: getImageUrl(exercise.image),
        type: 'image',
        name: 'existing-image',
        isExisting: true
      });
    }
    
    setExerciseMediaPreviews(existingPreviews);
    setExerciseMediaFiles([]);
    onEditExerciseOpen();
  };

  const handleCloseEditExercise = () => {
    // Reset all form state
    setNewExerciseData({
      name: '',
      exercise_type: '',
      muscle_group: '',
      difficulty: 'intermediate',
      equipment: 'bodyweight',
      primary_muscles: [],
      secondary_muscles: [],
      instructions: '',
      calories_per_minute: '5.0',
      image_url: '',
    });
    setExerciseMediaFiles([]);
    setExerciseMediaPreviews([]);
    setExerciseToEdit(null);
    onEditExerciseClose();
  };

  const handleUpdateExercise = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const primaryMuscles = newExerciseData.muscle_group ? [newExerciseData.muscle_group] : [];
      
      let exerciseData;
      if (exerciseMediaFiles.length > 0) {
        exerciseData = new FormData();
        exerciseData.append('name', newExerciseData.name);
        exerciseData.append('description', `${newExerciseData.muscle_group}のエクササイズ`);
        exerciseData.append('exercise_type', newExerciseData.exercise_type);
        exerciseData.append('difficulty', newExerciseData.difficulty);
        exerciseData.append('equipment', newExerciseData.equipment);
        exerciseData.append('primary_muscles', JSON.stringify(primaryMuscles));
        exerciseData.append('secondary_muscles', JSON.stringify(newExerciseData.secondary_muscles || []));
  exerciseData.append('instructions', newExerciseData.instructions);
        exerciseData.append('tips', '');
        exerciseData.append('calories_per_minute', parseFloat(newExerciseData.calories_per_minute) || 5.0);
        
        // Append all media files
        exerciseMediaFiles.forEach((file, index) => {
          if (file.type.startsWith('image/')) {
            exerciseData.append('images', file);
          } else if (file.type.startsWith('video/')) {
            exerciseData.append('videos', file);
          }
        });
        
        // Keep first image as main image for backward compatibility
        const firstImageFile = exerciseMediaFiles.find(f => f.type.startsWith('image/'));
        if (firstImageFile) {
          exerciseData.append('image', firstImageFile);
        }
      } else {
        exerciseData = {
          name: newExerciseData.name,
          description: `${newExerciseData.muscle_group}のエクササイズ`,
          exercise_type: newExerciseData.exercise_type,
          difficulty: newExerciseData.difficulty,
          equipment: newExerciseData.equipment,
          primary_muscles: primaryMuscles,
          secondary_muscles: newExerciseData.secondary_muscles,
          instructions: newExerciseData.instructions,
          tips: '',
          calories_per_minute: parseFloat(newExerciseData.calories_per_minute) || 5.0,
          image_url: newExerciseData.image_url || '',
        };
      }

      await workoutsService.exercises.update(exerciseToEdit.id, exerciseData);
      
      toast({
        title: 'エクササイズを更新しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      handleCloseEditExercise();
      await loadData();
      setNewExerciseData({
        name: '',
        exercise_type: '',
        muscle_group: '',
        difficulty: 'intermediate',
        equipment: 'bodyweight',
        primary_muscles: [],
        secondary_muscles: [],
        instructions: '',
        calories_per_minute: '5.0',
        image_url: '',
      });
      setExerciseMediaFiles([]);
      setExerciseMediaPreviews([]);
    } catch (error) {
      console.error('Exercise update error:', error);
      
      let errorMessage = 'エクササイズの更新に失敗しました';
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'object') {
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
        } else {
          errorMessage = errors.detail || JSON.stringify(errors);
        }
      }
      
      toast({
        title: 'エクササイズ更新エラー',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditWorkout = (workout) => {
    console.log('Editing workout:', workout);
    console.log('Duration minutes:', workout.duration_minutes);
    console.log('Duration:', workout.duration);
    
    setWorkoutToEdit(workout);
    const durationValue = workout.duration_minutes || workout.duration || '';
    console.log('Setting duration value:', durationValue);
    
    setFormData({
      name: workout.name || '',
      date: workout.date || '',
      duration: String(durationValue),
      notes: workout.notes || '',
    });
    setSelectedExercises(workout.exercises?.map(ex => ({
      id: ex.exercise?.id || ex.exercise_id,
      name: ex.exercise?.name || ex.name,
      sets: ex.planned_sets || ex.sets || 3,
      reps: ex.planned_reps || ex.reps || 10,
      weight: ex.planned_weight_kg || ex.weight || 0,
    })) || []);
    onEditWorkoutOpen();
  };

  const handleUpdateWorkout = async (e) => {
    e.preventDefault();
    if (selectedExercises.length === 0) {
      toast({
        title: 'エクササイズが選択されていません',
        description: '少なくとも1つのエクササイズを追加してください',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);

    try {
      // Calculate total calories
      const totalCalories = calculateTotalCalories();
      
      const workoutData = {
        name: formData.name,
        date: formData.date,
        duration_minutes: parseInt(formData.duration) || 0,
        calories_burned: totalCalories,
        notes: formData.notes,
        exercises: selectedExercises.map((ex, index) => ({
          exercise_id: ex.id,
          order: index + 1,
          planned_sets: ex.sets || 3,
          planned_reps: ex.reps || 10,
          planned_weight_kg: ex.weight || 0,
        })),
      };

      await workoutsService.workouts.update(workoutToEdit.id, workoutData);
      toast({
        title: 'ワークアウトを更新しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onEditWorkoutClose();
      await loadData();
      setSelectedExercises([]);
      setWorkoutToEdit(null);
      setFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        duration: '',
        notes: '',
      });
    } catch (error) {
      console.error('Workout update error:', error);
      toast({
        title: 'ワークアウト更新エラー',
        description: error.response?.data?.detail || 'ワークアウトの更新に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenExerciseMedia = (exercise) => {
    setExerciseMediaView(exercise);
    setCurrentMediaIndex(0);
    onExerciseMediaOpen();
  };

  const handleNextMedia = () => {
    if (exerciseMediaView && exerciseMediaView.media_files) {
      setCurrentMediaIndex((prev) => 
        prev < exerciseMediaView.media_files.length - 1 ? prev + 1 : 0
      );
    }
  };

  const handlePrevMedia = () => {
    if (exerciseMediaView && exerciseMediaView.media_files) {
      setCurrentMediaIndex((prev) => 
        prev > 0 ? prev - 1 : exerciseMediaView.media_files.length - 1
      );
    }
  };

  const handleDeleteWorkout = async () => {
    if (!workoutToDelete) return;
    
    setSubmitting(true);
    try {
      await workoutsService.workouts.delete(workoutToDelete.id);
      
      toast({
        title: 'ワークアウトを削除しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setWorkoutToDelete(null);
      onDeleteWorkoutClose();
      await loadData();
    } catch (error) {
      console.error('Delete workout error:', error);
      toast({
        title: '削除に失敗しました',
        description: error.response?.data?.detail || 'もう一度お試しください',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCreatePlan = () => {
    setNewPlanData({
      name: '',
      description: '',
      goal: '',
      difficulty: '',
      duration_weeks: '',
      days_per_week: '',
      overview: '',
      requirements: '',
    });
    onCreatePlanOpen();
  };

  const handleNewPlanChange = (e) => {
    const { name, value } = e.target;
    setNewPlanData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartPlan = async () => {
    if (!planToStart) return;
    
    // Check if there's already an active schedule
    if (activeSchedule) {
      const activePlan = activeSchedule.workout_plan;
      const activeEndDate = new Date(activeSchedule.start_date);
      activeEndDate.setDate(activeEndDate.getDate() + (activePlan.duration_weeks * 7));
      
      const newStartDate = new Date(planStartDate);
      const newEndDate = new Date(planStartDate);
      newEndDate.setDate(newEndDate.getDate() + (planToStart.duration_weeks * 7));
      
      // Check for overlap
      const activeStart = new Date(activeSchedule.start_date);
      if ((newStartDate >= activeStart && newStartDate < activeEndDate) ||
          (newEndDate > activeStart && newEndDate <= activeEndDate) ||
          (newStartDate <= activeStart && newEndDate >= activeEndDate)) {
        toast({
          title: '期間が重複しています',
          description: `現在「${activePlan.name}」が実行中です（${activeSchedule.start_date} 〜 ${activeEndDate.toISOString().split('T')[0]}）。先に既存のプログラムを完了または終了してください。`,
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        return;
      }
    }
    
    setSubmitting(true);
    try {
      await workoutsService.workoutPlans.schedule(planToStart.id, planStartDate);
      
      toast({
        title: 'プランを開始しました',
        description: `「${planToStart.name}」を${planStartDate}から開始します`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setPlanToStart(null);
      onStartPlanClose();
      await loadData();
    } catch (error) {
      console.error('Start plan error:', error);
      toast({
        title: 'プラン開始エラー',
        description: error.response?.data?.detail || 'プランの開始に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const planData = {
        ...newPlanData,
        duration_weeks: parseInt(newPlanData.duration_weeks),
        days_per_week: parseInt(newPlanData.days_per_week),
      };

      await workoutsService.workoutPlans.create(planData);
      
      toast({
        title: 'ワークアウトプランを作成しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onCreatePlanClose();
      await loadData();
    } catch (error) {
      console.error('Plan creation error:', error);
      
      let errorMessage = 'プランの作成に失敗しました';
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'object') {
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
        } else {
          errorMessage = errors.detail || JSON.stringify(errors);
        }
      }
      
      toast({
        title: 'プラン作成エラー',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedExercises.length === 0) {
      toast({
        title: 'エクササイズが選択されていません',
        description: '少なくとも1つのエクササイズを追加してください',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);

    try {
      // Calculate total calories
      const totalCalories = calculateTotalCalories();
      
      // Prepare workout data for backend
      const workoutData = {
        name: formData.name,
        date: formData.date,
        duration_minutes: parseInt(formData.duration) || 0,
        calories_burned: totalCalories,
        notes: formData.notes,
        exercises: selectedExercises.map((ex, index) => ({
          exercise_id: ex.id,
          order: index + 1,
          planned_sets: ex.sets || 3,
          planned_reps: ex.reps || 10,
          planned_weight_kg: ex.weight || 0,
        })),
      };

      console.log('Sending workout data:', workoutData);
      
      await workoutsService.workouts.create(workoutData);
      toast({
        title: 'ワークアウトを記録しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      await loadData();
      setSelectedExercises([]);
      setFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        duration: '',
        notes: '',
      });
    } catch (error) {
      console.error('Workout creation error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'ワークアウトの記録に失敗しました';
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'object') {
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
        } else {
          errorMessage = errors.detail || JSON.stringify(errors);
        }
      }
      
      toast({
        title: 'ワークアウト記録エラー',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const todayWorkouts = workouts.filter(workout =>
    workout.date === new Date().toISOString().split('T')[0]
  );

  const thisWeekWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return workoutDate >= weekAgo && workoutDate <= today;
  });

  const totalDuration = thisWeekWorkouts.reduce((total, workout) => total + (workout.duration_minutes || workout.duration || 0), 0);
  const totalCalories = thisWeekWorkouts.reduce((total, workout) => {
    const calories = Number(workout.total_calories_burned || workout.calories_burned || 0);
    return total + (isNaN(calories) ? 0 : calories);
  }, 0);

  const weekDays = getWeekDays(currentWeekStart);
  const dayNames = ['月', '火', '水', '木', '金', '土', '日'];

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedDateWorkouts = workouts.filter(workout => workout.date === selectedDateStr);

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const navigateWeek = (direction) => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + (direction * 7));
    setCurrentWeekStart(newWeekStart);
  };

  const getWorkoutForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return workouts.filter(w => w.date === dateStr);
  };

  const getExerciseColor = (index) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'red', 'teal', 'cyan'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Heading size="lg" mb={2}>ワークアウト計画</Heading>
            <Text color="gray.600">フィットネスの旅を計画して追跡</Text>
          </Box>
          <HStack spacing={3}>
            <Button
              variant="outline"
              colorScheme="brand"
              onClick={() => setActiveTab(2)}
            >
              <Icon as={FiList} mr={2} />
              プランを見る
            </Button>
            <Button colorScheme="brand" onClick={handleOpenWorkoutModal}>
              <Icon as={FiPlus} mr={2} />
              ワークアウトを作成
            </Button>
          </HStack>
        </Flex>

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab} colorScheme="brand">
          <TabList>
            <Tab>スケジュール</Tab>
            <Tab>エクササイズライブラリ</Tab>
            <Tab>ワークアウトプラン</Tab>
            <Tab>履歴</Tab>
          </TabList>
        </Tabs>
      </Box>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        {/* Main Content */}
        <Box>
          {activeTab === 0 && (
            <VStack spacing={6} align="stretch">
              {/* Week Navigation */}
              <Card bg={bgColor}>
                <CardBody>
                  <Flex justify="space-between" align="center" mb={4}>
                    <IconButton
                      icon={<FiChevronLeft />}
                      variant="ghost"
                      onClick={() => navigateWeek(-1)}
                      aria-label="前の週"
                    />
                    <Heading size="md">
                      {currentWeekStart.getFullYear()}年{currentWeekStart.getMonth() + 1}月
                      {currentWeekStart.getDate()}日〜{weekDays[6].getDate()}日の週
                    </Heading>
                    <IconButton
                      icon={<FiChevronRight />}
                      variant="ghost"
                      onClick={() => navigateWeek(1)}
                      aria-label="次の週"
                    />
                  </Flex>

                  {/* Days Grid */}
                  <Grid templateColumns="repeat(7, 1fr)" gap={2}>
                    {dayNames.map((day, idx) => (
                      <Box key={idx} textAlign="center" fontSize="sm" fontWeight="semibold" color="gray.600" py={2}>
                        {day}
                      </Box>
                    ))}
                    {weekDays.map((date, idx) => {
                      const dayWorkouts = getWorkoutForDate(date);
                      const isTodayDate = isToday(date);
                      const isSelected = isSelectedDate(date);

                      return (
                        <Box
                          key={idx}
                          bg={isSelected ? 'brand.100' : dayWorkouts.length > 0 ? 'green.50' : hoverBg}
                          border={isSelected ? '2px solid' : dayWorkouts.length > 0 ? '2px solid' : 'none'}
                          borderColor={isSelected ? 'brand.500' : 'green.500'}
                          borderRadius="lg"
                          p={3}
                          textAlign="center"
                          cursor="pointer"
                          _hover={{ bg: isSelected ? 'brand.100' : 'gray.100' }}
                          onClick={() => setSelectedDate(date)}
                        >
                          <Text fontSize="sm" fontWeight="semibold" color={isSelected ? 'brand.600' : 'gray.900'}>
                            {date.getDate()}
                          </Text>
                          {isTodayDate ? (
                            <>
                              <Icon as={FiActivity} color="brand.500" boxSize={4} mt={1} />
                              <Text fontSize="xs" color="brand.600" fontWeight="semibold" mt={1}>
                                今日
                              </Text>
                            </>
                          ) : dayWorkouts.length > 0 ? (
                            <>
                              <Icon as={FiCheck} color="green.600" boxSize={4} mt={1} />
                              <Text fontSize="xs" color="green.600" mt={1}>
                                {dayWorkouts[0].name.substring(0, 6)}
                              </Text>
                            </>
                          ) : (
                            <Text fontSize="xs" color="gray.400" mt={1}>
                              休息
                            </Text>
                          )}
                        </Box>
                      );
                    })}
                  </Grid>
                </CardBody>
              </Card>

              {/* Today's Workout */}
              <Card bg={bgColor}>
                <CardBody>
                  <Flex justify="space-between" align="center" mb={6}>
                    <Box>
                      <Heading size="md" mb={1}>
                        {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日のワークアウト
                      </Heading>
                      <Text fontSize="sm" color="gray.600">
                        {selectedDateWorkouts.length > 0 ? selectedDateWorkouts[0].name : 'ワークアウトが計画されていません'}
                      </Text>
                    </Box>
                    {selectedDateWorkouts.length > 0 && (
                      <Button colorScheme="green" leftIcon={<FiPlay />}>
                        ワークアウトを開始
                      </Button>
                    )}
                  </Flex>

                  {selectedDateWorkouts.length > 0 ? (
                    <>
                      {/* Workout Info */}
                      <SimpleGrid columns={3} spacing={4} mb={6} p={4} bg={hoverBg} borderRadius="lg">
                        <VStack>
                          <Icon as={FiClock} color="brand.600" boxSize={5} />
                          <Text fontSize="sm" color="gray.600">時間</Text>
                          <Text fontWeight="bold">{selectedDateWorkouts[0].duration_minutes || selectedDateWorkouts[0].duration || 0}分</Text>
                        </VStack>
                        <VStack>
                          <Icon as={FiActivity} color="orange.600" boxSize={5} />
                          <Text fontSize="sm" color="gray.600">推定カロリー</Text>
                          <Text fontWeight="bold">{selectedDateWorkouts[0].total_calories_burned || selectedDateWorkouts[0].calories_burned || 0} kcal</Text>
                        </VStack>
                        <VStack>
                          <Icon as={FiList} color="purple.600" boxSize={5} />
                          <Text fontSize="sm" color="gray.600">エクササイズ</Text>
                          <Text fontWeight="bold">{selectedDateWorkouts[0].exercises?.length || 0}種目</Text>
                        </VStack>
                      </SimpleGrid>

                      {/* Exercise List */}
                      <VStack spacing={4} align="stretch">
                        {selectedDateWorkouts[0].exercises?.map((exercise, idx) => (
                          <Box
                            key={idx}
                            borderLeft="4px solid"
                            borderColor={`${getExerciseColor(idx)}.500`}
                            bg={hoverBg}
                            borderRadius="lg"
                            p={4}
                          >
                            <Flex align="start" justify="space-between">
                              <Flex align="start" flex="1">
                                <Box
                                  bg={`${getExerciseColor(idx)}.500`}
                                  color="white"
                                  borderRadius="full"
                                  w={8}
                                  h={8}
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  fontWeight="bold"
                                  mr={4}
                                >
                                  {idx + 1}
                                </Box>
                                <Box flex="1">
                                  <Heading size="sm" mb={1}>
                                    {exercise.exercise?.name || exercise.name || 'エクササイズ'}
                                  </Heading>
                                  <Text fontSize="sm" color="gray.600" mb={2}>
                                    {exercise.exercise?.primary_muscles?.[0] || exercise.muscle_group || 'コンパウンド'}
                                  </Text>
                                  <HStack spacing={4} fontSize="sm">
                                    <Badge colorScheme="gray">
                                      <Icon as={FiActivity} mr={1} />
                                      {exercise.planned_sets || exercise.sets || 0}セット
                                    </Badge>
                                    <Badge colorScheme="gray">
                                      #{exercise.planned_reps || exercise.reps || 0}回
                                    </Badge>
                                    <Badge colorScheme="gray">
                                      {exercise.planned_weight_kg || exercise.weight || 0} kg
                                    </Badge>
                                  </HStack>
                                </Box>
                              </Flex>
                              <IconButton
                                icon={<FiInfo />}
                                variant="ghost"
                                colorScheme={getExerciseColor(idx)}
                                aria-label="詳細"
                                onClick={() => handleOpenExerciseMedia(exercise.exercise || exercise)}
                              />
                            </Flex>
                          </Box>
                        ))}
                      </VStack>

                      {/* Action Buttons */}
                      <HStack spacing={3} mt={6}>
                        <Button flex="1" colorScheme="brand" leftIcon={<FiPlay />}>
                          ワークアウトを開始
                        </Button>
                        <IconButton 
                          icon={<FiEdit />} 
                          aria-label="編集" 
                          onClick={() => handleEditWorkout(selectedDateWorkouts[0])}
                        />
                        <IconButton 
                          icon={<FiTrash2 />} 
                          colorScheme="red" 
                          variant="ghost" 
                          aria-label="削除" 
                          onClick={() => {
                            setWorkoutToDelete(selectedDateWorkouts[0]);
                            onDeleteWorkoutOpen();
                          }}
                        />
                      </HStack>
                    </>
                  ) : (
                    <Center py={12}>
                      <VStack spacing={4}>
                        <Icon as={FiActivity} boxSize={16} color="gray.300" />
                        <Text color="gray.600" fontWeight="medium" fontSize="lg">
                          ワークアウトが計画されていません
                        </Text>
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          「ワークアウトを作成」ボタンから新しいワークアウトを追加しましょう
                        </Text>
                        <Button colorScheme="brand" onClick={handleOpenWorkoutModal} mt={2}>
                          <Icon as={FiPlus} mr={2} />
                          ワークアウトを作成
                        </Button>
                      </VStack>
                    </Center>
                  )}
                </CardBody>
              </Card>
            </VStack>
          )}

          {activeTab === 1 && (
            <Card bg={bgColor}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">エクササイズライブラリ</Heading>
                  <Button
                    size="sm"
                    colorScheme="brand"
                    leftIcon={<FiPlus />}
                    onClick={handleOpenCreateExercise}
                  >
                    エクササイズを追加
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                {exercises.length > 0 ? (
                  <VStack spacing={2} align="stretch">
                    {exercises.map((exercise) => {
                      // Debug log
                      if (exercise.is_custom) {
                        console.log('Custom Exercise:', exercise.name, 'ID:', exercise.id, 'is_custom:', exercise.is_custom);
                      }
                      return (
                      <Box
                        key={exercise.id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="lg"
                        _hover={{ bg: hoverBg }}
                      >
                        <Flex justify="space-between" align="center" gap={3}>
                          {/* Exercise Image */}
                          <Box flexShrink={0}>
                            {(exercise.image || exercise.image_url) ? (
                              <Box position="relative" boxSize="60px">
                                <Image
                                  src={getImageUrl(exercise.image) || exercise.image_url}
                                  alt={exercise.name}
                                  boxSize="60px"
                                  objectFit="cover"
                                  borderRadius="md"
                                  fallback={
                                    <Box
                                      boxSize="60px"
                                      bg="gray.100"
                                      borderRadius="md"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <Icon as={FiImage} color="gray.400" boxSize={6} />
                                    </Box>
                                  }
                                />
                              </Box>
                            ) : (
                              <Box
                                boxSize="60px"
                                bg="gray.100"
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Icon as={FiImage} color="gray.400" boxSize={6} />
                              </Box>
                            )}
                          </Box>
                          
                          {/* Exercise Info */}
                          <Box flex="1">
                            <Text fontWeight="medium" fontSize="sm">{exercise.name}</Text>
                            <Text fontSize="xs" color="gray.600">
                              {exercise.primary_muscles && Array.isArray(exercise.primary_muscles) && exercise.primary_muscles.length > 0 
                                ? exercise.primary_muscles.join(', ') 
                                : 'その他'} • {exercise.equipment || '自重'}
                            </Text>
                            {exercise.description && (
                              <Text fontSize="xs" color="gray.500" mt={1} noOfLines={1}>
                                {exercise.description}
                              </Text>
                            )}
                          </Box>
                          
                          {/* Actions */}
                          <HStack spacing={2} ml={2} flexShrink={0}>
                            <Badge 
                              colorScheme={
                                exercise.difficulty === 'beginner' ? 'green' : 
                                exercise.difficulty === 'intermediate' ? 'yellow' : 'red'
                              }
                            >
                              {exercise.difficulty === 'beginner' ? '初級' : 
                               exercise.difficulty === 'intermediate' ? '中級' : '上級'}
                            </Badge>
                            {exercise.is_custom && (
                              <>
                                <IconButton
                                  icon={<FiEdit />}
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  aria-label="編集"
                                  onClick={() => handleEditExercise(exercise)}
                                />
                                <IconButton
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  aria-label="削除"
                                  onClick={() => {
                                    setExerciseToDelete(exercise);
                                    onDeleteExerciseOpen();
                                  }}
                                />
                              </>
                            )}
                          </HStack>
                        </Flex>
                      </Box>
                    )})}
                  </VStack>
                ) : (
                  <Center py={12}>
                    <VStack spacing={4}>
                      <Icon as={FiActivity} boxSize={12} color="gray.300" />
                      <Text color="gray.500">エクササイズが見つかりません</Text>
                      <Button
                        colorScheme="brand"
                        size="sm"
                        leftIcon={<FiPlus />}
                        onClick={handleOpenCreateExercise}
                      >
                        最初のエクササイズを追加
                      </Button>
                    </VStack>
                  </Center>
                )}
              </CardBody>
            </Card>
          )}

          {activeTab === 2 && (
            <VStack spacing={6} align="stretch">
              {/* Header with Create Button */}
              <Card bg={bgColor}>
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Heading size="md">ワークアウトプラン</Heading>
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        体系的なトレーニングプログラムで目標を達成
                      </Text>
                    </Box>
                    <Button
                      colorScheme="brand"
                      leftIcon={<FiPlus />}
                      onClick={handleOpenCreatePlan}
                    >
                      プランを作成
                    </Button>
                  </Flex>
                </CardHeader>
              </Card>

              {/* Plans Grid */}
              {plans.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {plans.map((plan) => (
                    <Card
                      key={plan.id}
                      bg={bgColor}
                      borderWidth="2px"
                      borderColor={selectedPlan?.id === plan.id ? "brand.500" : borderColor}
                      cursor="pointer"
                      _hover={{ borderColor: "brand.400", shadow: "md" }}
                      onClick={() => setSelectedPlan(plan)}
                      transition="all 0.2s"
                    >
                      <CardBody>
                        {/* Plan Header */}
                        <Flex justify="space-between" align="start" mb={3}>
                          <Box flex="1">
                            <Flex align="center" gap={2} mb={2}>
                              <Heading size="md">{plan.name}</Heading>
                              {selectedPlan?.id === plan.id && (
                                <Badge colorScheme="brand" fontSize="xs">
                                  選択中
                                </Badge>
                              )}
                              {plan.is_scheduled && (
                                <Badge colorScheme="green" fontSize="xs">
                                  アクティブ
                                </Badge>
                              )}
                            </Flex>
                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                              {plan.description}
                            </Text>
                          </Box>
                        </Flex>

                        {/* Plan Stats */}
                        <SimpleGrid columns={3} spacing={3} mb={3}>
                          <Stat size="sm" bg={hoverBg} p={2} borderRadius="md">
                            <StatLabel fontSize="xs">期間</StatLabel>
                            <StatNumber fontSize="md">{plan.duration_weeks}週</StatNumber>
                          </Stat>
                          <Stat size="sm" bg={hoverBg} p={2} borderRadius="md">
                            <StatLabel fontSize="xs">頻度</StatLabel>
                            <StatNumber fontSize="md">週{plan.days_per_week}日</StatNumber>
                          </Stat>
                          <Stat size="sm" bg={hoverBg} p={2} borderRadius="md">
                            <StatLabel fontSize="xs">難易度</StatLabel>
                            <StatNumber fontSize="md">
                              <Badge
                                colorScheme={
                                  plan.difficulty === 'beginner' ? 'green' :
                                  plan.difficulty === 'intermediate' ? 'yellow' : 'red'
                                }
                              >
                                {plan.difficulty === 'beginner' ? '初級' :
                                 plan.difficulty === 'intermediate' ? '中級' : '上級'}
                              </Badge>
                            </StatNumber>
                          </Stat>
                        </SimpleGrid>

                        {/* Goal Badge */}
                        <HStack spacing={2} mb={3}>
                          <Badge colorScheme="purple">
                            目標: {plan.goal === 'weight_loss' ? '減量' :
                                  plan.goal === 'muscle_gain' ? '筋肉増強' :
                                  plan.goal === 'strength' ? '筋力向上' :
                                  plan.goal === 'endurance' ? '持久力' : '総合フィットネス'}
                          </Badge>
                          {plan.total_days > 0 && (
                            <Badge colorScheme="blue">
                              {plan.total_days}日分のプラン
                            </Badge>
                          )}
                        </HStack>

                        {/* Action Buttons */}
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="brand"
                            flex="1"
                            leftIcon={<FiPlay />}
                            isDisabled={activeSchedule && activeSchedule.workout_plan?.id !== plan.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeSchedule && activeSchedule.workout_plan?.id !== plan.id) {
                                toast({
                                  title: '既存のプログラムが実行中',
                                  description: `「${activeSchedule.workout_plan.name}」が実行中です。先に完了または終了してください。`,
                                  status: 'warning',
                                  duration: 4000,
                                  isClosable: true,
                                });
                                return;
                              }
                              setPlanToStart(plan);
                              setPlanStartDate(new Date().toISOString().split('T')[0]);
                              onStartPlanOpen();
                            }}
                          >
                            プラン開始
                          </Button>
                          <IconButton
                            size="sm"
                            icon={<FiInfo />}
                            variant="ghost"
                            aria-label="詳細"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlan(plan);
                            }}
                          />
                          {plan.is_custom && (
                            <IconButton
                              size="sm"
                              icon={<FiTrash2 />}
                              colorScheme="red"
                              variant="ghost"
                              aria-label="削除"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlanToDelete(plan);
                                onDeletePlanOpen();
                              }}
                            />
                          )}
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
                <Card bg={bgColor}>
                  <CardBody>
                    <Center py={12}>
                      <VStack spacing={4}>
                        <Icon as={FiList} boxSize={16} color="gray.300" />
                        <Heading size="md" color="gray.500">プランがありません</Heading>
                        <Text fontSize="sm" color="gray.500" textAlign="center" maxW="md">
                          ワークアウトプランは、体系的なトレーニングプログラムです。
                          目標に応じた構造化されたエクササイズスケジュールを作成できます。
                        </Text>
                        <Button
                          colorScheme="brand"
                          leftIcon={<FiPlus />}
                          onClick={handleOpenCreatePlan}
                        >
                          最初のプランを作成
                        </Button>
                      </VStack>
                    </Center>
                  </CardBody>
                </Card>
              )}

              {/* Selected Plan Details */}
              {selectedPlan && (
                <Card bg={bgColor} borderWidth="2px" borderColor="brand.200">
                  <CardBody>
                    <Flex justify="space-between" align="start" mb={4}>
                      <Box>
                        <Heading size="md" mb={2}>{selectedPlan.name}</Heading>
                        <Text color="gray.600" mb={3}>{selectedPlan.description}</Text>
                      </Box>
                      <CloseButton onClick={() => setSelectedPlan(null)} />
                    </Flex>

                    <Divider mb={4} />

                    {/* Overview Section */}
                    <Box mb={4}>
                      <Heading size="sm" mb={2}>プラン概要</Heading>
                      <Text fontSize="sm" color="gray.700" whiteSpace="pre-line">
                        {selectedPlan.overview || 'このプランの詳細な説明はまだありません。'}
                      </Text>
                    </Box>

                    {/* Requirements Section */}
                    <Box mb={4}>
                      <Heading size="sm" mb={2}>必要な器具・前提条件</Heading>
                      <Text fontSize="sm" color="gray.700" whiteSpace="pre-line">
                        {selectedPlan.requirements || '特になし'}
                      </Text>
                    </Box>

                    {/* Plan Days Preview */}
                    {selectedPlan.plan_days && selectedPlan.plan_days.length > 0 && (
                      <Box>
                        <Heading size="sm" mb={3}>トレーニングスケジュール</Heading>
                        <VStack spacing={2} align="stretch">
                          {selectedPlan.plan_days.slice(0, 7).map((day) => (
                            <Box
                              key={day.id}
                              p={3}
                              bg={day.rest_day ? 'gray.50' : hoverBg}
                              borderRadius="md"
                              borderLeft="4px solid"
                              borderColor={day.rest_day ? 'gray.400' : 'brand.500'}
                            >
                              <Flex justify="space-between" align="center">
                                <Box flex="1">
                                  <Text fontWeight="bold" fontSize="sm">
                                    Day {day.day_number}: {day.name}
                                  </Text>
                                  {day.description && (
                                    <Text fontSize="xs" color="gray.600" mt={1}>
                                      {day.description}
                                    </Text>
                                  )}
                                  {!day.rest_day && (
                                    <Badge mt={2} colorScheme="blue" fontSize="xs">
                                      {day.exercise_count || 0}種目
                                    </Badge>
                                  )}
                                </Box>
                                {day.rest_day && (
                                  <Badge colorScheme="gray">休息日</Badge>
                                )}
                              </Flex>
                            </Box>
                          ))}
                          {selectedPlan.plan_days.length > 7 && (
                            <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
                              ... 他{selectedPlan.plan_days.length - 7}日分
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <HStack spacing={3} mt={6}>
                      <Button
                        colorScheme="brand"
                        flex="1"
                        leftIcon={<FiPlay />}
                        onClick={() => {
                          setPlanToStart(selectedPlan);
                          setPlanStartDate(new Date().toISOString().split('T')[0]);
                          onStartPlanOpen();
                        }}
                      >
                        このプランを開始
                      </Button>
                      {selectedPlan.is_custom && (
                        <Button
                          colorScheme="red"
                          variant="outline"
                          leftIcon={<FiTrash2 />}
                          onClick={() => {
                            setPlanToDelete(selectedPlan);
                            onDeletePlanOpen();
                          }}
                        >
                          削除
                        </Button>
                      )}
                    </HStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          )}

          {activeTab === 3 && (
            <Card bg={bgColor}>
              <CardHeader>
                <Heading size="md">ワークアウト履歴</Heading>
              </CardHeader>
              <CardBody>
                {workouts.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {workouts.map((workout) => (
                      <Box key={workout.id} p={4} borderWidth="1px" borderRadius="lg">
                        <HStack justify="space-between" mb={2}>
                          <Heading size="sm">{workout.name}</Heading>
                          <Badge colorScheme="brand">{formatDate(workout.date)}</Badge>
                        </HStack>
                        <HStack spacing={4} fontSize="sm" color="gray.600">
                          <HStack>
                            <Icon as={FiClock} />
                            <Text>{workout.duration_minutes || workout.duration || 0} 分</Text>
                          </HStack>
                          <HStack>
                            <Icon as={FiActivity} />
                            <Text>{workout.exercises?.length || 0} 種目</Text>
                          </HStack>
                          <HStack>
                            <Icon as={FiCheck} />
                            <Text>{workout.total_calories_burned || workout.calories_burned || 0} kcal</Text>
                          </HStack>
                        </HStack>
                        {workout.notes && (
                          <Text fontSize="sm" color="gray.600" mt={2}>
                            {workout.notes}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Center py={12}>
                    <VStack>
                      <Icon as={FiActivity} boxSize={12} color="gray.300" />
                      <Text color="gray.500">まだワークアウトが記録されていません</Text>
                      <Button colorScheme="brand" size="sm" onClick={handleOpenWorkoutModal} mt={2}>
                        最初のワークアウトを記録
                      </Button>
                    </VStack>
                  </Center>
                )}
              </CardBody>
            </Card>
          )}
        </Box>

        {/* Sidebar */}
        <VStack spacing={6} align="stretch">
          {/* Weekly Stats */}
          <Card bg={bgColor}>
            <CardHeader>
              <Heading size="md">今週</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.700">完了したワークアウト</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {thisWeekWorkouts.length} / 5
                    </Text>
                  </Flex>
                  <Progress
                    value={(thisWeekWorkouts.length / 5) * 100}
                    colorScheme="green"
                    size="sm"
                    borderRadius="full"
                  />
                </Box>
                <Divider />
                <Box>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.700">合計時間</Text>
                    <Text fontSize="sm" fontWeight="bold">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</Text>
                  </Flex>
                </Box>
                <Box>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.700">消費カロリー</Text>
                    <Text fontSize="sm" fontWeight="bold">{Math.round(totalCalories).toLocaleString()} kcal</Text>
                  </Flex>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Active Workout Program */}
          <Card bg={bgColor} borderWidth="2px" borderColor="purple.200">
            <CardHeader pb={2}>
              <Flex align="center" gap={2}>
                <Icon as={FiStar} color="purple.500" />
                <Heading size="sm">アクティブプログラム</Heading>
              </Flex>
            </CardHeader>
            <CardBody pt={2}>
              {activeSchedule && activeSchedule.workout_plan ? (() => {
                const plan = activeSchedule.workout_plan;
                const startDate = new Date(activeSchedule.start_date);
                const today = new Date();
                const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
                const weeksPassed = Math.floor(daysPassed / 7);
                const totalWeeks = plan.duration_weeks || 12;
                const progressPercentage = Math.min((weeksPassed / totalWeeks) * 100, 100);
                
                // Calculate this week's workouts
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                
                const thisWeekWorkouts = workouts.filter(w => {
                  const workoutDate = new Date(w.date);
                  return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
                });
                const completedThisWeek = thisWeekWorkouts.filter(w => w.completed).length;
                const daysPerWeek = plan.days_per_week || 5;
                
                return (
                  <Box>
                    <Box
                      p={4}
                      bgGradient="linear(to-r, purple.50, pink.50)"
                      borderRadius="lg"
                      mb={3}
                    >
                      <Flex align="start" justify="space-between" mb={2}>
                        <Box flex="1">
                          <Heading size="xs" mb={1}>{plan.name}</Heading>
                          <Text fontSize="xs" color="gray.600" noOfLines={2}>
                            {plan.description}
                          </Text>
                        </Box>
                        <Badge colorScheme="green" fontSize="xs">実行中</Badge>
                      </Flex>
                      
                      <VStack spacing={1} mb={3} align="stretch">
                        <HStack spacing={2} fontSize="xs" color="gray.600">
                          <Text>週{plan.days_per_week}日</Text>
                          <Text>•</Text>
                          <Text>{plan.duration_weeks}週間</Text>
                        </HStack>
                        <HStack spacing={2} fontSize="xs" color="gray.600">
                          <Text>開始: {new Date(activeSchedule.start_date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                        </HStack>
                        <HStack spacing={2} fontSize="xs" color="gray.600">
                          <Text>終了日: {(() => {
                            const endDate = new Date(activeSchedule.start_date);
                            endDate.setDate(endDate.getDate() + (plan.duration_weeks * 7));
                            return endDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
                          })()}</Text>
                        </HStack>
                      </VStack>

                      {/* Progress bar */}
                      <Box>
                        <Flex justify="space-between" mb={1}>
                          <Text fontSize="xs" fontWeight="medium">進捗状況</Text>
                          <Text fontSize="xs" color="gray.600">{weeksPassed} / {totalWeeks} 週</Text>
                        </Flex>
                        <Progress value={progressPercentage} colorScheme="purple" size="sm" borderRadius="full" />
                      </Box>
                    </Box>

                    {/* Quick Stats */}
                    <SimpleGrid columns={2} spacing={2} mb={3}>
                      <Box bg={hoverBg} p={2} borderRadius="md" textAlign="center">
                        <Text fontSize="xs" color="gray.600">今週</Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.600">{completedThisWeek}/{daysPerWeek}</Text>
                        <Text fontSize="xs" color="gray.500">完了</Text>
                      </Box>
                      <Box bg={hoverBg} p={2} borderRadius="md" textAlign="center">
                        <Text fontSize="xs" color="gray.600">達成率</Text>
                        <Text fontSize="lg" fontWeight="bold" color="purple.600">
                          {daysPerWeek > 0 ? Math.round((completedThisWeek / daysPerWeek) * 100) : 0}%
                        </Text>
                        <Text fontSize="xs" color="gray.500">継続中</Text>
                      </Box>
                    </SimpleGrid>

                    <Button
                      variant="outline"
                      colorScheme="purple"
                      size="sm"
                      w="full"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setActiveTab(2);
                      }}
                    >
                      プログラム詳細を見る
                    </Button>
                  </Box>
                );
              })() : (
                <Box textAlign="center" py={4}>
                  <Icon as={FiList} boxSize={8} color="gray.300" mb={2} />
                  <Text fontSize="sm" color="gray.500" mb={3}>
                    アクティブなプログラムなし
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="purple"
                    variant="outline"
                    onClick={() => setActiveTab(2)}
                  >
                    プログラムを選択
                  </Button>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* AI Recommendations */}
          <Box
            bgGradient="linear(to-br, purple.600, pink.500)"
            borderRadius="xl"
            shadow="lg"
            p={6}
            color="white"
          >
            <HStack mb={4}>
              <Icon as={FiStar} boxSize={6} />
              <Heading size="md">AIコーチ</Heading>
            </HStack>
            <VStack spacing={3} align="stretch">
              <Box bg="whiteAlpha.300" borderRadius="lg" p={3} backdropFilter="blur(10px)">
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  💪 素晴らしい進歩！
                </Text>
                <Text fontSize="xs" opacity={0.95}>
                  今月スクワットの筋力が10%向上しました。この調子で頑張りましょう！
                </Text>
              </Box>
              <Box bg="whiteAlpha.300" borderRadius="lg" p={3} backdropFilter="blur(10px)">
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  🎯 提案
                </Text>
                <Text fontSize="xs" opacity={0.95}>
                  全体的な安定性を向上させるために、コアエクササイズを増やしましょう。
                </Text>
              </Box>
              <Box bg="whiteAlpha.300" borderRadius="lg" p={3} backdropFilter="blur(10px)">
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  ⚡ 回復のヒント
                </Text>
                <Text fontSize="xs" opacity={0.95}>
                  明日は休息日を検討してください。体には回復が必要です。
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Grid>

      {/* Log Workout Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>ワークアウトを記録</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Tabs>
                <TabList>
                  <Tab>ワークアウトの詳細</Tab>
                  <Tab>エクササイズを追加</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>ワークアウト名</FormLabel>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="例: 上半身トレーニング"
                        />
                      </FormControl>

                      <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                        <FormControl isRequired>
                          <FormLabel>日付</FormLabel>
                          <Input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>時間 (分)</FormLabel>
                          <Input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="45"
                          />
                        </FormControl>
                      </Grid>

                      <FormControl>
                        <FormLabel>メモ</FormLabel>
                        <Textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="体調や気づいたことを記録..."
                        />
                      </FormControl>

                      {/* Selected Exercises */}
                      <Box w="full">
                        <Heading size="sm" mb={3}>選択したエクササイズ ({selectedExercises.length})</Heading>
                        {selectedExercises.length > 0 ? (
                          <VStack spacing={2} align="stretch">
                            {selectedExercises.map((exercise, index) => (
                              <VStack key={index} p={3} bg="gray.50" borderRadius="md" align="stretch" spacing={2}>
                                <HStack justify="space-between">
                                  <Text fontWeight="medium" fontSize="sm">{exercise.name}</Text>
                                  <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleExerciseRemove(index)}>
                                    ×
                                  </Button>
                                </HStack>
                                <HStack spacing={2}>
                                  <VStack align="stretch" flex="1" spacing={1}>
                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">セット数</Text>
                                    <Input
                                      type="number"
                                      size="sm"
                                      value={exercise.sets}
                                      onChange={(e) => handleExerciseUpdate(index, 'sets', parseInt(e.target.value))}
                                      placeholder="3"
                                    />
                                  </VStack>
                                  <VStack align="stretch" flex="1" spacing={1}>
                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">回数</Text>
                                    <Input
                                      type="number"
                                      size="sm"
                                      value={exercise.reps}
                                      onChange={(e) => handleExerciseUpdate(index, 'reps', parseInt(e.target.value))}
                                      placeholder="10"
                                    />
                                  </VStack>
                                  <VStack align="stretch" flex="1" spacing={1}>
                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">重量 (kg)</Text>
                                    <Input
                                      type="number"
                                      step="0.5"
                                      size="sm"
                                      value={exercise.weight}
                                      onChange={(e) => handleExerciseUpdate(index, 'weight', parseFloat(e.target.value))}
                                      placeholder="0.00"
                                    />
                                  </VStack>
                                </HStack>
                              </VStack>
                            ))}
                          </VStack>
                        ) : (
                          <Text fontSize="sm" color="gray.500">エクササイズが選択されていません。「エクササイズを追加」タブから選択してください。</Text>
                        )}
                      </Box>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <Box maxH="400px" overflowY="auto">
                      <VStack spacing={2} align="stretch">
                        {exercises
                          .filter(exercise => !selectedExercises.some(selected => selected.id === exercise.id))
                          .slice(0, 20)
                          .map((exercise) => (
                          <HStack
                            key={exercise.id}
                            p={3}
                            borderWidth="1px"
                            borderRadius="md"
                            cursor="pointer"
                            _hover={{ bg: 'gray.50' }}
                            onClick={() => handleExerciseSelect(exercise)}
                          >
                            <Box flex="1">
                              <Text fontWeight="medium" fontSize="sm">{exercise.name}</Text>
                              <Text fontSize="xs" color="gray.600">
                                {exercise.muscle_group} • {exercise.equipment}
                              </Text>
                            </Box>
                            <Icon as={FiPlus} color="brand.500" />
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                キャンセル
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={submitting}>
                ワークアウトを記録
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Create Exercise Modal */}
      <Modal isOpen={isCreateExerciseOpen} onClose={handleCloseCreateExercise} size="xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <form onSubmit={handleCreateExercise}>
            <ModalHeader>新しいエクササイズを追加</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>エクササイズ名</FormLabel>
                  <Input
                    name="name"
                    value={newExerciseData.name}
                    onChange={handleNewExerciseChange}
                    placeholder="例: バーベルスクワット"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>エクササイズタイプ</FormLabel>
                  <Select
                    name="exercise_type"
                    value={newExerciseData.exercise_type}
                    onChange={handleNewExerciseChange}
                    placeholder="エクササイズタイプを選択"
                  >
                    <option value="strength">筋力トレーニング</option>
                    <option value="cardio">有酸素運動</option>
                    <option value="flexibility">柔軟性</option>
                    <option value="balance">バランス</option>
                    <option value="sports">スポーツ</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>筋肉群</FormLabel>
                  <Select
                    name="muscle_group"
                    value={newExerciseData.muscle_group}
                    onChange={handleNewExerciseChange}
                    placeholder="筋肉群を選択"
                  >
                    <option value="胸">胸</option>
                    <option value="背中">背中</option>
                    <option value="肩">肩</option>
                    <option value="腕">腕</option>
                    <option value="脚">脚</option>
                    <option value="腹筋">腹筋</option>
                    <option value="全身">全身</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>器具</FormLabel>
                  <Select
                    name="equipment"
                    value={newExerciseData.equipment}
                    onChange={handleNewExerciseChange}
                  >
                    <option value="none">器具なし</option>
                    <option value="bodyweight">自重</option>
                    <option value="dumbbells">ダンベル</option>
                    <option value="barbell">バーベル</option>
                    <option value="machine">マシン</option>
                    <option value="resistance_band">レジスタンスバンド</option>
                    <option value="kettlebell">ケトルベル</option>
                    <option value="other">その他</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>難易度</FormLabel>
                  <Select
                    name="difficulty"
                    value={newExerciseData.difficulty}
                    onChange={handleNewExerciseChange}
                  >
                    <option value="beginner">初級</option>
                    <option value="intermediate">中級</option>
                    <option value="advanced">上級</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>MET値（代謝当量）</FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    name="met_value"
                    value={newExerciseData.met_value || newExerciseData.calories_per_minute}
                    onChange={handleNewExerciseChange}
                    placeholder="5.0"
                  />
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    運動強度の指標（例: ウォーキング=3.5, ジョギング=7.0, 筋トレ=6.0）
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel>メディア（画像・動画）</FormLabel>
                  <VStack align="stretch" spacing={3}>
                    {/* Preview Grid */}
                    {exerciseMediaPreviews.length > 0 && (
                      <SimpleGrid columns={2} spacing={3}>
                        {exerciseMediaPreviews.map((preview, index) => (
                          <Box
                            key={index}
                            position="relative"
                            borderWidth="2px"
                            borderColor="brand.200"
                            borderRadius="lg"
                            overflow="hidden"
                          >
                            {preview.type === 'image' ? (
                              <Image
                                src={preview.url}
                                alt={`プレビュー ${index + 1}`}
                                h="150px"
                                w="full"
                                objectFit="cover"
                              />
                            ) : (
                              <Box position="relative" h="150px" bg="gray.100">
                                <video
                                  src={preview.url}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <Icon
                                  as={FiPlay}
                                  position="absolute"
                                  top="50%"
                                  left="50%"
                                  transform="translate(-50%, -50%)"
                                  boxSize={8}
                                  color="white"
                                  bg="blackAlpha.600"
                                  borderRadius="full"
                                  p={2}
                                />
                              </Box>
                            )}
                            <IconButton
                              icon={<FiX />}
                              size="sm"
                              colorScheme="red"
                              position="absolute"
                              top={2}
                              right={2}
                              onClick={() => removeMedia(index)}
                              aria-label="削除"
                            />
                            <Badge
                              position="absolute"
                              bottom={2}
                              left={2}
                              colorScheme={preview.type === 'image' ? 'blue' : 'purple'}
                            >
                              {preview.type === 'image' ? '画像' : '動画'}
                            </Badge>
                          </Box>
                        ))}
                      </SimpleGrid>
                    )}
                    
                    {/* Upload Button */}
                    <Button
                      as="label"
                      htmlFor="exercise-media-upload"
                      leftIcon={<FiImage />}
                      variant="outline"
                      colorScheme="brand"
                      cursor="pointer"
                      w="full"
                    >
                      画像・動画を追加
                      <Input
                        id="exercise-media-upload"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleMediaUpload}
                        display="none"
                      />
                    </Button>
                    <Text fontSize="xs" color="gray.600">
                      画像（JPG、PNG、GIF）または動画（MP4、MOV等）を複数アップロードできます
                    </Text>
                  </VStack>
                </FormControl>

                <Box w="full" p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" color="blue.800" fontWeight="semibold" mb={2}>
                    💡 ヒント
                  </Text>
                  <Text fontSize="xs" color="blue.700">
                    エクササイズを追加すると、ワークアウト作成時に選択できるようになります。
                  </Text>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCloseCreateExercise}>
                キャンセル
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={submitting}>
                追加
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Exercise Modal */}
      <Modal isOpen={isEditExerciseOpen} onClose={handleCloseEditExercise} size="xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <form onSubmit={handleUpdateExercise}>
            <ModalHeader>エクササイズを編集</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>エクササイズ名</FormLabel>
                  <Input
                    name="name"
                    value={newExerciseData.name}
                    onChange={handleNewExerciseChange}
                    placeholder="例: バーベルスクワット"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>エクササイズタイプ</FormLabel>
                  <Select
                    name="exercise_type"
                    value={newExerciseData.exercise_type}
                    onChange={handleNewExerciseChange}
                    placeholder="エクササイズタイプを選択"
                  >
                    <option value="strength">筋力トレーニング</option>
                    <option value="cardio">有酸素運動</option>
                    <option value="flexibility">柔軟性</option>
                    <option value="balance">バランス</option>
                    <option value="sports">スポーツ</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>筋肉群</FormLabel>
                  <Select
                    name="muscle_group"
                    value={newExerciseData.muscle_group}
                    onChange={handleNewExerciseChange}
                    placeholder="筋肉群を選択"
                  >
                    <option value="胸">胸</option>
                    <option value="背中">背中</option>
                    <option value="肩">肩</option>
                    <option value="腕">腕</option>
                    <option value="脚">脚</option>
                    <option value="腹筋">腹筋</option>
                    <option value="全身">全身</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>器具</FormLabel>
                  <Select
                    name="equipment"
                    value={newExerciseData.equipment}
                    onChange={handleNewExerciseChange}
                  >
                    <option value="none">器具なし</option>
                    <option value="bodyweight">自重</option>
                    <option value="dumbbells">ダンベル</option>
                    <option value="barbell">バーベル</option>
                    <option value="machine">マシン</option>
                    <option value="resistance_band">レジスタンスバンド</option>
                    <option value="kettlebell">ケトルベル</option>
                    <option value="other">その他</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>難易度</FormLabel>
                  <Select
                    name="difficulty"
                    value={newExerciseData.difficulty}
                    onChange={handleNewExerciseChange}
                  >
                    <option value="beginner">初級</option>
                    <option value="intermediate">中級</option>
                    <option value="advanced">上級</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>MET値（代謝当量）</FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    name="met_value"
                    value={newExerciseData.met_value || newExerciseData.calories_per_minute}
                    onChange={handleNewExerciseChange}
                    placeholder="5.0"
                  />
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    運動強度の指標（例: ウォーキング=3.5, ジョギング=7.0, 筋トレ=6.0）
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel>メディア（画像・動画）</FormLabel>
                  <VStack align="stretch" spacing={3}>
                    {/* Preview Grid */}
                    {exerciseMediaPreviews.length > 0 && (
                      <SimpleGrid columns={2} spacing={3}>
                        {exerciseMediaPreviews.map((preview, index) => (
                          <Box
                            key={index}
                            position="relative"
                            borderWidth="2px"
                            borderColor="brand.200"
                            borderRadius="lg"
                            overflow="hidden"
                          >
                            {preview.type === 'image' ? (
                              <Image
                                src={preview.url}
                                alt={`プレビュー ${index + 1}`}
                                h="150px"
                                w="full"
                                objectFit="cover"
                              />
                            ) : (
                              <Box position="relative" h="150px" bg="gray.100">
                                <video
                                  src={preview.url}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <Icon
                                  as={FiPlay}
                                  position="absolute"
                                  top="50%"
                                  left="50%"
                                  transform="translate(-50%, -50%)"
                                  boxSize={8}
                                  color="white"
                                  bg="blackAlpha.600"
                                  borderRadius="full"
                                  p={2}
                                />
                              </Box>
                            )}
                            <IconButton
                              icon={<FiX />}
                              size="sm"
                              colorScheme="red"
                              position="absolute"
                              top={2}
                              right={2}
                              onClick={() => removeMedia(index)}
                              aria-label="削除"
                            />
                            <Badge
                              position="absolute"
                              bottom={2}
                              left={2}
                              colorScheme={preview.type === 'image' ? 'blue' : 'purple'}
                            >
                              {preview.type === 'image' ? '画像' : '動画'}
                            </Badge>
                            {preview.isExisting && (
                              <Badge
                                position="absolute"
                                bottom={2}
                                right={2}
                                colorScheme="gray"
                              >
                                既存
                              </Badge>
                            )}
                          </Box>
                        ))}
                      </SimpleGrid>
                    )}
                    
                    {/* Upload Button */}
                    <Button
                      as="label"
                      htmlFor="exercise-media-upload-edit"
                      leftIcon={<FiImage />}
                      variant="outline"
                      colorScheme="brand"
                      cursor="pointer"
                      w="full"
                    >
                      画像・動画を追加
                      <Input
                        id="exercise-media-upload-edit"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleMediaUpload}
                        display="none"
                      />
                    </Button>
                    <Text fontSize="xs" color="gray.600">
                      画像（JPG、PNG、GIF）または動画（MP4、MOV等）を複数アップロードできます
                    </Text>
                  </VStack>
                </FormControl>

                <Box w="full" p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" color="blue.800" fontWeight="semibold" mb={2}>
                    💡 ヒント
                  </Text>
                  <Text fontSize="xs" color="blue.700">
                    エクササイズの情報を更新できます。変更は保存後すぐに反映されます。
                  </Text>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCloseEditExercise}>
                キャンセル
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={submitting}>
                更新
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Exercise Confirmation Modal */}
      <Modal isOpen={isDeleteExerciseOpen} onClose={onDeleteExerciseClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>エクササイズを削除</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {exerciseToDelete && (
              <Text>
                「<strong>{exerciseToDelete.name}</strong>」を削除してもよろしいですか？
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={() => {
                setExerciseToDelete(null);
                onDeleteExerciseClose();
              }}
            >
              キャンセル
            </Button>
            <Button 
              colorScheme="red"
              isLoading={submitting}
              onClick={async () => {
                if (!exerciseToDelete) return;
                
                setSubmitting(true);
                try {
                  await workoutsService.exercises.delete(exerciseToDelete.id);
                  
                  toast({
                    title: '削除しました',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  });
                  
                  setExerciseToDelete(null);
                  onDeleteExerciseClose();
                  await loadData();
                } catch (error) {
                  console.error('Delete exercise error:', error);
                  toast({
                    title: '削除に失敗しました',
                    description: error.response?.data?.detail || 'もう一度お試しください',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                  });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              削除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Workout Modal */}
      <Modal isOpen={isEditWorkoutOpen} onClose={onEditWorkoutClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleUpdateWorkout}>
            <ModalHeader>ワークアウトを編集</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Tabs>
                <TabList>
                  <Tab>ワークアウトの詳細</Tab>
                  <Tab>エクササイズを追加</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>ワークアウト名</FormLabel>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="例: 上半身トレーニング"
                        />
                      </FormControl>

                      <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                        <FormControl isRequired>
                          <FormLabel>日付</FormLabel>
                          <Input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>時間 (分)</FormLabel>
                          <Input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="45"
                          />
                        </FormControl>
                      </Grid>

                      <FormControl>
                        <FormLabel>メモ</FormLabel>
                        <Textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="体調や気づいたことを記録..."
                        />
                      </FormControl>

                      {/* Selected Exercises */}
                      <Box w="full">
                        <Heading size="sm" mb={3}>選択したエクササイズ ({selectedExercises.length})</Heading>
                        {selectedExercises.length > 0 ? (
                          <VStack spacing={2} align="stretch">
                            {selectedExercises.map((exercise, index) => (
                              <VStack key={index} p={3} bg="gray.50" borderRadius="md" align="stretch" spacing={2}>
                                <HStack justify="space-between">
                                  <Text fontWeight="medium" fontSize="sm">{exercise.name}</Text>
                                  <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleExerciseRemove(index)}>
                                    ×
                                  </Button>
                                </HStack>
                                <HStack spacing={2}>
                                  <VStack align="stretch" flex="1" spacing={1}>
                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">セット数</Text>
                                    <Input
                                      type="number"
                                      size="sm"
                                      value={exercise.sets}
                                      onChange={(e) => handleExerciseUpdate(index, 'sets', parseInt(e.target.value))}
                                      placeholder="3"
                                    />
                                  </VStack>
                                  <VStack align="stretch" flex="1" spacing={1}>
                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">回数</Text>
                                    <Input
                                      type="number"
                                      size="sm"
                                      value={exercise.reps}
                                      onChange={(e) => handleExerciseUpdate(index, 'reps', parseInt(e.target.value))}
                                      placeholder="10"
                                    />
                                  </VStack>
                                  <VStack align="stretch" flex="1" spacing={1}>
                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">重量 (kg)</Text>
                                    <Input
                                      type="number"
                                      step="0.5"
                                      size="sm"
                                      value={exercise.weight}
                                      onChange={(e) => handleExerciseUpdate(index, 'weight', parseFloat(e.target.value))}
                                      placeholder="0.00"
                                    />
                                  </VStack>
                                </HStack>
                              </VStack>
                            ))}
                          </VStack>
                        ) : (
                          <Text fontSize="sm" color="gray.500">エクササイズが選択されていません。「エクササイズを追加」タブから選択してください。</Text>
                        )}
                      </Box>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <Box maxH="400px" overflowY="auto">
                      <VStack spacing={2} align="stretch">
                        {exercises
                          .filter(exercise => !selectedExercises.some(selected => selected.id === exercise.id))
                          .slice(0, 20)
                          .map((exercise) => (
                          <HStack
                            key={exercise.id}
                            p={3}
                            borderWidth="1px"
                            borderRadius="md"
                            cursor="pointer"
                            _hover={{ bg: 'gray.50' }}
                            onClick={() => handleExerciseSelect(exercise)}
                          >
                            <Box flex="1">
                              <Text fontWeight="medium" fontSize="sm">{exercise.name}</Text>
                              <Text fontSize="xs" color="gray.600">
                                {exercise.muscle_group} • {exercise.equipment}
                              </Text>
                            </Box>
                            <Icon as={FiPlus} color="brand.500" />
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditWorkoutClose}>
                キャンセル
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={submitting}>
                更新
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Workout Confirmation Modal */}
      <Modal isOpen={isDeleteWorkoutOpen} onClose={onDeleteWorkoutClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ワークアウトを削除</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {workoutToDelete && (
              <Text>
                「<strong>{workoutToDelete.name}</strong>」を削除してもよろしいですか？
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={() => {
                setWorkoutToDelete(null);
                onDeleteWorkoutClose();
              }}
            >
              キャンセル
            </Button>
            <Button 
              colorScheme="red"
              isLoading={submitting}
              onClick={handleDeleteWorkout}
            >
              削除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Workout Plan Modal */}
      <Modal isOpen={isCreatePlanOpen} onClose={onCreatePlanClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleCreatePlan}>
            <ModalHeader>
              <VStack align="start" spacing={1}>
                <Text>ワークアウトプログラムを作成</Text>
                <Text fontSize="sm" fontWeight="normal" color="gray.600">
                  体系的なトレーニングプログラムを計画しましょう
                </Text>
              </VStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                {/* Info Box */}
                <Box w="full" p={4} bg="purple.50" borderRadius="md" borderLeft="4px solid" borderColor="purple.500">
                  <HStack align="start" spacing={3}>
                    <Icon as={FiInfo} color="purple.600" boxSize={5} mt={0.5} />
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="bold" color="purple.900" mb={1}>
                        ワークアウトプログラムとは？
                      </Text>
                      <Text fontSize="xs" color="purple.800">
                        通常のワークアウトが「1回のトレーニング」であるのに対し、
                        プログラムは「数週間〜数ヶ月の構造化されたトレーニング計画」です。
                        目標達成のための体系的なプログラムを作成しましょう。
                      </Text>
                    </Box>
                  </HStack>
                </Box>

                <FormControl isRequired>
                  <FormLabel>プログラム名</FormLabel>
                  <Input
                    name="name"
                    value={newPlanData.name}
                    onChange={handleNewPlanChange}
                    placeholder="例: 12週間フルボディ改造プログラム"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>簡単な説明</FormLabel>
                  <Textarea
                    name="description"
                    value={newPlanData.description}
                    onChange={handleNewPlanChange}
                    placeholder="例: 初心者から中級者向けの全身トレーニングプログラム。筋力と筋肉量を増やすことを目標としています。"
                    rows={3}
                  />
                </FormControl>

                <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>目標</FormLabel>
                    <Select
                      name="goal"
                      value={newPlanData.goal}
                      onChange={handleNewPlanChange}
                      placeholder="目標を選択"
                    >
                      <option value="weight_loss">減量</option>
                      <option value="muscle_gain">筋肉増強</option>
                      <option value="strength">筋力向上</option>
                      <option value="endurance">持久力</option>
                      <option value="general_fitness">総合的なフィットネス</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>難易度</FormLabel>
                    <Select
                      name="difficulty"
                      value={newPlanData.difficulty}
                      onChange={handleNewPlanChange}
                      placeholder="難易度を選択"
                    >
                      <option value="beginner">初級</option>
                      <option value="intermediate">中級</option>
                      <option value="advanced">上級</option>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>
                      プログラム期間（週）
                      <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                        推奨2-16週
                      </Text>
                    </FormLabel>
                    <Input
                      type="number"
                      name="duration_weeks"
                      value={newPlanData.duration_weeks}
                      onChange={handleNewPlanChange}
                      min={1}
                      max={52}
                      placeholder="8"
                    />
                    <Text fontSize="xs" color="gray.600" mt={1}>
                      プログラム全体の期間を設定
                    </Text>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>
                      週あたりのトレーニング日数
                      <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                        推奨3-5日
                      </Text>
                    </FormLabel>
                    <Input
                      type="number"
                      name="days_per_week"
                      value={newPlanData.days_per_week}
                      onChange={handleNewPlanChange}
                      min={1}
                      max={7}
                      placeholder="4"
                    />
                    <Text fontSize="xs" color="gray.600" mt={1}>
                      1週間に何日トレーニングするか
                    </Text>
                  </FormControl>
                </Grid>

                <FormControl isRequired>
                  <FormLabel>プログラムの詳細な概要</FormLabel>
                  <Textarea
                    name="overview"
                    value={newPlanData.overview}
                    onChange={handleNewPlanChange}
                    placeholder="例: このプログラムは、初心者が筋力と筋肉量を増やすために設計されています。毎週少しずつ負荷を上げていく漸進的オーバーロード方式を採用しています。"
                    rows={4}
                  />
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    プログラムの特徴、アプローチ、期待される結果など
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>必要な器具・前提条件</FormLabel>
                  <Textarea
                    name="requirements"
                    value={newPlanData.requirements}
                    onChange={handleNewPlanChange}
                    placeholder="例: ダンベル（5-20kg）、ベンチ、ヨガマット。トレーニング経験は不要ですが、基本的な体力があると良いです。"
                    rows={3}
                  />
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    必要な器具、推奨されるフィットネスレベルなど
                  </Text>
                </FormControl>

                <Box w="full" p={4} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.400">
                  <HStack align="start" spacing={2}>
                    <Icon as={FiInfo} color="blue.600" boxSize={4} mt={0.5} />
                    <Box flex="1">
                      <Text fontSize="sm" color="blue.800" fontWeight="semibold" mb={1}>
                        次のステップ
                      </Text>
                      <Text fontSize="xs" color="blue.700">
                        プログラム作成後、Django管理画面で各日のトレーニング内容を詳細に設定できます。
                        プログラムを開始すると、自動的にワークアウトスケジュールが生成されます。
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCreatePlanClose}>
                キャンセル
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={submitting}>
                作成
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Exercise Media Carousel Modal */}
      <Modal isOpen={isExerciseMediaOpen} onClose={onExerciseMediaClose} size="4xl" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" shadow="none" maxW="90vw">
          <ModalCloseButton color="white" bg="blackAlpha.600" _hover={{ bg: 'blackAlpha.800' }} />
          <ModalBody p={0}>
            {exerciseMediaView && (
              <Box>
                {/* Exercise Name */}
                <Box textAlign="center" mb={4}>
                  <Heading size="lg" color="white" textShadow="0 2px 4px rgba(0,0,0,0.5)">
                    {exerciseMediaView.name}
                  </Heading>
                  {exerciseMediaView.primary_muscles && exerciseMediaView.primary_muscles.length > 0 && (
                    <Text color="whiteAlpha.900" mt={2} textShadow="0 1px 2px rgba(0,0,0,0.5)">
                      {exerciseMediaView.primary_muscles.join(', ')} • {exerciseMediaView.equipment || '自重'}
                    </Text>
                  )}
                </Box>

                {/* Media Carousel */}
                {exerciseMediaView.media_files && exerciseMediaView.media_files.length > 0 ? (
                  <Box position="relative">
                    {/* Main Media Display */}
                    <Box
                      bg="gray.900"
                      borderRadius="xl"
                      overflow="hidden"
                      maxH="70vh"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {exerciseMediaView.media_files[currentMediaIndex].media_type === 'image' ? (
                        <Image
                          src={getImageUrl(exerciseMediaView.media_files[currentMediaIndex].file)}
                          alt={exerciseMediaView.name}
                          maxH="70vh"
                          maxW="100%"
                          objectFit="contain"
                        />
                      ) : (
                        <Box w="100%" maxH="70vh">
                          <video
                            src={getImageUrl(exerciseMediaView.media_files[currentMediaIndex].file)}
                            controls
                            style={{ 
                              width: '100%', 
                              maxHeight: '70vh',
                              objectFit: 'contain'
                            }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Navigation Buttons */}
                    {exerciseMediaView.media_files.length > 1 && (
                      <>
                        <IconButton
                          icon={<FiChevronLeft />}
                          position="absolute"
                          left={4}
                          top="50%"
                          transform="translateY(-50%)"
                          colorScheme="whiteAlpha"
                          bg="blackAlpha.600"
                          color="white"
                          size="lg"
                          borderRadius="full"
                          _hover={{ bg: 'blackAlpha.800' }}
                          onClick={handlePrevMedia}
                          aria-label="前へ"
                        />
                        <IconButton
                          icon={<FiChevronRight />}
                          position="absolute"
                          right={4}
                          top="50%"
                          transform="translateY(-50%)"
                          colorScheme="whiteAlpha"
                          bg="blackAlpha.600"
                          color="white"
                          size="lg"
                          borderRadius="full"
                          _hover={{ bg: 'blackAlpha.800' }}
                          onClick={handleNextMedia}
                          aria-label="次へ"
                        />
                      </>
                    )}

                    {/* Media Counter */}
                    <Box
                      position="absolute"
                      bottom={4}
                      left="50%"
                      transform="translateX(-50%)"
                      bg="blackAlpha.700"
                      color="white"
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      {currentMediaIndex + 1} / {exerciseMediaView.media_files.length}
                    </Box>
                  </Box>
                ) : (
                  <Center h="400px" bg="gray.900" borderRadius="xl">
                    <VStack spacing={4}>
                      <Icon as={FiImage} boxSize={16} color="gray.500" />
                      <Text color="gray.400" fontSize="lg">
                        メディアがありません
                      </Text>
                    </VStack>
                  </Center>
                )}
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Start Workout Plan Modal */}
      <Modal isOpen={isStartPlanOpen} onClose={onStartPlanClose} isCentered size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={1}>
              <Text>プログラムを開始</Text>
              {planToStart && (
                <Text fontSize="sm" fontWeight="normal" color="gray.600">
                  {planToStart.name}
                </Text>
              )}
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {planToStart && (
              <VStack spacing={4} align="stretch">
                {/* Warning if there's an active schedule */}
                {activeSchedule && (() => {
                  const activePlan = activeSchedule.workout_plan;
                  const activeEndDate = new Date(activeSchedule.start_date);
                  activeEndDate.setDate(activeEndDate.getDate() + (activePlan.duration_weeks * 7));
                  
                  return (
                    <Box p={3} bg="orange.50" borderRadius="md" borderLeft="4px solid" borderColor="orange.500">
                      <HStack align="start" spacing={2}>
                        <Icon as={FiInfo} color="orange.600" boxSize={4} mt={0.5} />
                        <Box flex="1">
                          <Text fontSize="sm" color="orange.800" fontWeight="semibold" mb={1}>
                            ⚠️ 既存のプログラムが実行中
                          </Text>
                          <Text fontSize="xs" color="orange.700">
                            現在「{activePlan.name}」が実行中です（終了予定: {activeEndDate.toLocaleDateString('ja-JP')}）。
                            期間が重複しないようにしてください。
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                  );
                })()}

                {/* Plan Info */}
                <Box p={4} bg="purple.50" borderRadius="md">
                  <SimpleGrid columns={3} spacing={3} mb={3}>
                    <Box>
                      <Text fontSize="xs" color="gray.600">期間</Text>
                      <Text fontWeight="bold">{planToStart.duration_weeks}週間</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600">頻度</Text>
                      <Text fontWeight="bold">週{planToStart.days_per_week}日</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600">難易度</Text>
                      <Badge
                        colorScheme={
                          planToStart.difficulty === 'beginner' ? 'green' :
                          planToStart.difficulty === 'intermediate' ? 'yellow' : 'red'
                        }
                      >
                        {planToStart.difficulty === 'beginner' ? '初級' :
                         planToStart.difficulty === 'intermediate' ? '中級' : '上級'}
                      </Badge>
                    </Box>
                  </SimpleGrid>
                  <Text fontSize="sm" color="gray.700">
                    {planToStart.description}
                  </Text>
                </Box>

                {/* Start Date Picker */}
                <FormControl isRequired>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FiClock} />
                      <Text>開始日</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="date"
                    value={planStartDate}
                    onChange={(e) => setPlanStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Text fontSize="xs" color="gray.600" mt={2}>
                    この日からプログラムが開始されます。ワークアウトスケジュールが自動的に生成されます。
                  </Text>
                </FormControl>

                {/* Info Box */}
                <Box p={3} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.400">
                  <HStack align="start" spacing={2}>
                    <Icon as={FiInfo} color="blue.600" boxSize={4} mt={0.5} />
                    <Box flex="1">
                      <Text fontSize="sm" color="blue.800" fontWeight="semibold" mb={1}>
                        💡 プログラムについて
                      </Text>
                      <Text fontSize="xs" color="blue.700">
                        プログラムを開始すると、{planToStart.duration_weeks}週間のトレーニングスケジュールが作成されます。
                        毎日のワークアウトが自動的にカレンダーに追加され、進捗を追跡できます。
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={() => {
                setPlanToStart(null);
                onStartPlanClose();
              }}
            >
              キャンセル
            </Button>
            <Button 
              colorScheme="brand"
              leftIcon={<FiPlay />}
              isLoading={submitting}
              onClick={handleStartPlan}
            >
              プログラムを開始
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Workout Plan Confirmation Modal */}
      <Modal isOpen={isDeletePlanOpen} onClose={onDeletePlanClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ワークアウトプランを削除</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {planToDelete && (
              <VStack spacing={3} align="stretch">
                <Text>
                  「<strong>{planToDelete.name}</strong>」を削除してもよろしいですか？
                </Text>
                <Box p={3} bg="red.50" borderRadius="md" borderLeft="4px solid" borderColor="red.500">
                  <Text fontSize="sm" color="red.800">
                    ⚠️ このプログラムに関連する全てのデータが削除されます。この操作は取り消せません。
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={() => {
                setPlanToDelete(null);
                onDeletePlanClose();
              }}
            >
              キャンセル
            </Button>
            <Button 
              colorScheme="red"
              isLoading={submitting}
              onClick={async () => {
                if (!planToDelete) return;
                
                setSubmitting(true);
                try {
                  await workoutsService.workoutPlans.delete(planToDelete.id);
                  
                  toast({
                    title: 'プランを削除しました',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  });
                  
                  // Clear selected plan if it was deleted
                  if (selectedPlan?.id === planToDelete.id) {
                    setSelectedPlan(null);
                  }
                  
                  setPlanToDelete(null);
                  onDeletePlanClose();
                  await loadData();
                } catch (error) {
                  console.error('Delete plan error:', error);
                  toast({
                    title: '削除に失敗しました',
                    description: error.response?.data?.detail || 'もう一度お試しください',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                  });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              削除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Workouts;
