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
        <Heading size="lg" mb={2}>ダッシュボード</Heading>
        <Text color="gray.600">おかえりなさい！フィットネスの概要です。</Text>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {/* Current Weight */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>現在の体重</StatLabel>
              <StatNumber>{latestMeasurement?.weight || 'N/A'} kg</StatNumber>
              <StatHelpText>
                {dashboardData?.weight_change && (
                  <>
                    <StatArrow type={dashboardData.weight_change > 0 ? 'increase' : 'decrease'} />
                    今月 {Math.abs(dashboardData.weight_change).toFixed(1)} kg
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
                    {bmi < 18.5 ? '低体重' : bmi < 25 ? '標準' : bmi < 30 ? '過体重' : '肥満'}
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
              <StatLabel>今日のカロリー</StatLabel>
              <StatNumber>{dashboardData?.today_calories || 0}</StatNumber>
              <StatHelpText>
                目標: {dashboardData?.target_calories || 2000} kcal
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* Workouts This Week */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>今週のワークアウト</StatLabel>
              <StatNumber>{dashboardData?.workouts_this_week || 0}</StatNumber>
              <StatHelpText>
                目標: 週{dashboardData?.workout_goal || 5}回
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
            <Heading size="md">最近のアクティビティ</Heading>
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
                    <Text color="gray.500">最近のアクティビティはありません</Text>
                    <Button colorScheme="brand" size="sm" onClick={() => navigate('/workouts')}>
                      最初のワークアウトを記録
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
                {dashboardData?.weight_goal || '未設定'} kg
              </Text>
              <Text fontSize="sm" color="gray.600">
                {dashboardData?.weight_goal && latestMeasurement?.weight
                  ? `あと${Math.abs(latestMeasurement.weight - dashboardData.weight_goal).toFixed(1)} kg`
                  : '設定で目標を設定してください'}
              </Text>
            </Box>
            <Box>
              <Text fontWeight="medium" mb={2}>1日のカロリー</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {dashboardData?.target_calories || 2000} kcal
              </Text>
              <Text fontSize="sm" color="gray.600">
                活動レベルに基づく
              </Text>
            </Box>
            <Box>
              <Text fontWeight="medium" mb={2}>週間ワークアウト</Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {dashboardData?.workout_goal || 5} セッション
              </Text>
              <Text fontSize="sm" color="gray.600">
                今週{dashboardData?.workouts_this_week || 0}回完了
              </Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;
