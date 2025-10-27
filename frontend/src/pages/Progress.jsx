import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Grid,
  Select,
  useToast,
  Spinner,
  Center,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import analyticsService from '../services/analytics';
import { formatDate } from '../utils/helpers';

const Progress = () => {
  const toast = useToast();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadProgressData();
  }, [timeRange]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getProgress({ days: timeRange });
      setProgressData(response.data);
    } catch (error) {
      toast({
        title: 'Error loading progress data',
        description: error.response?.data?.detail || 'Failed to load data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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

  // Prepare chart data
  const weightData = progressData?.weight_history?.map(item => ({
    date: formatDate(item.date),
    weight: item.weight,
    goal: progressData.weight_goal,
  })) || [];

  const bodyFatData = progressData?.body_fat_history?.map(item => ({
    date: formatDate(item.date),
    bodyFat: item.body_fat_percentage,
  })) || [];

  const workoutData = progressData?.workout_frequency?.map(item => ({
    week: item.week,
    count: item.count,
  })) || [];

  const calorieData = progressData?.calorie_trends?.map(item => ({
    date: formatDate(item.date),
    calories: item.calories,
    target: progressData.target_calories,
  })) || [];

  return (
    <Box>
      {/* Header */}
      <Box mb={8} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Heading size="lg" mb={2}>Progress Tracking</Heading>
          <Text color="gray.600">Monitor your fitness journey and achievements</Text>
        </Box>
        <Select w="200px" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 3 Months</option>
          <option value="180">Last 6 Months</option>
          <option value="365">Last Year</option>
        </Select>
      </Box>

      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Weight Change</StatLabel>
              <StatNumber>{progressData?.weight_change?.toFixed(1) || 0} kg</StatNumber>
              <StatHelpText>
                {progressData?.weight_change && (
                  <StatArrow type={progressData.weight_change < 0 ? 'decrease' : 'increase'} />
                )}
                {timeRange === '7' ? 'This week' : timeRange === '30' ? 'This month' : 'In period'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Body Fat Change</StatLabel>
              <StatNumber>{progressData?.body_fat_change?.toFixed(1) || 0}%</StatNumber>
              <StatHelpText>
                {progressData?.body_fat_change && (
                  <StatArrow type={progressData.body_fat_change < 0 ? 'decrease' : 'increase'} />
                )}
                {timeRange === '7' ? 'This week' : timeRange === '30' ? 'This month' : 'In period'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Total Workouts</StatLabel>
              <StatNumber>{progressData?.total_workouts || 0}</StatNumber>
              <StatHelpText>
                {progressData?.workout_consistency || 0}% consistency
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Avg. Daily Calories</StatLabel>
              <StatNumber>{progressData?.avg_calories || 0}</StatNumber>
              <StatHelpText>
                Target: {progressData?.target_calories || 2000} kcal
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6} mb={8}>
        {/* Weight Progress */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Weight Progress</Heading>
          </CardHeader>
          <CardBody>
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke="#4F46E5" name="Weight (kg)" strokeWidth={2} />
                  <Line type="monotone" dataKey="goal" stroke="#10B981" name="Goal" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Center h="300px">
                <Text color="gray.500">No weight data available</Text>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Body Fat Progress */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Body Fat Percentage</Heading>
          </CardHeader>
          <CardBody>
            {bodyFatData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bodyFatData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="bodyFat" stroke="#F59E0B" name="Body Fat %" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Center h="300px">
                <Text color="gray.500">No body fat data available</Text>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Workout Frequency */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Workout Frequency</Heading>
          </CardHeader>
          <CardBody>
            {workoutData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workoutData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8B5CF6" name="Workouts" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Center h="300px">
                <Text color="gray.500">No workout data available</Text>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Calorie Trends */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Calorie Intake</Heading>
          </CardHeader>
          <CardBody>
            {calorieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={calorieData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="calories" stroke="#EF4444" name="Calories" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" stroke="#10B981" name="Target" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Center h="300px">
                <Text color="gray.500">No calorie data available</Text>
              </Center>
            )}
          </CardBody>
        </Card>
      </Grid>

      {/* Goals & Achievements */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        {/* Current Goals */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Current Goals</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={1} spacing={4}>
              <Box p={4} borderWidth="1px" borderRadius="md">
                <Text fontWeight="medium" mb={2}>Weight Goal</Text>
                <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                  {progressData?.weight_goal || 'Not set'} kg
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Current: {progressData?.current_weight || 0} kg
                </Text>
              </Box>
              <Box p={4} borderWidth="1px" borderRadius="md">
                <Text fontWeight="medium" mb={2}>Body Fat Goal</Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {progressData?.body_fat_goal || 'Not set'}%
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Current: {progressData?.current_body_fat || 0}%
                </Text>
              </Box>
              <Box p={4} borderWidth="1px" borderRadius="md">
                <Text fontWeight="medium" mb={2}>Weekly Workout Goal</Text>
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {progressData?.workout_goal || 5} sessions
                </Text>
                <Text fontSize="sm" color="gray.600">
                  This week: {progressData?.workouts_this_week || 0}
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Achievements */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Recent Achievements</Heading>
          </CardHeader>
          <CardBody>
            {progressData?.achievements?.length > 0 ? (
              <SimpleGrid columns={1} spacing={3}>
                {progressData.achievements.map((achievement, index) => (
                  <Box key={index} p={3} bg="brand.50" borderRadius="md" borderLeft="4px" borderColor="brand.500">
                    <Text fontWeight="medium" mb={1}>{achievement.title}</Text>
                    <Text fontSize="sm" color="gray.600">{achievement.description}</Text>
                    <Badge colorScheme="brand" mt={2}>{formatDate(achievement.date)}</Badge>
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Center py={8}>
                <Text color="gray.500">No achievements yet. Keep working towards your goals!</Text>
              </Center>
            )}
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
};

export default Progress;
