import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  Grid,
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
  IconButton,
  HStack,
  Icon,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { FiActivity, FiPercent, FiZap, FiTrendingUp } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import measurementsService from '../services/measurements';
import analyticsService from '../services/analytics';
import { formatDate, calculateBMI, calculateBMR, calculateTDEE } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';

const Measurements = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();
  const { user } = useAuthStore();
  const [measurements, setMeasurements] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    weight: '',
    height: '',
    body_fat_percentage: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
    calves: '',
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadMeasurements();
    loadDashboardData();
  }, []);

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      const response = await measurementsService.getMeasurements();
      
      // Handle paginated response from DRF
      const data = response?.results || response || [];
      setMeasurements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load measurements error:', error);
      toast({
        title: '測定値の読み込みエラー',
        description: error.response?.data?.detail || 'データの読み込みに失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setMeasurements([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const dashboardResponse = await analyticsService.getDashboard();
      const data = dashboardResponse.data || dashboardResponse;
      console.log('Dashboard data for Measurements:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData(null);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Filter out empty string values before sending to API
      const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
        // Only include non-empty values
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      if (editingId) {
        // Update existing measurement
        await measurementsService.updateMeasurement(editingId, cleanedData);
        toast({
          title: '測定値を更新しました',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new measurement
        await measurementsService.createMeasurement(cleanedData);
        toast({
          title: '測定値を追加しました',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      loadMeasurements();
      loadDashboardData(); // Reload dashboard data to update BMR and TDEE
      resetForm();
    } catch (error) {
      toast({
        title: editingId ? '測定値の更新エラー' : '測定値の追加エラー',
        description: error.response?.data?.detail || '操作に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      weight: '',
      height: '',
      body_fat_percentage: '',
      chest: '',
      waist: '',
      hips: '',
      arms: '',
      thighs: '',
      calves: '',
    });
    setEditingId(null);
  };

  const handleEdit = async (measurement) => {
    try {
      // Fetch full measurement details from API
      const fullMeasurement = await measurementsService.getById(measurement.id);
      console.log('Full measurement data:', fullMeasurement); // Debug log
      
      // For arms, thighs, calves - use left value, or right value, or average if both exist
      const getAverageOrValue = (left, right) => {
        if (left && right) {
          return ((parseFloat(left) + parseFloat(right)) / 2).toFixed(1);
        }
        return left || right || '';
      };
      
      const formValues = {
        date: fullMeasurement.date || '',
        weight: fullMeasurement.weight || '',
        height: fullMeasurement.height || '',
        body_fat_percentage: fullMeasurement.body_fat_percentage || '',
        chest: fullMeasurement.chest || '',
        waist: fullMeasurement.waist || '',
        hips: fullMeasurement.hips || '',
        arms: getAverageOrValue(fullMeasurement.arms_left, fullMeasurement.arms_right),
        thighs: getAverageOrValue(fullMeasurement.thighs_left, fullMeasurement.thighs_right),
        calves: getAverageOrValue(fullMeasurement.calves_left, fullMeasurement.calves_right),
      };
      
      console.log('Form values:', formValues); // Debug log
      setEditingId(measurement.id);
      setFormData(formValues);
      onOpen();
    } catch (error) {
      console.error('Error fetching measurement details:', error);
      toast({
        title: 'データ取得エラー',
        description: '測定値の詳細を取得できませんでした',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    try {
      await measurementsService.deleteMeasurement(deleteId);
      toast({
        title: '測定値を削除しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadMeasurements();
      loadDashboardData(); // Reload dashboard data to update BMR and TDEE
      onDeleteClose();
    } catch (error) {
      toast({
        title: '削除エラー',
        description: error.response?.data?.detail || '削除に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  const latestMeasurement = measurements[0];
  const bmi = latestMeasurement ? parseFloat(calculateBMI(latestMeasurement.weight, latestMeasurement.height)) : null;
  
  // Calculate age from date_of_birth
  const calculateAge = (dob) => {
    if (!dob) return 25; // Default age
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  // Get user data from profile
  const userAge = user?.date_of_birth ? calculateAge(user.date_of_birth) : 25;
  const userGender = user?.profile?.gender || 'male';
  const userActivityLevel = user?.profile?.activity_level || 'moderate';
  
  // Use BMR and TDEE from dashboard data (same calculation as Dashboard page)
  const bmr = dashboardData?.metabolism?.bmr || null;
  const tdee = dashboardData?.metabolism?.tdee || null;

  // Format date for chart (more compact)
  const formatChartDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP', { 
      month: 'numeric', 
      day: 'numeric' 
    });
  };

  // Prepare chart data - show more data points for better visibility
  const maxChartPoints = measurements.length <= 30 ? measurements.length : 30; // Show all if 30 or fewer, otherwise limit to 30
  const chartData = measurements
    .slice(0, maxChartPoints) // Show more data points (up to 30)
    .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by date ascending for proper chart display
    .map(m => ({
      date: formatChartDate(m.date), // Use compact date format for chart
      fullDate: formatDate(m.date), // Keep full date for tooltip
      weight: m.weight,
      bodyFat: m.body_fat_percentage,
    }));

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
      <Box mb={{ base: 4, md: 6, lg: 8 }} display="flex" flexDirection={{ base: "column", sm: "row" }} justifyContent="space-between" alignItems={{ base: "flex-start", sm: "center" }} gap={{ base: 3, sm: 0 }}>
        <Box>
          <Heading size={{ base: "md", md: "lg" }} mb={2}>身体測定</Heading>
          <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>体組成と進捗を記録</Text>
        </Box>
        <Button colorScheme="brand" onClick={onOpen} size={{ base: "sm", md: "md" }} w={{ base: "full", sm: "auto" }}>
          測定値を追加
        </Button>
      </Box>

      {/* Stats Cards */}
      {latestMeasurement && (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 4, lg: 6 }} mb={{ base: 4, md: 6, lg: 8 }}>
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
                    <Text fontSize="xs" color="gray.600" mb={2}>現在の体重</Text>
                  <Text fontSize="2xl" fontWeight="bold" mb={1}>
                    {latestMeasurement.weight} kg
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {formatDate(latestMeasurement.date)}
                  </Text>
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

          {/* Card 2: BMI */}
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
                  <Text fontSize="xs" color="gray.600" mb={2}>BMI</Text>
                  <Text fontSize="2xl" fontWeight="bold" mb={1}>
                    {bmi ? bmi.toFixed(1) : '-'}
                  </Text>
                  <Badge colorScheme={bmi < 18.5 ? 'yellow' : bmi < 25 ? 'green' : bmi < 30 ? 'orange' : 'red'}>
                    {bmi < 18.5 ? '低体重' : bmi < 25 ? '標準' : bmi < 30 ? '過体重' : '肥満'}
                  </Badge>
                </Box>
                <Box
                  bg="green.100"
                  p={3}
                  borderRadius="lg"
                >
                  <Icon as={FiTrendingUp} boxSize={6} color="green.600" />
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {/* Card 3: BMR */}
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
                  <Text fontSize="xs" color="gray.600" mb={2}>基礎代謝量</Text>
                  <Text fontSize="2xl" fontWeight="bold" mb={1}>
                    {bmr ? Math.round(bmr) : '-'}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    BMR (kcal)
                  </Text>
                </Box>
                <Box
                  bg="purple.100"
                  p={3}
                  borderRadius="lg"
                >
                  <Icon as={FiZap} boxSize={6} color="purple.600" />
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {/* Card 4: TDEE */}
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
                  <Text fontSize="xs" color="gray.600" mb={2}>1日の消費カロリー</Text>
                  <Text fontSize="2xl" fontWeight="bold" mb={1}>
                    {tdee ? Math.round(tdee) : '-'}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    TDEE (kcal)
                  </Text>
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
      )}

      {/* Weight Chart */}
      {chartData.length > 0 && (
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} mb={{ base: 4, md: 6, lg: 8 }}>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">体重の推移</Heading>
              <Text fontSize="sm" color="gray.500">
                {chartData.length}件のデータを表示中
              </Text>
            </Flex>
          </CardHeader>
          <CardBody px={{ base: 2, md: 4 }} py={{ base: 3, md: 4 }}>
            <Box height={{ base: "250px", md: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label, payload) => 
                      payload && payload[0] ? payload[0].payload.fullDate : label
                    }
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#4F46E5" 
                    name="体重 (kg)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  {chartData[0]?.bodyFat && (
                    <Line 
                      type="monotone" 
                      dataKey="bodyFat" 
                      stroke="#10B981" 
                      name="体脂肪率 %"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
      )}

      {/* Measurements History */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">測定履歴</Heading>
        </CardHeader>
        <CardBody px={{ base: 0, md: 4 }} py={{ base: 2, md: 4 }}>
          {measurements.length > 0 ? (
            <>
              {/* Desktop View */}
              <Box display={{ base: "none", lg: "block" }}>
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>日付</Th>
                      <Th isNumeric>体重 (kg)</Th>
                      <Th isNumeric>身長 (cm)</Th>
                      <Th isNumeric>体脂肪率 %</Th>
                      <Th isNumeric>BMI</Th>
                      <Th isNumeric>ウエスト (cm)</Th>
                      <Th>操作</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {measurements.map((measurement) => (
                      <Tr key={measurement.id}>
                        <Td>{formatDate(measurement.date)}</Td>
                        <Td isNumeric>{measurement.weight}</Td>
                        <Td isNumeric>{measurement.height}</Td>
                        <Td isNumeric>{measurement.body_fat_percentage || '-'}</Td>
                        <Td isNumeric>{parseFloat(calculateBMI(measurement.weight, measurement.height)).toFixed(1)}</Td>
                        <Td isNumeric>{measurement.waist || '-'}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="編集"
                              icon={<EditIcon />}
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleEdit(measurement)}
                            />
                            <IconButton
                              aria-label="削除"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDeleteClick(measurement.id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              {/* Mobile View - Card Layout */}
              <Box display={{ base: "block", lg: "none" }}>
                {measurements.map((measurement) => (
                  <Card key={measurement.id} mb={3} size="sm" variant="outline">
                    <CardBody>
                      <Flex justify="space-between" align="flex-start" mb={3}>
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="brand.600">
                            {formatDate(measurement.date)}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            BMI: {parseFloat(calculateBMI(measurement.weight, measurement.height)).toFixed(1)}
                          </Text>
                        </Box>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="編集"
                            icon={<EditIcon />}
                            size="xs"
                            colorScheme="blue"
                            onClick={() => handleEdit(measurement)}
                          />
                          <IconButton
                            aria-label="削除"
                            icon={<DeleteIcon />}
                            size="xs"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(measurement.id)}
                          />
                        </HStack>
                      </Flex>
                      <Grid templateColumns="repeat(2, 1fr)" gap={2} fontSize="sm">
                        <Box>
                          <Text color="gray.600" fontSize="xs">体重</Text>
                          <Text fontWeight="semibold">{measurement.weight} kg</Text>
                        </Box>
                        <Box>
                          <Text color="gray.600" fontSize="xs">身長</Text>
                          <Text fontWeight="semibold">{measurement.height} cm</Text>
                        </Box>
                        {measurement.body_fat_percentage && (
                          <Box>
                            <Text color="gray.600" fontSize="xs">体脂肪率</Text>
                            <Text fontWeight="semibold">{measurement.body_fat_percentage}%</Text>
                          </Box>
                        )}
                        {measurement.waist && (
                          <Box>
                            <Text color="gray.600" fontSize="xs">ウエスト</Text>
                            <Text fontWeight="semibold">{measurement.waist} cm</Text>
                          </Box>
                        )}
                      </Grid>
                    </CardBody>
                  </Card>
                ))}
              </Box>
            </>
          ) : (
            <Center py={8}>
              <Text color="gray.500">まだ測定値がありません。最初の測定値を追加しましょう！</Text>
            </Center>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Measurement Modal */}
      <Modal isOpen={isOpen} onClose={handleModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>{editingId ? '測定値を編集' : '新しい測定値を追加'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <FormControl isRequired>
                  <FormLabel>日付</FormLabel>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    isReadOnly={!!editingId}
                    bg={editingId ? 'gray.100' : 'white'}
                    cursor={editingId ? 'not-allowed' : 'text'}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>体重 (kg)</FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="70.5"
                    onKeyPress={(e) => {
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>身長 (cm)</FormLabel>
                  <Input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="175"
                    onKeyPress={(e) => {
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>体脂肪率 %</FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    name="body_fat_percentage"
                    value={formData.body_fat_percentage}
                    onChange={handleChange}
                    placeholder="18.5"
                    onKeyPress={(e) => {
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>胸囲 (cm)</FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    name="chest"
                    value={formData.chest}
                    onChange={handleChange}
                    placeholder="98"
                    onKeyPress={(e) => {
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>ウエスト (cm)</FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    name="waist"
                    value={formData.waist}
                    onChange={handleChange}
                    placeholder="82"
                    onKeyPress={(e) => {
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>ヒップ (cm)</FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    name="hips"
                    value={formData.hips}
                    onChange={handleChange}
                    placeholder="95"
                    onKeyPress={(e) => {
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>腕周り (cm)</FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    name="arms"
                    value={formData.arms}
                    onChange={handleChange}
                    placeholder="35"
                    onKeyPress={(e) => {
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>太もも (cm)</FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    name="thighs"
                    value={formData.thighs}
                    onChange={handleChange}
                    placeholder="58"
                    onKeyPress={(e) => {
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>ふくらはぎ (cm)</FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    name="calves"
                    value={formData.calves}
                    onChange={handleChange}
                    placeholder="38"
                    onKeyPress={(e) => {
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </FormControl>
              </Grid>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleModalClose}>
                キャンセル
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={submitting}>
                {editingId ? '更新' : '追加'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              測定値を削除
            </AlertDialogHeader>

            <AlertDialogBody>
              この測定値を削除してもよろしいですか？この操作は取り消せません。
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                キャンセル
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                削除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Measurements;
