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
  Input,
  HStack,
  Button,
} from '@chakra-ui/react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import analyticsService from '../services/analytics';
import { formatDate } from '../utils/helpers';

const Progress = () => {
  const toast = useToast();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Date range state
  const getDefaultEndDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const getDefaultStartDate = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return thirtyDaysAgo.toISOString().split('T')[0];
  };
  
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  
  const [selectedMealPlan, setSelectedMealPlan] = useState(() => {
    const saved = localStorage.getItem('selectedMealPlan');
    return saved ? JSON.parse(saved) : null;
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadProgressData();
  }, []);

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
    // Validate dates
    if (!startDate || !endDate) {
      toast({
        title: 'エラー',
        description: '開始日と終了日を入力してください',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: 'エラー',
        description: '開始日は終了日より前である必要があります',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      const data = await analyticsService.getProgress({ 
        start_date: startDate,
        end_date: endDate
      });
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
  
  const handleApplyDateRange = () => {
    loadProgressData();
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

  // Format date for chart (more compact)
  const formatChartDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP', { 
      month: 'numeric', 
      day: 'numeric' 
    });
  };

  // Prepare chart data with fallbacks
  const weightData = progressData?.weight_history?.map(item => ({
    date: formatChartDate(item.date),
    fullDate: formatDate(item.date),
    weight: item.weight,
  })) || [];

  const bodyFatData = progressData?.body_fat_history?.map(item => ({
    date: formatChartDate(item.date),
    fullDate: formatDate(item.date),
    bodyFat: item.body_fat_percentage,
  })) || [];

  const exerciseTypeData = progressData?.exercise_types || [];

  const calorieData = progressData?.calorie_trends?.map(item => ({
    date: formatChartDate(item.date),
    fullDate: formatDate(item.date),
    intake: item.intake || 0,
    burned: item.burned || 0,
  })) || [];

  // Calculate Y-axis domains for better visualization
  const getYAxisDomain = (data, dataKey, padding = 20) => {
    if (data.length === 0) return [0, 100];
    const values = data.map(item => item[dataKey]).filter(val => val != null);
    if (values.length === 0) return [0, 100];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const paddingValue = range > 0 ? range * 0.3 : padding; // 30% padding
    return [
      Math.max(0, Math.floor(min - paddingValue)),
      Math.ceil(max + paddingValue)
    ];
  };

  const weightDomain = getYAxisDomain(weightData, 'weight');
  const bodyFatDomain = getYAxisDomain(bodyFatData, 'bodyFat');
  
  // Calculate domain for calorie chart (both intake and burned)
  const getCalorieDomain = () => {
    if (calorieData.length === 0) return [0, 3000];
    const allValues = calorieData.flatMap(item => [item.intake, item.burned]).filter(val => val > 0);
    if (allValues.length === 0) return [0, 3000];
    const max = Math.max(...allValues);
    return [0, Math.ceil(max * 1.2)];
  };
  const calorieDomain = getCalorieDomain();

  // Colors for pie chart
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  console.log('Chart data prepared:', { weightData, bodyFatData, exerciseTypeData, calorieData }); // Debug log
  console.log('Progress data full:', progressData); // Debug log

  return (
    <Box>
      {/* Header */}
      <Box mb={{ base: 4, md: 6, lg: 8 }}>
        <Box mb={4}>
          <Heading size={{ base: "sm", md: "md" }} mb={2}>進捗追跡</Heading>
          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">フィットネスの進捗と達成状況を確認</Text>
        </Box>
        
        {/* Date Range Picker */}
        <Box 
          display="flex" 
          flexDirection={{ base: "column", sm: "row" }} 
          gap={3} 
          alignItems={{ base: "stretch", sm: "center" }}
          p={4}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
        >
          <HStack spacing={2} flex="1" flexWrap={{ base: "wrap", sm: "nowrap" }}>
            <Box flex="1" minW="150px">
              <Text fontSize="sm" mb={1} fontWeight="medium">開始日</Text>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size={{ base: "sm", md: "md" }}
              />
            </Box>
            <Text pt={{ base: 0, sm: 6 }} fontSize="lg" fontWeight="bold">〜</Text>
            <Box flex="1" minW="150px">
              <Text fontSize="sm" mb={1} fontWeight="medium">終了日</Text>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size={{ base: "sm", md: "md" }}
              />
            </Box>
          </HStack>
          <Button
            colorScheme="brand"
            onClick={handleApplyDateRange}
            size={{ base: "sm", md: "md" }}
            mt={{ base: 2, sm: 6 }}
            minW="100px"
          >
            適用
          </Button>
        </Box>
      </Box>

      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 4, lg: 6 }} mb={{ base: 4, md: 6, lg: 8 }}>
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>体重変化</StatLabel>
              <StatNumber>{progressData?.weight_change?.toFixed(1) || 0} kg</StatNumber>
              <StatHelpText>
                {progressData?.weight_change && (
                  <StatArrow type={progressData.weight_change < 0 ? 'decrease' : 'increase'} />
                )}
                期間内
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
                期間内
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
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={{ base: 3, md: 4, lg: 6 }} mb={{ base: 4, md: 6, lg: 8 }}>
        {/* Weight Progress */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">体重の推移</Heading>
          </CardHeader>
          <CardBody px={{ base: 2, md: 4 }} py={{ base: 3, md: 4 }}>
            {weightData.length > 0 ? (
              <Box height={{ base: "250px", md: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData} margin={{ bottom: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis domain={weightDomain} />
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label, payload) => 
                        payload && payload[0] ? payload[0].payload.fullDate : label
                      }
                    />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="#4F46E5" name="体重 (kg)" strokeWidth={2} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
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
          <CardBody px={{ base: 2, md: 4 }} py={{ base: 3, md: 4 }}>
            {bodyFatData.length > 0 ? (
              <Box height={{ base: "250px", md: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bodyFatData} margin={{ bottom: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis domain={bodyFatDomain} />
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label, payload) => 
                        payload && payload[0] ? payload[0].payload.fullDate : label
                      }
                    />
                    <Legend />
                    <Line type="monotone" dataKey="bodyFat" stroke="#F59E0B" name="体脂肪率 %" strokeWidth={2} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Center h="300px">
                <Text color="gray.500">体脂肪データがありません</Text>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Exercise Type Distribution */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">エクササイズタイプ</Heading>
          </CardHeader>
          <CardBody px={{ base: 2, md: 4 }} py={{ base: 3, md: 4 }}>
            {exerciseTypeData.length > 0 ? (
              <Box height={{ base: "250px", md: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={exerciseTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {exerciseTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Center h="300px" flexDirection="column">
                <Text color="gray.500" mb={2}>エクササイズデータがありません</Text>
                <Text fontSize="sm" color="gray.400">
                  ワークアウトを記録してエクササイズタイプの分布を確認しましょう
                </Text>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Calorie Intake vs Burned */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">摂取カロリー 対 消費カロリー</Heading>
          </CardHeader>
          <CardBody px={{ base: 2, md: 4 }} py={{ base: 3, md: 4 }}>
            {calorieData.length > 0 ? (
              <Box height={{ base: "250px", md: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calorieData} margin={{ bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis domain={calorieDomain} />
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label, payload) => 
                        payload && payload[0] ? payload[0].payload.fullDate : label
                      }
                    />
                    <Legend />
                    <Bar dataKey="intake" fill="#EF4444" name="摂取カロリー" />
                    <Bar dataKey="burned" fill="#3B82F6" name="消費カロリー" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Center h="300px">
                <Text color="gray.500">カロリーデータがありません</Text>
              </Center>
            )}
          </CardBody>
        </Card>
      </Grid>

      {/* Goals & Achievements */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={{ base: 3, md: 4, lg: 6 }}>
        {/* Current Goals */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">現在の目標</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={1} spacing={4}>
              <Box p={4} borderWidth="1px" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" mb={2}>体重目標</Text>
                <Text fontSize="xl" fontWeight="bold" color="brand.500">
                  {progressData?.weight_goal || '未設定'} kg
                </Text>
                <Text fontSize="xs" color="gray.600">
                  現在: {progressData?.current_weight || 0} kg
                </Text>
              </Box>
              <Box p={4} borderWidth="1px" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" mb={2}>体脂肪率目標</Text>
                <Text fontSize="xl" fontWeight="bold" color="orange.500">
                  {progressData?.body_fat_goal || '未設定'}%
                </Text>
                <Text fontSize="xs" color="gray.600">
                  現在: {progressData?.current_body_fat || 0}%
                </Text>
              </Box>
              <Box p={4} borderWidth="1px" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" mb={2}>週間ワークアウト目標</Text>
                <Text fontSize="xl" fontWeight="bold" color="purple.500">
                  {progressData?.workout_goal || 5} 回
                </Text>
                <Text fontSize="xs" color="gray.600">
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
