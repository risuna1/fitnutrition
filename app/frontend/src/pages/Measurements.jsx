import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import measurementsService from '../services/measurements';
import { formatDate, calculateBMI, calculateBMR, calculateTDEE } from '../utils/helpers';

const Measurements = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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
  }, []);

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      const response = await measurementsService.getMeasurements();
      setMeasurements(response.data.results || response.data);
    } catch (error) {
      toast({
        title: '測定値の読み込みエラー',
        description: error.response?.data?.detail || 'データの読み込みに失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
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
      await measurementsService.createMeasurement(formData);
      toast({
        title: '測定値を追加しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      loadMeasurements();
      setFormData({
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
    } catch (error) {
      toast({
        title: '測定値の追加エラー',
        description: error.response?.data?.detail || '測定値の追加に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const latestMeasurement = measurements[0];
  const bmi = latestMeasurement ? calculateBMI(latestMeasurement.weight, latestMeasurement.height) : null;
  const bmr = latestMeasurement ? calculateBMR(latestMeasurement.weight, latestMeasurement.height, 28, 'M') : null;
  const tdee = bmr ? calculateTDEE(bmr, 'moderate') : null;

  // Prepare chart data
  const chartData = measurements.slice(0, 10).reverse().map(m => ({
    date: formatDate(m.date),
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
      <Box mb={8} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Heading size="lg" mb={2}>身体測定</Heading>
          <Text color="gray.600">体組成と進捗を記録</Text>
        </Box>
        <Button colorScheme="brand" onClick={onOpen}>
          測定値を追加
        </Button>
      </Box>

      {/* Stats Cards */}
      {latestMeasurement && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>現在の体重</StatLabel>
                <StatNumber>{latestMeasurement.weight} kg</StatNumber>
                <StatHelpText>{formatDate(latestMeasurement.date)}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>BMI</StatLabel>
                <StatNumber>{bmi?.toFixed(1)}</StatNumber>
                <StatHelpText>
                  <Badge colorScheme={bmi < 18.5 ? 'yellow' : bmi < 25 ? 'green' : bmi < 30 ? 'orange' : 'red'}>
                    {bmi < 18.5 ? '低体重' : bmi < 25 ? '標準' : bmi < 30 ? '過体重' : '肥満'}
                  </Badge>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>基礎代謝量</StatLabel>
                <StatNumber>{bmr?.toFixed(0)} kcal</StatNumber>
                <StatHelpText>BMR</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>1日の消費カロリー</StatLabel>
                <StatNumber>{tdee?.toFixed(0)} kcal</StatNumber>
                <StatHelpText>TDEE</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Weight Chart */}
      {chartData.length > 0 && (
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} mb={8}>
          <CardHeader>
            <Heading size="md">体重の推移</Heading>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#4F46E5" name="体重 (kg)" />
                {chartData[0].bodyFat && (
                  <Line type="monotone" dataKey="bodyFat" stroke="#10B981" name="体脂肪率 %" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {/* Measurements History */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">測定履歴</Heading>
        </CardHeader>
        <CardBody>
          {measurements.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>日付</Th>
                    <Th isNumeric>体重 (kg)</Th>
                    <Th isNumeric>身長 (cm)</Th>
                    <Th isNumeric>体脂肪率 %</Th>
                    <Th isNumeric>BMI</Th>
                    <Th isNumeric>ウエスト (cm)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {measurements.map((measurement) => (
                    <Tr key={measurement.id}>
                      <Td>{formatDate(measurement.date)}</Td>
                      <Td isNumeric>{measurement.weight}</Td>
                      <Td isNumeric>{measurement.height}</Td>
                      <Td isNumeric>{measurement.body_fat_percentage || '-'}</Td>
                      <Td isNumeric>{calculateBMI(measurement.weight, measurement.height).toFixed(1)}</Td>
                      <Td isNumeric>{measurement.waist || '-'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Center py={8}>
              <Text color="gray.500">まだ測定値がありません。最初の測定値を追加しましょう！</Text>
            </Center>
          )}
        </CardBody>
      </Card>

      {/* Add Measurement Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>新しい測定値を追加</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <FormControl isRequired>
                  <FormLabel>体重 (kg)</FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="70.5"
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
                  />
                </FormControl>
              </Grid>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                キャンセル
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={submitting}>
                測定値を追加
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Measurements;
