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
  Progress,
} from '@chakra-ui/react';
import { FiPlus, FiHeart, FiSearch } from 'react-icons/fi';
import nutritionService from '../services/nutrition';
import { formatDate } from '../utils/helpers';
import { MEAL_TYPES } from '../utils/constants';

const Nutrition = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [meals, setMeals] = useState([]);
  const [foods, setFoods] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [formData, setFormData] = useState({
    meal_type: 'breakfast',
    date: new Date().toISOString().split('T')[0],
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mealsResponse, foodsResponse, favoritesResponse] = await Promise.all([
        nutritionService.getMeals(),
        nutritionService.getFoods(),
        nutritionService.getFavorites(),
      ]);
      setMeals(mealsResponse.data.results || mealsResponse.data);
      setFoods(foodsResponse.data.results || foodsResponse.data);
      setFavorites(favoritesResponse.data.results || favoritesResponse.data);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: error.response?.data?.detail || 'Failed to load nutrition data',
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

  const handleFoodSelect = (food) => {
    setSelectedFoods([...selectedFoods, { ...food, quantity: 100 }]);
  };

  const handleFoodRemove = (index) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedFoods = [...selectedFoods];
    updatedFoods[index].quantity = quantity;
    setSelectedFoods(updatedFoods);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFoods.length === 0) {
      toast({
        title: 'No foods selected',
        description: 'Please add at least one food to your meal',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);

    try {
      const mealData = {
        ...formData,
        foods: selectedFoods.map(food => ({
          food: food.id,
          quantity: food.quantity,
        })),
      };

      await nutritionService.createMeal(mealData);
      toast({
        title: 'Meal added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      loadData();
      setSelectedFoods([]);
      setFormData({
        meal_type: 'breakfast',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      toast({
        title: 'Error adding meal',
        description: error.response?.data?.detail || 'Failed to add meal',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFavorite = async (foodId) => {
    try {
      await nutritionService.toggleFavorite(foodId);
      loadData();
    } catch (error) {
      toast({
        title: 'Error updating favorites',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayMeals = meals.filter(meal =>
    meal.date === new Date().toISOString().split('T')[0]
  );

  const todayCalories = todayMeals.reduce((total, meal) =>
    total + meal.total_calories, 0
  );

  const todayProtein = todayMeals.reduce((total, meal) =>
    total + meal.total_protein, 0
  );

  const todayCarbs = todayMeals.reduce((total, meal) =>
    total + meal.total_carbs, 0
  );

  const todayFats = todayMeals.reduce((total, meal) =>
    total + meal.total_fats, 0
  );

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
          <Heading size="lg" mb={2}>Nutrition</Heading>
          <Text color="gray.600">Track your meals and nutrition intake</Text>
        </Box>
        <Button colorScheme="brand" onClick={onOpen}>
          <Icon as={FiPlus} mr={2} />
          Log Meal
        </Button>
      </Box>

      {/* Today's Summary */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Today's Calories</StatLabel>
              <StatNumber>{todayCalories}</StatNumber>
              <StatHelpText>Target: 2,200 kcal</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Protein</StatLabel>
              <StatNumber>{todayProtein.toFixed(1)}g</StatNumber>
              <StatHelpText>Target: 150g</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Carbohydrates</StatLabel>
              <StatNumber>{todayCarbs.toFixed(1)}g</StatNumber>
              <StatHelpText>Target: 220g</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Fats</StatLabel>
              <StatNumber>{todayFats.toFixed(1)}g</StatNumber>
              <StatHelpText>Target: 70g</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Today's Meals */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} mb={8}>
        <CardHeader>
          <Heading size="md">Today's Meals</Heading>
        </CardHeader>
        <CardBody>
          {todayMeals.length > 0 ? (
            <VStack spacing={4} align="stretch">
              {todayMeals.map((meal) => (
                <Box key={meal.id} p={4} borderWidth="1px" borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <Badge colorScheme="brand" fontSize="sm">
                      {meal.meal_type}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      {meal.total_calories} kcal
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {meal.foods.length} foods • P: {meal.total_protein.toFixed(1)}g • C: {meal.total_carbs.toFixed(1)}g • F: {meal.total_fats.toFixed(1)}g
                  </Text>
                </Box>
              ))}
            </VStack>
          ) : (
            <Center py={8}>
              <VStack>
                <Text color="gray.500">No meals logged today</Text>
                <Button colorScheme="brand" size="sm" onClick={onOpen}>
                  Log Your First Meal
                </Button>
              </VStack>
            </Center>
          )}
        </CardBody>
      </Card>

      {/* Favorites */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">Favorite Foods</Heading>
        </CardHeader>
        <CardBody>
          {favorites.length > 0 ? (
            <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
              {favorites.map((favorite) => (
                <Box key={favorite.id} p={3} borderWidth="1px" borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium" fontSize="sm">{favorite.food.name}</Text>
                    <Icon
                      as={FiHeart}
                      color="red.500"
                      cursor="pointer"
                      onClick={() => toggleFavorite(favorite.food.id)}
                    />
                  </HStack>
                  <Text fontSize="xs" color="gray.600">
                    {favorite.food.calories} kcal per 100g
                  </Text>
                </Box>
              ))}
            </Grid>
          ) : (
            <Center py={8}>
              <Text color="gray.500">No favorite foods yet</Text>
            </Center>
          )}
        </CardBody>
      </Card>

      {/* Log Meal Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>Log Meal</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                {/* Meal Details */}
                <Box>
                  <Heading size="sm" mb={4}>Meal Details</Heading>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Meal Type</FormLabel>
                      <Select name="meal_type" value={formData.meal_type} onChange={handleChange}>
                        {MEAL_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Date</FormLabel>
                      <Input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                      />
                    </FormControl>
                  </VStack>

                  {/* Selected Foods */}
                  <Heading size="sm" mt={6} mb={4}>Selected Foods</Heading>
                  {selectedFoods.length > 0 ? (
                    <VStack spacing={2} align="stretch">
                      {selectedFoods.map((food, index) => (
                        <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                          <Box>
                            <Text fontSize="sm" fontWeight="medium">{food.name}</Text>
                            <Text fontSize="xs" color="gray.600">
                              {food.calories} kcal per 100g
                            </Text>
                          </Box>
                          <HStack>
                            <Input
                              type="number"
                              size="sm"
                              width="80px"
                              value={food.quantity}
                              onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value))}
                              placeholder="100"
                            />
                            <Text fontSize="xs" color="gray.600">g</Text>
                            <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleFoodRemove(index)}>
                              ×
                            </Button>
                          </HStack>
                        </HStack>
                      ))}
                    </VStack>
                  ) : (
                    <Text fontSize="sm" color="gray.500">No foods selected</Text>
                  )}
                </Box>

                {/* Food Search */}
                <Box>
                  <Heading size="sm" mb={4}>Add Foods</Heading>
                  <FormControl mb={4}>
                    <FormLabel>Search Foods</FormLabel>
                    <Input
                      placeholder="Search for foods..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </FormControl>

                  <Box maxH="300px" overflowY="auto">
                    <VStack spacing={2} align="stretch">
                      {filteredFoods.slice(0, 10).map((food) => (
                        <HStack
                          key={food.id}
                          p={3}
                          borderWidth="1px"
                          borderRadius="md"
                          cursor="pointer"
                          _hover={{ bg: 'gray.50' }}
                          onClick={() => handleFoodSelect(food)}
                        >
                          <Box flex="1">
                            <Text fontSize="sm" fontWeight="medium">{food.name}</Text>
                            <Text fontSize="xs" color="gray.600">
                              {food.calories} kcal • P: {food.protein}g • C: {food.carbs}g • F: {food.fats}g
                            </Text>
                          </Box>
                          <Icon as={FiPlus} color="brand.500" />
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                </Box>
              </Grid>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={submitting}>
                Log Meal
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Nutrition;
