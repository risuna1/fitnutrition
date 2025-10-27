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
} from '@chakra-ui/react';
import { FiActivity, FiTrendingDown, FiTarget, FiCalendar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import analyticsService from '../services/analytics';
import measurementsService from '../services/measurements';
import { formatDate, calculateBMI } from '../utils/helpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [latestMeasurement, setLatestMeasurement] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, measurementResponse] = await Promise.all([
        analyticsService.getDashboard(),
        measurementsService.getLatestMeasurement(),
      ]);
      setDashboardData(dashboardResponse.data);
      setLatestMeasurement(measurementResponse.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
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

  const bmi = latestMeasurement ? calculateBMI(latestMeasurement.weight, latestMeasurement.height) : null;

  return (
    <Box>
      {/* Header */}
      <Box mb={8}>
        <Heading size="lg" mb={2}>Dashboard</Heading>
        <Text color="gray.600">Welcome back! Here's your fitness overview.</Text>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {/* Current Weight */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Current Weight</StatLabel>
              <StatNumber>{latestMeasurement?.weight || 'N/A'} kg</StatNumber>
              <StatHelpText>
                {dashboardData?.weight_change && (
                  <>
                    <StatArrow type={dashboardData.weight_change > 0 ? 'increase' : 'decrease'} />
                    {Math.abs(dashboardData.weight_change).toFixed(1)} kg this month
                  </>
                )}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* BMI */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>BMI</StatLabel>
              <StatNumber>{bmi ? bmi.toFixed(1) : 'N/A'}</StatNumber>
              <StatHelpText>
                {bmi && (
                  <Badge colorScheme={bmi < 18.5 ? 'yellow' : bmi < 25 ? 'green' : bmi < 30 ? 'orange' : 'red'}>
                    {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'}
                  </Badge>
                )}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* Today's Calories */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Today's Calories</StatLabel>
              <StatNumber>{dashboardData?.today_calories || 0}</StatNumber>
              <StatHelpText>
                Target: {dashboardData?.target_calories || 2000} kcal
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* Workouts This Week */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Workouts This Week</StatLabel>
              <StatNumber>{dashboardData?.workouts_this_week || 0}</StatNumber>
              <StatHelpText>
                Goal: {dashboardData?.workout_goal || 5} per week
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Quick Actions & Recent Activity */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        {/* Recent Activity */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Recent Activity</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              {dashboardData?.recent_activities?.length > 0 ? (
                dashboardData.recent_activities.map((activity, index) => (
                  <HStack key={index} p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                    <Icon as={FiActivity} color="brand.500" boxSize={5} />
                    <Box flex="1">
                      <Text fontWeight="medium">{activity.title}</Text>
                      <Text fontSize="sm" color="gray.600">{activity.description}</Text>
                    </Box>
                    <Text fontSize="sm" color="gray.500">{formatDate(activity.date)}</Text>
                  </HStack>
                ))
              ) : (
                <Center py={8}>
                  <VStack>
                    <Icon as={FiActivity} boxSize={12} color="gray.400" />
                    <Text color="gray.500">No recent activity</Text>
                    <Button colorScheme="brand" size="sm" onClick={() => navigate('/workouts')}>
                      Log Your First Workout
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
            <Heading size="md">Quick Actions</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3}>
              <Button
                w="full"
                leftIcon={<FiActivity />}
                colorScheme="brand"
                onClick={() => navigate('/measurements')}
              >
                Log Measurement
              </Button>
              <Button
                w="full"
                leftIcon={<FiCalendar />}
                variant="outline"
                colorScheme="brand"
                onClick={() => navigate('/workouts')}
              >
                Log Workout
              </Button>
              <Button
                w="full"
                leftIcon={<FiTarget />}
                variant="outline"
                colorScheme="brand"
                onClick={() => navigate('/nutrition')}
              >
                Log Meal
              </Button>
              <Button
                w="full"
                leftIcon={<FiTrendingDown />}
                variant="outline"
                colorScheme="brand"
                onClick={() => navigate('/progress')}
              >
                View Progress
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Goals Section */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} mt={6}>
        <CardHeader>
          <Heading size="md">Your Goals</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box>
              <Text fontWeight="medium" mb={2}>Weight Goal</Text>
              <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                {dashboardData?.weight_goal || 'Not set'} kg
              </Text>
              <Text fontSize="sm" color="gray.600">
                {dashboardData?.weight_goal && latestMeasurement?.weight
                  ? `${Math.abs(latestMeasurement.weight - dashboardData.weight_goal).toFixed(1)} kg to go`
                  : 'Set your goal in settings'}
              </Text>
            </Box>
            <Box>
              <Text fontWeight="medium" mb={2}>Daily Calories</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {dashboardData?.target_calories || 2000} kcal
              </Text>
              <Text fontSize="sm" color="gray.600">
                Based on your activity level
              </Text>
            </Box>
            <Box>
              <Text fontWeight="medium" mb={2}>Weekly Workouts</Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {dashboardData?.workout_goal || 5} sessions
              </Text>
              <Text fontSize="sm" color="gray.600">
                {dashboardData?.workouts_this_week || 0} completed this week
              </Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;
