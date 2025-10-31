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
        title: 'Error loading data',
        description: error.response?.data?.detail || 'Failed to load workout data',
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
        title: 'No exercises selected',
        description: 'Please add at least one exercise',
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
        title: 'Workout logged',
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
        title: 'Error logging workout',
        description: error.response?.data?.detail || 'Failed to log workout',
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
          <Heading size="lg" mb={2}>Workouts</Heading>
          <Text color="gray.600">Track your exercises and workout sessions</Text>
        </Box>
        <Button colorScheme="brand" onClick={onOpen}>
          <Icon as={FiPlus} mr={2} />
          Log Workout
        </Button>
      </Box>

      {/* Weekly Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>This Week</StatLabel>
              <StatNumber>{thisWeekWorkouts.length}</StatNumber>
              <StatHelpText>Workouts completed</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Total Duration</StatLabel>
              <StatNumber>{totalDuration} min</StatNumber>
              <StatHelpText>This week</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Calories Burned</StatLabel>
              <StatNumber>{totalCalories}</StatNumber>
              <StatHelpText>This week</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Avg. Duration</StatLabel>
              <StatNumber>
                {thisWeekWorkouts.length > 0 ? Math.round(totalDuration / thisWeekWorkouts.length) : 0} min
              </StatNumber>
              <StatHelpText>Per workout</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        {/* Workout History */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Recent Workouts</Heading>
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
                        <Text>{workout.duration} min</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiActivity} />
                        <Text>{workout.exercises.length} exercises</Text>
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
                  <Text color="gray.500">No workouts logged yet</Text>
                  <Button colorScheme="brand" size="sm" onClick={onOpen}>
                    Log Your First Workout
                  </Button>
                </VStack>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Workout Plans */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Workout Plans</Heading>
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
                      <Text>{plan.duration_weeks} weeks</Text>
                      <Text>•</Text>
                      <Text>{plan.exercises_count} exercises</Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Center py={8}>
                <Text color="gray.500" fontSize="sm">No workout plans available</Text>
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
            <ModalHeader>Log Workout</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Tabs>
                <TabList>
                  <Tab>Workout Details</Tab>
                  <Tab>Add Exercises</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Workout Name</FormLabel>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g., Upper Body Strength"
                        />
                      </FormControl>

                      <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                        <FormControl isRequired>
                          <FormLabel>Date</FormLabel>
                          <Input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Duration (minutes)</FormLabel>
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
                        <FormLabel>Notes</FormLabel>
                        <Textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="How did you feel? Any observations?"
                        />
                      </FormControl>

                      {/* Selected Exercises */}
                      <Box w="full">
                        <Heading size="sm" mb={3}>Selected Exercises ({selectedExercises.length})</Heading>
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
                                  placeholder="Sets"
                                />
                                <Input
                                  type="number"
                                  size="sm"
                                  width="60px"
                                  value={exercise.reps}
                                  onChange={(e) => handleExerciseUpdate(index, 'reps', parseInt(e.target.value))}
                                  placeholder="Reps"
                                />
                                <Input
                                  type="number"
                                  size="sm"
                                  width="70px"
                                  value={exercise.weight}
                                  onChange={(e) => handleExerciseUpdate(index, 'weight', parseFloat(e.target.value))}
                                  placeholder="Weight"
                                />
                                <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleExerciseRemove(index)}>
                                  ×
                                </Button>
                              </HStack>
                            ))}
                          </VStack>
                        ) : (
                          <Text fontSize="sm" color="gray.500">No exercises selected. Go to "Add Exercises" tab.</Text>
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
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={submitting}>
                Log Workout
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Workouts;
