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
  useToast,
  Spinner,
  Center,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { FiTarget, FiTrendingUp, FiAward, FiRefreshCw } from 'react-icons/fi';
import recommendationsService from '../services/recommendations';

const Recommendations = () => {
  const toast = useToast();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await recommendationsService.getRecommendations();
      setRecommendations(response.data);
    } catch (error) {
      toast({
        title: 'Error loading recommendations',
        description: error.response?.data?.detail || 'Failed to load recommendations',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewRecommendations = async () => {
    try {
      setGenerating(true);
      await recommendationsService.generateRecommendations();
      toast({
        title: 'Recommendations updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadRecommendations();
    } catch (error) {
      toast({
        title: 'Error generating recommendations',
        description: error.response?.data?.detail || 'Failed to generate recommendations',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setGenerating(false);
    }
  };

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
          <Heading size="lg" mb={2}>AI Recommendations</Heading>
          <Text color="gray.600">Personalized insights and suggestions for your fitness journey</Text>
        </Box>
        <Button
          colorScheme="brand"
          leftIcon={<FiRefreshCw />}
          onClick={generateNewRecommendations}
          isLoading={generating}
        >
          Refresh
        </Button>
      </Box>

      <Tabs colorScheme="brand">
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Workout Plans</Tab>
          <Tab>Meal Plans</Tab>
          <Tab>Tips & Insights</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
              {/* Current Status */}
              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack>
                    <Icon as={FiTarget} color="brand.500" boxSize={6} />
                    <Heading size="md">Your Current Status</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontWeight="medium" mb={2}>Fitness Level</Text>
                      <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                        {recommendations?.fitness_level || 'Intermediate'}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="medium" mb={2}>Primary Goal</Text>
                      <Text color="gray.600">{recommendations?.primary_goal || 'Weight Loss'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium" mb={2}>Progress Rate</Text>
                      <HStack>
                        <Icon as={FiTrendingUp} color="green.500" />
                        <Text color="green.600" fontWeight="medium">
                          {recommendations?.progress_rate || 'On Track'}
                        </Text>
                      </HStack>
                    </Box>
                    <Box>
                      <Text fontWeight="medium" mb={2}>Consistency Score</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                        {recommendations?.consistency_score || 85}%
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Key Recommendations */}
              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack>
                    <Icon as={FiAward} color="purple.500" boxSize={6} />
                    <Heading size="md">Key Recommendations</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    {recommendations?.key_recommendations?.map((rec, index) => (
                      <Box key={index} p={3} bg="purple.50" borderRadius="md" borderLeft="4px" borderColor="purple.500">
                        <Text fontWeight="medium" mb={1}>{rec.title}</Text>
                        <Text fontSize="sm" color="gray.600">{rec.description}</Text>
                      </Box>
                    )) || (
                      <>
                        <Box p={3} bg="purple.50" borderRadius="md" borderLeft="4px" borderColor="purple.500">
                          <Text fontWeight="medium" mb={1}>Increase Protein Intake</Text>
                          <Text fontSize="sm" color="gray.600">
                            Aim for 1.6-2.2g per kg of body weight to support muscle growth
                          </Text>
                        </Box>
                        <Box p={3} bg="blue.50" borderRadius="md" borderLeft="4px" borderColor="blue.500">
                          <Text fontWeight="medium" mb={1}>Add Cardio Sessions</Text>
                          <Text fontSize="sm" color="gray.600">
                            Include 2-3 cardio sessions per week for better fat loss
                          </Text>
                        </Box>
                        <Box p={3} bg="green.50" borderRadius="md" borderLeft="4px" borderColor="green.500">
                          <Text fontWeight="medium" mb={1}>Improve Sleep Quality</Text>
                          <Text fontSize="sm" color="gray.600">
                            Aim for 7-9 hours of quality sleep for optimal recovery
                          </Text>
                        </Box>
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </Grid>

            {/* Weekly Focus */}
            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} mt={6}>
              <CardHeader>
                <Heading size="md">This Week's Focus</Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
                  <Box>
                    <Text fontWeight="medium" mb={2} color="brand.600">Nutrition</Text>
                    <Text fontSize="sm" color="gray.600">
                      {recommendations?.weekly_focus?.nutrition || 'Focus on hitting your protein targets daily. Track all meals consistently.'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2} color="purple.600">Workouts</Text>
                    <Text fontSize="sm" color="gray.600">
                      {recommendations?.weekly_focus?.workouts || 'Complete 4 strength training sessions. Focus on progressive overload.'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2} color="green.600">Recovery</Text>
                    <Text fontSize="sm" color="gray.600">
                      {recommendations?.weekly_focus?.recovery || 'Prioritize sleep and active recovery. Stay hydrated throughout the day.'}
                    </Text>
                  </Box>
                </Grid>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Workout Plans Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              {recommendations?.workout_plans?.map((plan, index) => (
                <Card key={index} bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">{plan.name}</Heading>
                    <Badge colorScheme="brand" mt={2}>{plan.difficulty}</Badge>
                  </CardHeader>
                  <CardBody>
                    <Text color="gray.600" mb={4}>{plan.description}</Text>
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Duration:</Text>
                        <Text fontSize="sm" fontWeight="medium">{plan.duration}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Frequency:</Text>
                        <Text fontSize="sm" fontWeight="medium">{plan.frequency}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Focus:</Text>
                        <Text fontSize="sm" fontWeight="medium">{plan.focus}</Text>
                      </HStack>
                    </VStack>
                    <Button colorScheme="brand" size="sm" mt={4} w="full">
                      Start This Plan
                    </Button>
                  </CardBody>
                </Card>
              )) || (
                <>
                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Strength Building Program</Heading>
                      <Badge colorScheme="brand" mt={2}>Intermediate</Badge>
                    </CardHeader>
                    <CardBody>
                      <Text color="gray.600" mb={4}>
                        4-day split focusing on compound movements and progressive overload
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Duration:</Text>
                          <Text fontSize="sm" fontWeight="medium">12 weeks</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Frequency:</Text>
                          <Text fontSize="sm" fontWeight="medium">4 days/week</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Focus:</Text>
                          <Text fontSize="sm" fontWeight="medium">Muscle Building</Text>
                        </HStack>
                      </VStack>
                      <Button colorScheme="brand" size="sm" mt={4} w="full">
                        Start This Plan
                      </Button>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Fat Loss Circuit Training</Heading>
                      <Badge colorScheme="orange" mt={2}>Beginner-Intermediate</Badge>
                    </CardHeader>
                    <CardBody>
                      <Text color="gray.600" mb={4}>
                        High-intensity circuits combining cardio and strength for maximum calorie burn
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Duration:</Text>
                          <Text fontSize="sm" fontWeight="medium">8 weeks</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Frequency:</Text>
                          <Text fontSize="sm" fontWeight="medium">5 days/week</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Focus:</Text>
                          <Text fontSize="sm" fontWeight="medium">Fat Loss</Text>
                        </HStack>
                      </VStack>
                      <Button colorScheme="brand" size="sm" mt={4} w="full">
                        Start This Plan
                      </Button>
                    </CardBody>
                  </Card>
                </>
              )}
            </Grid>
          </TabPanel>

          {/* Meal Plans Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              {recommendations?.meal_plans?.map((plan, index) => (
                <Card key={index} bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">{plan.name}</Heading>
                    <Badge colorScheme="green" mt={2}>{plan.calories} kcal/day</Badge>
                  </CardHeader>
                  <CardBody>
                    <Text color="gray.600" mb={4}>{plan.description}</Text>
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Protein:</Text>
                        <Text fontSize="sm" fontWeight="medium">{plan.protein}g</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Carbs:</Text>
                        <Text fontSize="sm" fontWeight="medium">{plan.carbs}g</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Fats:</Text>
                        <Text fontSize="sm" fontWeight="medium">{plan.fats}g</Text>
                      </HStack>
                    </VStack>
                    <Button colorScheme="green" size="sm" mt={4} w="full">
                      View Meal Plan
                    </Button>
                  </CardBody>
                </Card>
              )) || (
                <>
                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Balanced Nutrition Plan</Heading>
                      <Badge colorScheme="green" mt={2}>2,200 kcal/day</Badge>
                    </CardHeader>
                    <CardBody>
                      <Text color="gray.600" mb={4}>
                        Well-balanced macros for sustainable weight loss and muscle maintenance
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Protein:</Text>
                          <Text fontSize="sm" fontWeight="medium">165g (30%)</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Carbs:</Text>
                          <Text fontSize="sm" fontWeight="medium">220g (40%)</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Fats:</Text>
                          <Text fontSize="sm" fontWeight="medium">73g (30%)</Text>
                        </HStack>
                      </VStack>
                      <Button colorScheme="green" size="sm" mt={4} w="full">
                        View Meal Plan
                      </Button>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">High Protein Plan</Heading>
                      <Badge colorScheme="blue" mt={2}>2,400 kcal/day</Badge>
                    </CardHeader>
                    <CardBody>
                      <Text color="gray.600" mb={4}>
                        Higher protein intake to support muscle building and recovery
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Protein:</Text>
                          <Text fontSize="sm" fontWeight="medium">210g (35%)</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Carbs:</Text>
                          <Text fontSize="sm" fontWeight="medium">240g (40%)</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Fats:</Text>
                          <Text fontSize="sm" fontWeight="medium">67g (25%)</Text>
                        </HStack>
                      </VStack>
                      <Button colorScheme="green" size="sm" mt={4} w="full">
                        View Meal Plan
                      </Button>
                    </CardBody>
                  </Card>
                </>
              )}
            </Grid>
          </TabPanel>

          {/* Tips & Insights Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              {recommendations?.tips?.map((tip, index) => (
                <Card key={index} bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                  <CardBody>
                    <HStack align="start" spacing={4}>
                      <Icon as={FiAward} color="brand.500" boxSize={6} mt={1} />
                      <Box flex="1">
                        <Heading size="sm" mb={2}>{tip.title}</Heading>
                        <Text color="gray.600" fontSize="sm">{tip.content}</Text>
                        <Badge colorScheme="brand" mt={2}>{tip.category}</Badge>
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>
              )) || (
                <>
                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <HStack align="start" spacing={4}>
                        <Icon as={FiAward} color="brand.500" boxSize={6} mt={1} />
                        <Box flex="1">
                          <Heading size="sm" mb={2}>Progressive Overload is Key</Heading>
                          <Text color="gray.600" fontSize="sm">
                            Gradually increase the weight, frequency, or number of repetitions in your strength training routine. This progressive overload is essential for continuous muscle growth and strength gains.
                          </Text>
                          <Badge colorScheme="brand" mt={2}>Workout</Badge>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <HStack align="start" spacing={4}>
                        <Icon as={FiAward} color="green.500" boxSize={6} mt={1} />
                        <Box flex="1">
                          <Heading size="sm" mb={2}>Meal Timing Matters</Heading>
                          <Text color="gray.600" fontSize="sm">
                            Consume protein within 2 hours after your workout to maximize muscle protein synthesis. Aim for 20-40g of high-quality protein post-workout.
                          </Text>
                          <Badge colorScheme="green" mt={2}>Nutrition</Badge>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <HStack align="start" spacing={4}>
                        <Icon as={FiAward} color="purple.500" boxSize={6} mt={1} />
                        <Box flex="1">
                          <Heading size="sm" mb={2}>Recovery is Part of Training</Heading>
                          <Text color="gray.600" fontSize="sm">
                            Your muscles grow during rest, not during workouts. Ensure you're getting 7-9 hours of quality sleep and taking at least 1-2 rest days per week.
                          </Text>
                          <Badge colorScheme="purple" mt={2}>Recovery</Badge>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <HStack align="start" spacing={4}>
                        <Icon as={FiAward} color="orange.500" boxSize={6} mt={1} />
                        <Box flex="1">
                          <Heading size="sm" mb={2}>Stay Hydrated</Heading>
                          <Text color="gray.600" fontSize="sm">
                            Drink at least 3-4 liters of water daily. Proper hydration improves performance, aids recovery, and supports metabolic processes.
                          </Text>
                          <Badge colorScheme="orange" mt={2}>General</Badge>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>
                </>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Recommendations;
