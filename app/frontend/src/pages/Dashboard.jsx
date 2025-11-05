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
} from '@chakra-ui/react';
import { FiActivity, FiTrendingDown, FiTarget, FiCalendar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import analyticsService from '../services/analytics';
import measurementsService from '../services/measurements';
import { formatDate, calculateBMI } from '../utils/helpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [latestMeasurement, setLatestMeasurement] = useState(null);
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

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {/* Current Weight */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>現在の体重</StatLabel>
              <StatNumber>{latestMeasurement?.weight || dashboardData?.goal_progress?.current_weight || 'N/A'} kg</StatNumber>
              <StatHelpText>
                {dashboardData?.recent_progress?.weight_progress?.weight_change && (
                  <>
                    <StatArrow type={dashboardData.recent_progress.weight_progress.weight_change > 0 ? 'increase' : 'decrease'} />
                    今週 {Math.abs(dashboardData.recent_progress.weight_progress.weight_change).toFixed(1)} kg
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
              <StatNumber>{dashboardData?.metabolism?.bmi ? dashboardData.metabolism.bmi.toFixed(1) : (bmi ? bmi.toFixed(1) : 'N/A')}</StatNumber>
              {/* <StatHelpText>
                {(dashboardData?.metabolism?.bmi_category || (bmi && (
                  <Badge colorScheme={bmi < 18.5 ? 'yellow' : bmi < 25 ? 'green' : bmi < 30 ? 'orange' : 'red'}>
                    {bmi < 18.5 ? '低体重' : bmi < 25 ? '標準' : bmi < 30 ? '過体重' : '肥満'}
                  </Badge>
                )))}
                {dashboardData?.metabolism?.bmi_category && (
                  <Badge colorScheme="green">{dashboardData.metabolism.bmi_category}</Badge>
                )}
              </StatHelpText> */}
              <StatHelpText>
                <Badge colorScheme={bmi < 18.5 ? 'yellow' : bmi < 25 ? 'green' : bmi < 30 ? 'orange' : 'red'}>
                  {bmi < 18.5 ? '低体重' : bmi < 25 ? '標準' : bmi < 30 ? '過体重' : '肥満'}
                </Badge>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* TDEE */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>1日の消費カロリー</StatLabel>
              <StatNumber>{dashboardData?.metabolism?.tdee ? Math.round(dashboardData.metabolism.tdee) : 'N/A'}</StatNumber>
              <StatHelpText>
                TDEE (活動量込み)
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* Goal Progress */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>目標達成率</StatLabel>
              <StatNumber>{dashboardData?.goal_progress?.progress_percentage ? `${dashboardData.goal_progress.progress_percentage.toFixed(1)}%` : 'N/A'}</StatNumber>
              <StatHelpText>
                目標: {dashboardData?.goal_progress?.target_weight || 'N/A'} kg
              </StatHelpText>
            </Stat>
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
