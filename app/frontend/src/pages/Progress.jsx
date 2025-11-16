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
  const [selectedMealPlan, setSelectedMealPlan] = useState(() => {
    const saved = localStorage.getItem('selectedMealPlan');
    return saved ? JSON.parse(saved) : null;
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadProgressData();
  }, [timeRange]);

  // Listen for changes to selected meal plan in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('selectedMealPlan');
      setSelectedMealPlan(saved ? JSON.parse(saved) : null);
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case change happened in same tab
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getProgress({ days: timeRange });
      console.log('Progress data received:', data); // Debug log
      setProgressData(data);
    } catch (error) {
      console.error('Progress data error:', error); // Debug log
      toast({
        title: '進捗データ読み込みエラー',
        description: error.response?.data?.detail || 'データの読み込みに失敗しました',
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

  if (!progressData) {
    return (
      <Box>
        <Heading size="lg" mb={4}>進捗追跡</Heading>
        <Center h="400px" flexDirection="column">
          <Text fontSize="lg" color="gray.600" mb={4}>
            進捗データを読み込めませんでした
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            体重や体脂肪率、ワークアウト、栄養データが必要です。<br/>
            まずはこれらのデータを登録してください。
          </Text>
        </Center>
      </Box>
    );
  }

  // Prepare chart data with fallbacks
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
    target: selectedMealPlan?.daily_calories || selectedMealPlan?.target_calories || progressData.target_calories || 2000,
  })) || [];

  console.log('Chart data prepared:', { weightData, bodyFatData, workoutData, calorieData }); // Debug log

  return (
    <Box>
      {/* Header */}
      <Box mb={8} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Heading size="lg" mb={2}>進捗追跡</Heading>
          <Text color="gray.600">フィットネスの進捗と達成状況を確認</Text>
        </Box>
        <Select w="200px" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="7">過去7日間</option>
          <option value="30">過去30日間</option>
          <option value="90">過去3ヶ月</option>
          <option value="180">過去6ヶ月</option>
          <option value="365">過去1年</option>
        </Select>
      </Box>

      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>体重変化</StatLabel>
              <StatNumber>{progressData?.weight_change?.toFixed(1) || 0} kg</StatNumber>
              <StatHelpText>
                {progressData?.weight_change && (
                  <StatArrow type={progressData.weight_change < 0 ? 'decrease' : 'increase'} />
                )}
                {timeRange === '7' ? '今週' : timeRange === '30' ? '今月' : '期間内'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>体脂肪率変化</StatLabel>
              <StatNumber>{progressData?.body_fat_change?.toFixed(1) || 0}%</StatNumber>
              <StatHelpText>
                {progressData?.body_fat_change && (
                  <StatArrow type={progressData.body_fat_change < 0 ? 'decrease' : 'increase'} />
                )}
                {timeRange === '7' ? '今週' : timeRange === '30' ? '今月' : '期間内'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>総ワークアウト数</StatLabel>
              <StatNumber>{progressData?.total_workouts || 0}</StatNumber>
              <StatHelpText>
                継続率 {progressData?.workout_consistency || 0}%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>平均カロリー摂取</StatLabel>
              <StatNumber>{progressData?.avg_calories || 0}</StatNumber>
              <StatHelpText>
                {selectedMealPlan ? (
                  <>目標: {selectedMealPlan.daily_calories || selectedMealPlan.target_calories || 2000} kcal (プラン: {selectedMealPlan.name})</>
                ) : (
                  <>目標: {progressData?.target_calories || 2000} kcal</>
                )}
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
            <Heading size="md">体重の推移</Heading>
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
                  <Line type="monotone" dataKey="weight" stroke="#4F46E5" name="体重 (kg)" strokeWidth={2} />
                  <Line type="monotone" dataKey="goal" stroke="#10B981" name="目標" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Center h="300px">
                <Text color="gray.500">体重データがありません</Text>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Body Fat Progress */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">体脂肪率</Heading>
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
                  <Line type="monotone" dataKey="bodyFat" stroke="#F59E0B" name="体脂肪率 %" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Center h="300px">
                <Text color="gray.500">体脂肪データがありません</Text>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Workout Frequency */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">ワークアウト頻度</Heading>
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
                  <Bar dataKey="count" fill="#8B5CF6" name="ワークアウト数" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Center h="300px">
                <Text color="gray.500">ワークアウトデータがありません</Text>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Calorie Trends */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">カロリー摂取量</Heading>
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
                  <Line type="monotone" dataKey="calories" stroke="#EF4444" name="カロリー" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" stroke="#10B981" name="目標" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Center h="300px">
                <Text color="gray.500">カロリーデータがありません</Text>
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
            <Heading size="md">現在の目標</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={1} spacing={4}>
              <Box p={4} borderWidth="1px" borderRadius="md">
                <Text fontWeight="medium" mb={2}>体重目標</Text>
                <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                  {progressData?.weight_goal || '未設定'} kg
                </Text>
                <Text fontSize="sm" color="gray.600">
                  現在: {progressData?.current_weight || 0} kg
                </Text>
              </Box>
              <Box p={4} borderWidth="1px" borderRadius="md">
                <Text fontWeight="medium" mb={2}>体脂肪率目標</Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {progressData?.body_fat_goal || '未設定'}%
                </Text>
                <Text fontSize="sm" color="gray.600">
                  現在: {progressData?.current_body_fat || 0}%
                </Text>
              </Box>
              <Box p={4} borderWidth="1px" borderRadius="md">
                <Text fontWeight="medium" mb={2}>週間ワークアウト目標</Text>
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {progressData?.workout_goal || 5} 回
                </Text>
                <Text fontSize="sm" color="gray.600">
                  今週: {progressData?.workouts_this_week || 0}
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Achievements */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">最近の達成</Heading>
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
                <Text color="gray.500">まだ達成がありません。目標に向かって頑張りましょう！</Text>
              </Center>
            )}
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
};

export default Progress;
