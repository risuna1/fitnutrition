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
} from '@chakra-ui/react';
import { FiPlus, FiCheck, FiClock, FiActivity } from 'react-icons/fi';
import workoutsService from '../services/workouts';
import { formatDate } from '../utils/helpers';

const Workouts = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    notes: '',
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workoutsResponse, exercisesResponse, plansResponse] = await Promise.all([
        workoutsService.getWorkouts(),
        workoutsService.getExercises(),
        workoutsService.getWorkoutPlans(),
      ]);
      setWorkouts(workoutsResponse.data.results || workoutsResponse.data);
      setExercises(exercisesResponse.data.results || exercisesResponse.data);
      setPlans(plansResponse.data.results || plansResponse.data);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleExerciseSelect = (exercise) => {
    setSelectedExercises([...selectedExercises, { ...exercise, sets: 3, reps: 10, weight: 0 }]);
  };

  const handleExerciseRemove = (index) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleExerciseUpdate = (index, field, value) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[index][field] = value;
    setSelectedExercises(updatedExercises);
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
      const workoutData = {
        ...formData,
        exercises: selectedExercises.map(ex => ({
          exercise: ex.id,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
        })),
      };

      await workoutsService.createWorkout(workoutData);
      toast({
        title: 'ワークアウトを記録しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      loadData();
      setSelectedExercises([]);
      setFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        duration: '',
        notes: '',
      });
    } catch (error) {
      toast({
        title: 'ワークアウト記録エラー',
        description: error.response?.data?.detail || 'ワークアウトの記録に失敗しました',
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

  const totalDuration = thisWeekWorkouts.reduce((total, workout) => total + workout.duration, 0);
  const totalCalories = thisWeekWorkouts.reduce((total, workout) => total + workout.calories_burned, 0);

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
          <Heading size="lg" mb={2}>ワークアウト</Heading>
          <Text color="gray.600">エクササイズとワークアウトセッションを記録</Text>
        </Box>
        <Button colorScheme="brand" onClick={onOpen}>
          <Icon as={FiPlus} mr={2} />
          ワークアウトを記録
        </Button>
      </Box>

      {/* Weekly Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>今週</StatLabel>
              <StatNumber>{thisWeekWorkouts.length}</StatNumber>
              <StatHelpText>完了したワークアウト</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>合計時間</StatLabel>
              <StatNumber>{totalDuration} 分</StatNumber>
              <StatHelpText>今週</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>消費カロリー</StatLabel>
              <StatNumber>{totalCalories}</StatNumber>
              <StatHelpText>今週</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>平均時間</StatLabel>
              <StatNumber>
                {thisWeekWorkouts.length > 0 ? Math.round(totalDuration / thisWeekWorkouts.length) : 0} 分
              </StatNumber>
              <StatHelpText>1回あたり</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        {/* Workout History */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">最近のワークアウト</Heading>
          </CardHeader>
          <CardBody>
            {workouts.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {workouts.slice(0, 10).map((workout) => (
                  <Box key={workout.id} p={4} borderWidth="1px" borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Heading size="sm">{workout.name}</Heading>
                      <Badge colorScheme="brand">{formatDate(workout.date)}</Badge>
                    </HStack>
                    <HStack spacing={4} fontSize="sm" color="gray.600">
                      <HStack>
                        <Icon as={FiClock} />
                        <Text>{workout.duration} 分</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiActivity} />
                        <Text>{workout.exercises.length} 種目</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiCheck} />
                        <Text>{workout.calories_burned} kcal</Text>
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
              <Center py={8}>
                <VStack>
                  <Text color="gray.500">まだワークアウトが記録されていません</Text>
                  <Button colorScheme="brand" size="sm" onClick={onOpen}>
                    最初のワークアウトを記録
                  </Button>
                </VStack>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Workout Plans */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">ワークアウトプラン</Heading>
          </CardHeader>
          <CardBody>
            {plans.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {plans.map((plan) => (
                  <Box key={plan.id} p={3} borderWidth="1px" borderRadius="md" cursor="pointer" _hover={{ bg: 'gray.50' }}>
                    <Text fontWeight="medium" mb={1}>{plan.name}</Text>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      {plan.description}
                    </Text>
                    <HStack fontSize="xs" color="gray.500">
                      <Text>{plan.duration_weeks} 週間</Text>
                      <Text>•</Text>
                      <Text>{plan.exercises_count} 種目</Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Center py={8}>
                <Text color="gray.500" fontSize="sm">利用可能なワークアウトプランがありません</Text>
              </Center>
            )}
          </CardBody>
        </Card>
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
                              <HStack key={index} p={3} bg="gray.50" borderRadius="md">
                                <Box flex="1">
                                  <Text fontWeight="medium" fontSize="sm">{exercise.name}</Text>
                                </Box>
                                <Input
                                  type="number"
                                  size="sm"
                                  width="60px"
                                  value={exercise.sets}
                                  onChange={(e) => handleExerciseUpdate(index, 'sets', parseInt(e.target.value))}
                                  placeholder="セット"
                                />
                                <Input
                                  type="number"
                                  size="sm"
                                  width="60px"
                                  value={exercise.reps}
                                  onChange={(e) => handleExerciseUpdate(index, 'reps', parseInt(e.target.value))}
                                  placeholder="回数"
                                />
                                <Input
                                  type="number"
                                  size="sm"
                                  width="70px"
                                  value={exercise.weight}
                                  onChange={(e) => handleExerciseUpdate(index, 'weight', parseFloat(e.target.value))}
                                  placeholder="重量"
                                />
                                <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleExerciseRemove(index)}>
                                  ×
                                </Button>
                              </HStack>
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
                        {exercises.slice(0, 20).map((exercise) => (
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
    </Box>
  );
};

export default Workouts;
