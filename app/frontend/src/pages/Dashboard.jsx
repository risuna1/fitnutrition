import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  Center,
  VStack,
  HStack,
  Icon,
  Button,
  Badge,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
} from '@chakra-ui/react';
import { FiActivity, FiTrendingDown, FiTrendingUp, FiTarget, FiCalendar, FiZap, FiPercent } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import analyticsService from '../services/analytics';
import measurementsService from '../services/measurements';
import nutritionService from '../services/nutrition';
import workoutsService from '../services/workouts';
import { formatDate, calculateBMI } from '../utils/helpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [latestMeasurement, setLatestMeasurement] = useState(null);
  const [todayCalories, setTodayCalories] = useState(null);
  const [weekWorkouts, setWeekWorkouts] = useState(null);
  const [errors, setErrors] = useState([]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setErrors([]);
      
      // Load data separately to handle individual errors
      let dashboardError = null;
      let measurementError = null;
      
      try {
        const dashboardResponse = await analyticsService.getDashboard();
        const data = dashboardResponse.data || dashboardResponse;
        console.log('Dashboard API response:', data);
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        dashboardError = 'ダッシュボードデータの読み込みに失敗しました';
        setDashboardData(null);
      }
      
      try {
        const measurementResponse = await measurementsService.getLatestMeasurement();
        const data = measurementResponse.data || measurementResponse;
        console.log('Latest measurement:', data);
        setLatestMeasurement(data);
      } catch (error) {
        console.error('Error loading measurement data:', error);
        measurementError = '測定値の読み込みに失敗しました';
        setLatestMeasurement(null);
      }

      // Load today's calories
      try {
        const mealsResponse = await nutritionService.meals.getToday();
        const meals = mealsResponse.data || mealsResponse;
        console.log('Today meals:', meals);
        setTodayCalories(meals);
      } catch (error) {
        console.error('Error loading today calories:', error);
        setTodayCalories(null);
      }

      // Load this week's workouts
      try {
        const workoutsResponse = await workoutsService.workouts.getThisWeek();
        const workouts = workoutsResponse.data || workoutsResponse;
        console.log('Week workouts:', workouts);
        setWeekWorkouts(workouts);
      } catch (error) {
        console.error('Error loading week workouts:', error);
        setWeekWorkouts(null);
      }
      
      // Collect errors
      const errorList = [];
      if (dashboardError) errorList.push(dashboardError);
      if (measurementError) errorList.push(measurementError);
      
      if (errorList.length > 0) {
        setErrors(errorList);
      }
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setErrors(['データの読み込みに失敗しました']);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }
  
  // Show single consolidated error message if there are errors
  const hasErrors = errors.length > 0;

  const bmi = latestMeasurement ? calculateBMI(latestMeasurement.weight, latestMeasurement.height) : null;

  // Calculate today's total calories
  const calculateTodayCalories = () => {
    if (!todayCalories || !Array.isArray(todayCalories)) return 0;
    return todayCalories.reduce((total, meal) => {
      const mealCalories = meal.foods?.reduce((sum, food) => sum + (food.calories || 0), 0) || 0;
      return total + mealCalories;
    }, 0);
  };

  // Get calorie target from TDEE or default
  const getCalorieTarget = () => {
    return dashboardData?.metabolism?.tdee ? Math.round(dashboardData.metabolism.tdee) : 2200;
  };

  // Calculate this week's workout stats
  const calculateWeekWorkoutStats = () => {
    if (!weekWorkouts || !Array.isArray(weekWorkouts)) {
      return { completed: 0, total: 5, percentage: 0 };
    }
    const completed = weekWorkouts.filter(w => w.status === 'completed').length;
    const total = 5; // Weekly goal
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  // Calculate monthly weight change
  const getMonthlyWeightChange = () => {
    if (!dashboardData?.recent_progress?.weight_progress) return null;
    const change = dashboardData.recent_progress.weight_progress.weight_change;
    return change ? change * 4 : null; // Approximate monthly from weekly
  };

  // Calculate monthly body fat change
  const getMonthlyBodyFatChange = () => {
    if (!dashboardData?.recent_progress?.body_composition?.body_fat_change) return null;
    return dashboardData.recent_progress.body_composition.body_fat_change;
  };

  const todayCaloriesTotal = calculateTodayCalories();
  const calorieTarget = getCalorieTarget();
  const workoutStats = calculateWeekWorkoutStats();
  const monthlyWeightChange = getMonthlyWeightChange();
  const monthlyBodyFatChange = getMonthlyBodyFatChange();

  return (
    <Box>
      {/* Header */}
      <Box mb={8}>
        <Heading size="lg" mb={2}>ダッシュボード</Heading>
        <Text color="gray.600">おかえりなさい！フィットネスの概要です。</Text>
      </Box>

      {/* Single Error Alert */}
      {hasErrors && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>データの読み込みに問題があります</AlertTitle>
            <AlertDescription>
              一部のデータを読み込めませんでした。プロフィールを完成させるか、測定値を記録してください。
            </AlertDescription>
          </Box>
          <Button size="sm" colorScheme="orange" onClick={() => navigate('/measurements')}>
            測定値を記録
          </Button>
        </Alert>
      )}

      {/* Stats Cards - New Design */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {/* Card 1: Current Weight */}
        <Card 
          bg={bgColor} 
          borderWidth="1px" 
          borderColor={borderColor}
          borderLeftWidth="4px"
          borderLeftColor="blue.500"
          position="relative"
          overflow="hidden"
        >
          <CardBody>
            <Flex justify="space-between" align="flex-start">
              <Box flex="1">
                <Text fontSize="sm" color="gray.600" mb={2}>現在の体重</Text>
                <Text fontSize="3xl" fontWeight="bold" mb={1}>
                  {latestMeasurement?.weight || dashboardData?.goal_progress?.current_weight || 'N/A'} kg
                </Text>
                {monthlyWeightChange !== null && (
                  <HStack 
                    spacing={1} 
                    color={monthlyWeightChange < 0 ? "green.500" : "red.500"} 
                    fontSize="sm"
                  >
                    <Icon as={monthlyWeightChange < 0 ? FiTrendingDown : FiTrendingUp} />
                    <Text>今月 {monthlyWeightChange > 0 ? '+' : ''}{monthlyWeightChange.toFixed(1)} kg</Text>
                  </HStack>
                )}
              </Box>
              <Box
                bg="blue.100"
                p={3}
                borderRadius="lg"
              >
                <Icon as={FiActivity} boxSize={6} color="blue.600" />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* Card 2: Today's Calories */}
        <Card 
          bg={bgColor} 
          borderWidth="1px" 
          borderColor={borderColor}
          borderLeftWidth="4px"
          borderLeftColor="green.500"
          position="relative"
          overflow="hidden"
        >
          <CardBody>
            <Flex justify="space-between" align="flex-start">
              <Box flex="1">
                <Text fontSize="sm" color="gray.600" mb={2}>今日のカロリー</Text>
                <Text fontSize="3xl" fontWeight="bold" mb={1}>
                  {todayCaloriesTotal.toLocaleString()}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  目標: {calorieTarget.toLocaleString()} kcal
                </Text>
              </Box>
              <Box
                bg="green.100"
                p={3}
                borderRadius="lg"
              >
                <Icon as={FiZap} boxSize={6} color="green.600" />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* Card 3: This Week's Workouts */}
        <Card 
          bg={bgColor} 
          borderWidth="1px" 
          borderColor={borderColor}
          borderLeftWidth="4px"
          borderLeftColor="purple.500"
          position="relative"
          overflow="hidden"
        >
          <CardBody>
            <Flex justify="space-between" align="flex-start">
              <Box flex="1">
                <Text fontSize="sm" color="gray.600" mb={2}>今週のワークアウト</Text>
                <Text fontSize="3xl" fontWeight="bold" mb={1}>
                  {workoutStats.completed}/{workoutStats.total}
                </Text>
                <HStack spacing={1} color="purple.500" fontSize="sm">
                  <Icon as={FiTarget} />
                  <Text>{workoutStats.percentage}% 完了</Text>
                </HStack>
              </Box>
              <Box
                bg="purple.100"
                p={3}
                borderRadius="lg"
              >
                <Icon as={FiActivity} boxSize={6} color="purple.600" />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* Card 4: Body Fat Percentage */}
        <Card 
          bg={bgColor} 
          borderWidth="1px" 
          borderColor={borderColor}
          borderLeftWidth="4px"
          borderLeftColor="orange.500"
          position="relative"
          overflow="hidden"
        >
          <CardBody>
            <Flex justify="space-between" align="flex-start">
              <Box flex="1">
                <Text fontSize="sm" color="gray.600" mb={2}>体脂肪率</Text>
                <Text fontSize="3xl" fontWeight="bold" mb={1}>
                  {latestMeasurement?.body_fat_percentage ? `${latestMeasurement.body_fat_percentage}%` : 'N/A'}
                </Text>
                {monthlyBodyFatChange !== null && (
                  <HStack 
                    spacing={1} 
                    color={monthlyBodyFatChange < 0 ? "green.500" : "red.500"} 
                    fontSize="sm"
                  >
                    <Icon as={monthlyBodyFatChange < 0 ? FiTrendingDown : FiTrendingUp} />
                    <Text>今月 {monthlyBodyFatChange > 0 ? '+' : ''}{monthlyBodyFatChange}%</Text>
                  </HStack>
                )}
              </Box>
              <Box
                bg="orange.100"
                p={3}
                borderRadius="lg"
              >
                <Icon as={FiPercent} boxSize={6} color="orange.600" />
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Quick Actions & Progress Summary */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        {/* Progress Summary */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">進捗サマリー</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              {dashboardData?.recent_progress ? (
                <>
                  <Box p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium">体重の変化</Text>
                      <Badge colorScheme={dashboardData.recent_progress.weight_progress?.weight_change < 0 ? 'green' : 'orange'}>
                        {dashboardData.recent_progress.weight_progress?.weight_change > 0 ? '+' : ''}
                        {dashboardData.recent_progress.weight_progress?.weight_change?.toFixed(1) || 0} kg
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      過去7日間: {dashboardData.recent_progress.weight_progress?.start_weight?.toFixed(1)} kg → {dashboardData.recent_progress.weight_progress?.current_weight?.toFixed(1)} kg
                    </Text>
                  </Box>
                  
                  {dashboardData.recent_progress.body_composition?.body_fat_change && (
                    <Box p={4} bg={useColorModeValue('green.50', 'green.900')} borderRadius="md">
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="medium">体脂肪率の変化</Text>
                        <Badge colorScheme="green">
                          {dashboardData.recent_progress.body_composition.body_fat_change > 0 ? '+' : ''}
                          {dashboardData.recent_progress.body_composition.body_fat_change}%
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">過去7日間</Text>
                    </Box>
                  )}
                  
                  <Box p={4} bg={useColorModeValue('purple.50', 'purple.900')} borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium">ワークアウト</Text>
                      <Badge colorScheme="purple">
                        {dashboardData.recent_progress.workout_trends?.total_workouts || 0} 回
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      過去7日間 • {dashboardData.recent_progress.workout_trends?.total_duration_minutes || 0} 分
                    </Text>
                  </Box>
                </>
              ) : (
                <Center py={8}>
                  <VStack>
                    <Icon as={FiActivity} boxSize={12} color="gray.400" />
                    <Text color="gray.500">データを記録して進捗を追跡しましょう</Text>
                    <Button colorScheme="brand" size="sm" onClick={() => navigate('/measurements')}>
                      測定値を記録
                    </Button>
                  </VStack>
                </Center>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">クイックアクション</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3}>
              <Button
                w="full"
                leftIcon={<FiActivity />}
                colorScheme="brand"
                onClick={() => navigate('/measurements')}
              >
                測定値を記録
              </Button>
              <Button
                w="full"
                leftIcon={<FiCalendar />}
                variant="outline"
                colorScheme="brand"
                onClick={() => navigate('/workouts')}
              >
                ワークアウトを記録
              </Button>
              <Button
                w="full"
                leftIcon={<FiTarget />}
                variant="outline"
                colorScheme="brand"
                onClick={() => navigate('/nutrition')}
              >
                食事を記録
              </Button>
              <Button
                w="full"
                leftIcon={<FiTrendingDown />}
                variant="outline"
                colorScheme="brand"
                onClick={() => navigate('/progress')}
              >
                進捗を表示
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Goals Section */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} mt={6}>
        <CardHeader>
          <Heading size="md">あなたの目標</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box>
              <Text fontWeight="medium" mb={2}>体重目標</Text>
              <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                {dashboardData?.goal_progress?.target_weight || '未設定'} kg
              </Text>
              <Text fontSize="sm" color="gray.600">
                {dashboardData?.goal_progress?.weight_remaining
                  ? `あと${Math.abs(dashboardData.goal_progress.weight_remaining).toFixed(1)} kg`
                  : '設定で目標を設定してください'}
              </Text>
              {dashboardData?.goal_progress?.estimated_weeks_to_goal && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  推定: {dashboardData.goal_progress.estimated_weeks_to_goal.toFixed(1)} 週間
                </Text>
              )}
            </Box>
            <Box>
              <Text fontWeight="medium" mb={2}>基礎代謝 (BMR)</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {dashboardData?.metabolism?.bmr ? Math.round(dashboardData.metabolism.bmr) : 'N/A'} kcal
              </Text>
              <Text fontSize="sm" color="gray.600">
                1日の基礎消費カロリー
              </Text>
            </Box>
            <Box>
              <Text fontWeight="medium" mb={2}>総消費カロリー (TDEE)</Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {dashboardData?.metabolism?.tdee ? Math.round(dashboardData.metabolism.tdee) : 'N/A'} kcal
              </Text>
              <Text fontSize="sm" color="gray.600">
                活動量を含む1日の消費
              </Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;
