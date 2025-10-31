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
  SimpleGrid,
  Badge,
  VStack,
  HStack,
  Icon,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Divider,
  Image,
  Flex,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiHeart,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
  FiCoffee,
  FiSun,
  FiMoon,
  FiStar,
} from 'react-icons/fi';
import { FaCookieBite } from 'react-icons/fa';
import nutritionService from '../services/nutrition';
import { formatDate } from '../utils/helpers';
import { MEAL_TYPES } from '../utils/constants';

const Nutrition = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCreateFoodOpen, onOpen: onCreateFoodOpen, onClose: onCreateFoodClose } = useDisclosure();
  const { isOpen: isCreatePlanOpen, onOpen: onCreatePlanOpen, onClose: onCreatePlanClose } = useDisclosure();
  const { isOpen: isCreateRecipeOpen, onOpen: onCreateRecipeOpen, onClose: onCreateRecipeClose } = useDisclosure();
  const { isOpen: isRecipeDetailOpen, onOpen: onRecipeDetailOpen, onClose: onRecipeDetailClose } = useDisclosure();
  const toast = useToast();
  const [meals, setMeals] = useState([]);
  const [foods, setFoods] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recipeSearchTerm, setRecipeSearchTerm] = useState('');
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeFavorites, setRecipeFavorites] = useState([2]); // サーモンとキヌアがお気に入り
  const [formData, setFormData] = useState({
    meal_type: 'breakfast',
    date: new Date().toISOString().split('T')[0],
  });
  const [newFoodData, setNewFoodData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    serving_size: '100',
    unit: 'g',
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Helper function to get week start (Monday)
  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Get week days array
  function getWeekDays(weekStart) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
    return days;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mealsResponse, foodsResponse, favoritesResponse] = await Promise.all([
        nutritionService.meals.getAll(),
        nutritionService.foods.getAll(),
        nutritionService.favorites.getAll(),
      ]);
      setMeals(mealsResponse.results || mealsResponse);
      setFoods(foodsResponse.results || foodsResponse);
      setFavorites(favoritesResponse.results || favoritesResponse);
    } catch (error) {
      toast({
        title: 'データ読み込みエラー',
        description: error.response?.data?.detail || '栄養データの読み込みに失敗しました',
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
        title: '食品が選択されていません',
        description: '少なくとも1つの食品を追加してください',
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

      await nutritionService.meals.create(mealData);
      toast({
        title: '食事を追加しました',
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
        title: '食事追加エラー',
        description: error.response?.data?.detail || '食事の追加に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      await nutritionService.meals.delete(mealId);
      toast({
        title: '食事を削除しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadData();
    } catch (error) {
      toast({
        title: '削除エラー',
        description: '食事の削除に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const toggleFavorite = async (foodId) => {
    try {
      await nutritionService.favorites.toggle(foodId);
      loadData();
      toast({
        title: 'お気に入りを更新しました',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'お気に入り更新エラー',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const quickAddFavorite = (favorite) => {
    setSelectedMealType('breakfast');
    setFormData({
      meal_type: 'breakfast',
      date: selectedDate.toISOString().split('T')[0],
    });
    setSelectedFoods([{ ...favorite.food, quantity: 100 }]);
    onOpen();
  };

  const openAddFoodModal = (mealType) => {
    setSelectedMealType(mealType);
    setFormData({
      meal_type: mealType,
      date: selectedDate.toISOString().split('T')[0],
    });
    setSelectedFoods([]);
    onOpen();
  };

  const handleNewFoodChange = (e) => {
    setNewFoodData({
      ...newFoodData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateFood = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await nutritionService.foods.create({
        name: newFoodData.name,
        calories: parseFloat(newFoodData.calories),
        protein: parseFloat(newFoodData.protein),
        carbs: parseFloat(newFoodData.carbs),
        fats: parseFloat(newFoodData.fats),
        serving_size: parseFloat(newFoodData.serving_size),
        unit: newFoodData.unit,
      });

      toast({
        title: '食品を作成しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onCreateFoodClose();
      loadData();
      setNewFoodData({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        serving_size: '100',
        unit: 'g',
      });
    } catch (error) {
      toast({
        title: '食品作成エラー',
        description: error.response?.data?.detail || '食品の作成に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Recipe handlers
  const toggleRecipeFavorite = (recipeId) => {
    setRecipeFavorites(prev => {
      if (prev.includes(recipeId)) {
        toast({
          title: 'お気に入りから削除しました',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
        return prev.filter(id => id !== recipeId);
      } else {
        toast({
          title: 'お気に入りに追加しました',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        return [...prev, recipeId];
      }
    });
  };

  const openRecipeDetail = (recipe) => {
    setSelectedRecipe(recipe);
    onRecipeDetailOpen();
  };

  const handleCreatePlan = () => {
    onCreatePlanOpen();
  };

  const handleCreateRecipe = () => {
    onCreateRecipeOpen();
  };

  const handlePlanClick = (planName) => {
    toast({
      title: `${planName}を選択しました`,
      description: 'プランの詳細を表示します',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Sample recipes data
  const sampleRecipes = [
    {
      id: 1,
      name: 'グリルチキンサラダ',
      description: '高タンパク質、低カロリーの健康的なサラダ',
      calories: 450,
      protein: 45,
      carbs: 30,
      fats: 15,
      time: '20分',
      servings: '2人分',
      icon: FiCoffee,
    },
    {
      id: 2,
      name: 'サーモンとキヌア',
      description: 'オメガ3豊富な栄養バランス食',
      calories: 520,
      protein: 35,
      carbs: 45,
      fats: 18,
      time: '30分',
      servings: '2人分',
      icon: FiSun,
    },
    {
      id: 3,
      name: 'プロテインスムージー',
      description: '朝食やスナックに最適な高タンパク質ドリンク',
      calories: 280,
      protein: 30,
      carbs: 25,
      fats: 8,
      time: '5分',
      servings: '1人分',
      icon: FiMoon,
    },
    {
      id: 4,
      name: '野菜炒め',
      description: 'ビタミン豊富な簡単ヘルシー料理',
      calories: 180,
      protein: 8,
      carbs: 25,
      fats: 6,
      time: '15分',
      servings: '2人分',
      icon: FaCookieBite,
    },
  ];

  const filteredRecipes = sampleRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(recipeSearchTerm.toLowerCase())
  );

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedDateMeals = meals.filter(meal => meal.date === selectedDateStr);

  const mealsByType = {
    breakfast: selectedDateMeals.filter(m => m.meal_type === 'breakfast'),
    lunch: selectedDateMeals.filter(m => m.meal_type === 'lunch'),
    dinner: selectedDateMeals.filter(m => m.meal_type === 'dinner'),
    snack: selectedDateMeals.filter(m => m.meal_type === 'snack'),
  };

  const todayCalories = selectedDateMeals.reduce((total, meal) => total + meal.total_calories, 0);
  const todayProtein = selectedDateMeals.reduce((total, meal) => total + meal.total_protein, 0);
  const todayCarbs = selectedDateMeals.reduce((total, meal) => total + meal.total_carbs, 0);
  const todayFats = selectedDateMeals.reduce((total, meal) => total + meal.total_fats, 0);

  const targetCalories = 2200;
  const targetProtein = 150;
  const targetCarbs = 220;
  const targetFats = 70;

  const caloriesPercent = (todayCalories / targetCalories) * 100;
  const proteinPercent = (todayProtein / targetProtein) * 100;
  const carbsPercent = (todayCarbs / targetCarbs) * 100;
  const fatsPercent = (todayFats / targetFats) * 100;

  const weekDays = getWeekDays(currentWeekStart);
  const dayNames = ['月', '火', '水', '木', '金', '土', '日'];

  const getMealIcon = (type) => {
    switch (type) {
      case 'breakfast':
        return FiCoffee;
      case 'lunch':
        return FiSun;
      case 'dinner':
        return FiMoon;
      case 'snack':
        return FaCookieBite;
      default:
        return FiCoffee;
    }
  };

  const getMealIconColor = (type) => {
    switch (type) {
      case 'breakfast':
        return 'orange.500';
      case 'lunch':
        return 'yellow.500';
      case 'dinner':
        return 'indigo.500';
      case 'snack':
        return 'pink.500';
      default:
        return 'gray.500';
    }
  };

  const getMealLabel = (type) => {
    switch (type) {
      case 'breakfast':
        return '朝食';
      case 'lunch':
        return '昼食';
      case 'dinner':
        return '夕食';
      case 'snack':
        return 'スナック';
      default:
        return type;
    }
  };

  const getDailyCalories = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayMeals = meals.filter(m => m.date === dateStr);
    return dayMeals.reduce((total, meal) => total + meal.total_calories, 0);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const navigateWeek = (direction) => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + (direction * 7));
    setCurrentWeekStart(newWeekStart);
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  const MealSection = ({ mealType, meals }) => {
    const mealTotal = meals.reduce((sum, meal) => sum + meal.total_calories, 0);
    
    return (
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={3}>
          <HStack>
            <Icon as={getMealIcon(mealType)} color={getMealIconColor(mealType)} boxSize={5} />
            <Heading size="md" fontWeight="semibold">
              {getMealLabel(mealType)}
            </Heading>
          </HStack>
          <Button
            size="sm"
            colorScheme="brand"
            variant="ghost"
            onClick={() => openAddFoodModal(mealType)}
          >
            <Icon as={FiPlus} mr={1} />
            食品を追加
          </Button>
        </Flex>

        {meals.length > 0 ? (
          <VStack spacing={2} align="stretch">
            {meals.map((meal) => (
              <Box key={meal.id}>
                {meal.foods && meal.foods.map((foodItem, idx) => (
                  <Flex
                    key={idx}
                    align="center"
                    justify="space-between"
                    p={3}
                    bg={hoverBg}
                    borderRadius="lg"
                    mb={2}
                  >
                    <HStack spacing={3} flex="1">
                      <Box
                        w="48px"
                        h="48px"
                        bg="gray.200"
                        borderRadius="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiCoffee} color="gray.500" />
                      </Box>
                      <Box>
                        <Text fontWeight="medium" fontSize="sm">
                          {foodItem.food?.name || '食品'}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {foodItem.quantity}g
                        </Text>
                      </Box>
                    </HStack>
                    <Box textAlign="right" mr={4}>
                      <Text fontWeight="semibold" fontSize="sm">
                        {Math.round((foodItem.food?.calories || 0) * foodItem.quantity / 100)} kcal
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        P: {Math.round((foodItem.food?.protein || 0) * foodItem.quantity / 100)}g
                        {' '}C: {Math.round((foodItem.food?.carbs || 0) * foodItem.quantity / 100)}g
                        {' '}F: {Math.round((foodItem.food?.fats || 0) * foodItem.quantity / 100)}g
                      </Text>
                    </Box>
                    <IconButton
                      icon={<FiTrash2 />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDeleteMeal(meal.id)}
                      aria-label="削除"
                    />
                  </Flex>
                ))}
              </Box>
            ))}
            <Box textAlign="right" mt={2}>
              <Text fontSize="sm" fontWeight="semibold">
                合計: {mealTotal} kcal
              </Text>
            </Box>
          </VStack>
        ) : (
          <Box
            border="2px dashed"
            borderColor={borderColor}
            borderRadius="lg"
            p={8}
            textAlign="center"
          >
            <Icon as={getMealIcon(mealType)} boxSize={10} color="gray.400" mb={2} />
            <Text color="gray.600" mb={3}>
              まだ食事が計画されていません
            </Text>
            <Button
              size="sm"
              colorScheme="brand"
              variant="ghost"
              onClick={() => openAddFoodModal(mealType)}
            >
              食品を追加
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Heading size="lg" mb={2}>食事計画</Heading>
            <Text color="gray.600">食事を計画して栄養を追跡</Text>
          </Box>
          <HStack spacing={3}>
            <Button
              variant="outline"
              colorScheme="brand"
              onClick={() => setActiveTab(0)}
            >
              <Icon as={FiHeart} mr={2} />
              お気に入り
            </Button>
            <Button colorScheme="brand" onClick={onOpen}>
              <Icon as={FiPlus} mr={2} />
              カスタム食事を作成
            </Button>
          </HStack>
        </Flex>

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab} colorScheme="brand">
          <TabList>
            <Tab>食事カレンダー</Tab>
            <Tab>食品データベース</Tab>
            <Tab>食事プラン</Tab>
            <Tab>レシピ</Tab>
          </TabList>
        </Tabs>
      </Box>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        {/* Main Content */}
        <Box>
          {activeTab === 0 && (
            <>
              {/* Week Navigation */}
              <Card bg={bgColor} mb={6}>
                <CardBody>
                  <Flex justify="space-between" align="center" mb={4}>
                    <IconButton
                      icon={<FiChevronLeft />}
                      variant="ghost"
                      onClick={() => navigateWeek(-1)}
                      aria-label="前の週"
                    />
                    <Heading size="md">
                      {currentWeekStart.getFullYear()}年{currentWeekStart.getMonth() + 1}月
                      {currentWeekStart.getDate()}日〜
                      {weekDays[6].getDate()}日の週
                    </Heading>
                    <IconButton
                      icon={<FiChevronRight />}
                      variant="ghost"
                      onClick={() => navigateWeek(1)}
                      aria-label="次の週"
                    />
                  </Flex>

                  {/* Days Grid */}
                  <Grid templateColumns="repeat(7, 1fr)" gap={2}>
                    {dayNames.map((day, idx) => (
                      <Box key={idx} textAlign="center" fontSize="sm" fontWeight="semibold" color="gray.600" py={2}>
                        {day}
                      </Box>
                    ))}
                    {weekDays.map((date, idx) => {
                      const calories = getDailyCalories(date);
                      const isTodayDate = isToday(date);
                      const isSelected = isSelectedDate(date);

                      return (
                        <Box
                          key={idx}
                          bg={isSelected ? 'brand.100' : hoverBg}
                          border={isSelected ? '2px solid' : 'none'}
                          borderColor="brand.500"
                          borderRadius="lg"
                          p={2}
                          textAlign="center"
                          cursor="pointer"
                          _hover={{ bg: isSelected ? 'brand.100' : 'gray.100' }}
                          onClick={() => setSelectedDate(date)}
                        >
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={isSelected ? 'brand.600' : 'gray.900'}
                          >
                            {date.getDate()}
                          </Text>
                          {isTodayDate ? (
                            <Text fontSize="xs" color={isSelected ? 'brand.600' : 'brand.500'} fontWeight="semibold" mt={1}>
                              今日
                            </Text>
                          ) : calories > 0 ? (
                            <Text fontSize="xs" color="green.600" mt={1}>
                              {calories} kcal
                            </Text>
                          ) : (
                            <Text fontSize="xs" color="gray.400" mt={1}>
                              -
                            </Text>
                          )}
                        </Box>
                      );
                    })}
                  </Grid>
                </CardBody>
              </Card>

              {/* Today's Meals */}
              <Card bg={bgColor}>
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">
                      {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日の食事
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      {todayCalories} / {targetCalories} kcal
                    </Text>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <MealSection mealType="breakfast" meals={mealsByType.breakfast} />
                  <MealSection mealType="lunch" meals={mealsByType.lunch} />
                  <MealSection mealType="dinner" meals={mealsByType.dinner} />
                  <MealSection mealType="snack" meals={mealsByType.snack} />
                </CardBody>
              </Card>
            </>
          )}

          {activeTab === 1 && (
            <Card bg={bgColor}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">食品データベース</Heading>
                  <Button
                    size="sm"
                    colorScheme="brand"
                    onClick={onCreateFoodOpen}
                  >
                    <Icon as={FiPlus} mr={2} />
                    新しい食品を作成
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <FormControl mb={4}>
                  <Input
                    placeholder="食品を検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </FormControl>
                <VStack spacing={2} align="stretch">
                  {filteredFoods.slice(0, 20).map((food) => (
                    <Flex
                      key={food.id}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      justify="space-between"
                      align="center"
                      _hover={{ bg: hoverBg }}
                    >
                      <Box>
                        <Text fontWeight="medium">{food.name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {food.calories} kcal • P: {food.protein}g • C: {food.carbs}g • F: {food.fats}g
                        </Text>
                      </Box>
                      <HStack>
                        <IconButton
                          icon={<FiHeart />}
                          size="sm"
                          variant="ghost"
                          colorScheme={favorites.some(f => f.food.id === food.id) ? 'red' : 'gray'}
                          onClick={() => toggleFavorite(food.id)}
                          aria-label="お気に入り"
                        />
                        <Button size="sm" colorScheme="brand" onClick={() => handleFoodSelect(food)}>
                          追加
                        </Button>
                      </HStack>
                    </Flex>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          )}

          {activeTab === 2 && (
            <Card bg={bgColor}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">食事プラン</Heading>
                  <Button size="sm" colorScheme="brand" onClick={handleCreatePlan}>
                    <Icon as={FiPlus} mr={2} />
                    新しいプランを作成
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {/* Sample Meal Plans */}
                  <Box p={4} borderWidth="1px" borderRadius="lg" _hover={{ bg: hoverBg }} cursor="pointer" onClick={() => handlePlanClick('減量プラン')}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Heading size="sm">減量プラン</Heading>
                      <Badge colorScheme="green">アクティブ</Badge>
                    </Flex>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      1日1,800kcal • 高タンパク質 • 低炭水化物
                    </Text>
                    <HStack spacing={2}>
                      <Badge>月-金</Badge>
                      <Badge>7日間</Badge>
                    </HStack>
                  </Box>

                  <Box p={4} borderWidth="1px" borderRadius="lg" _hover={{ bg: hoverBg }} cursor="pointer" onClick={() => handlePlanClick('筋肉増強プラン')}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Heading size="sm">筋肉増強プラン</Heading>
                      <Badge colorScheme="blue">保存済み</Badge>
                    </Flex>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      1日2,500kcal • 超高タンパク質 • 中炭水化物
                    </Text>
                    <HStack spacing={2}>
                      <Badge>毎日</Badge>
                      <Badge>14日間</Badge>
                    </HStack>
                  </Box>

                  <Box p={4} borderWidth="1px" borderRadius="lg" _hover={{ bg: hoverBg }} cursor="pointer" onClick={() => handlePlanClick('バランス維持プラン')}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Heading size="sm">バランス維持プラン</Heading>
                      <Badge>保存済み</Badge>
                    </Flex>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      1日2,200kcal • バランス型 • 全マクロ均等
                    </Text>
                    <HStack spacing={2}>
                      <Badge>毎日</Badge>
                      <Badge>30日間</Badge>
                    </HStack>
                  </Box>

                  <Box
                    p={8}
                    borderWidth="2px"
                    borderStyle="dashed"
                    borderColor={borderColor}
                    borderRadius="lg"
                    textAlign="center"
                    cursor="pointer"
                    _hover={{ bg: hoverBg }}
                    onClick={handleCreatePlan}
                  >
                    <Icon as={FiPlus} boxSize={8} color="gray.400" mb={2} />
                    <Text color="gray.600" fontWeight="medium">
                      新しい食事プランを作成
                    </Text>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      カスタムプランで目標を達成
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          )}

          {activeTab === 3 && (
            <Card bg={bgColor}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">レシピ</Heading>
                  <HStack>
                    <Input
                      placeholder="レシピを検索..."
                      size="sm"
                      width="200px"
                      value={recipeSearchTerm}
                      onChange={(e) => setRecipeSearchTerm(e.target.value)}
                    />
                    <Button size="sm" colorScheme="brand" onClick={handleCreateRecipe}>
                      <Icon as={FiPlus} mr={2} />
                      レシピを追加
                    </Button>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {/* Sample Recipes */}
                  {filteredRecipes.map((recipe) => (
                    <Box key={recipe.id} borderWidth="1px" borderRadius="lg" overflow="hidden" _hover={{ shadow: 'md' }} cursor="pointer">
                      <Box h="150px" bg="gray.200" display="flex" alignItems="center" justifyContent="center" onClick={() => openRecipeDetail(recipe)}>
                        <Icon as={recipe.icon} boxSize={12} color="gray.400" />
                      </Box>
                      <Box p={4}>
                        <Flex justify="space-between" align="center" mb={2}>
                          <Heading size="sm" onClick={() => openRecipeDetail(recipe)} cursor="pointer">
                            {recipe.name}
                          </Heading>
                          <Icon
                            as={FiHeart}
                            color={recipeFavorites.includes(recipe.id) ? 'red.500' : 'gray.400'}
                            cursor="pointer"
                            _hover={{ color: 'red.500' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRecipeFavorite(recipe.id);
                            }}
                          />
                        </Flex>
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          {recipe.description}
                        </Text>
                        <HStack spacing={2} mb={2}>
                          <Badge colorScheme="green">{recipe.calories} kcal</Badge>
                          <Badge>P: {recipe.protein}g</Badge>
                          <Badge>C: {recipe.carbs}g</Badge>
                          <Badge>F: {recipe.fats}g</Badge>
                        </HStack>
                        <HStack spacing={2} fontSize="xs" color="gray.500">
                          <Text>⏱️ {recipe.time}</Text>
                          <Text>👤 {recipe.servings}</Text>
                        </HStack>
                      </Box>
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
          )}
        </Box>

        {/* Sidebar */}
        <VStack spacing={6} align="stretch">
          {/* Daily Summary */}
          <Card bg={bgColor}>
            <CardHeader>
              <Heading size="md">1日の概要</Heading>
            </CardHeader>
            <CardBody>
              {/* Calories */}
              <Box mb={6}>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">カロリー</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {todayCalories} / {targetCalories}
                  </Text>
                </Flex>
                <Progress
                  value={caloriesPercent}
                  colorScheme="green"
                  size="sm"
                  borderRadius="full"
                  mb={1}
                />
                <Text fontSize="xs" color="gray.600">
                  残り {Math.max(0, targetCalories - todayCalories)} kcal
                </Text>
              </Box>

              {/* Protein */}
              <Box mb={4}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm" color="gray.700">タンパク質</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {todayProtein.toFixed(0)}g / {targetProtein}g
                  </Text>
                </Flex>
                <Progress
                  value={proteinPercent}
                  colorScheme="blue"
                  size="sm"
                  borderRadius="full"
                />
              </Box>

              {/* Carbs */}
              <Box mb={4}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm" color="gray.700">炭水化物</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {todayCarbs.toFixed(0)}g / {targetCarbs}g
                  </Text>
                </Flex>
                <Progress
                  value={carbsPercent}
                  colorScheme="green"
                  size="sm"
                  borderRadius="full"
                />
              </Box>

              {/* Fats */}
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm" color="gray.700">脂質</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {todayFats.toFixed(0)}g / {targetFats}g
                  </Text>
                </Flex>
                <Progress
                  value={fatsPercent}
                  colorScheme="yellow"
                  size="sm"
                  borderRadius="full"
                />
              </Box>
            </CardBody>
          </Card>

          {/* Quick Add Favorites */}
          <Card bg={bgColor}>
            <CardHeader>
              <Heading size="md">お気に入りをクイック追加</Heading>
            </CardHeader>
            <CardBody>
              {favorites.length > 0 ? (
                <VStack spacing={2} align="stretch">
                  {favorites.slice(0, 5).map((favorite) => (
                    <Button
                      key={favorite.id}
                      variant="ghost"
                      justifyContent="space-between"
                      onClick={() => quickAddFavorite(favorite)}
                      p={3}
                      h="auto"
                      _hover={{ bg: hoverBg }}
                    >
                      <HStack>
                        <Icon as={FiStar} color="yellow.500" />
                        <Text fontSize="sm" fontWeight="medium">
                          {favorite.food.name}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.600">
                        {favorite.food.calories} kcal
                      </Text>
                    </Button>
                  ))}
                </VStack>
              ) : (
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  お気に入りの食品はまだありません
                </Text>
              )}
            </CardBody>
          </Card>

          {/* AI Suggestions */}
          <Box
            bgGradient="linear(to-br, purple.500, pink.600)"
            borderRadius="xl"
            p={6}
            color="white"
          >
            <HStack mb={4}>
              <Icon as={FiStar} boxSize={5} />
              <Heading size="md">AI提案</Heading>
            </HStack>
            <VStack spacing={3} align="stretch">
              <Box bg="whiteAlpha.200" borderRadius="lg" p={3}>
                <Text fontSize="sm" fontWeight="semibold" mb={1}>
                  🥗 夕食に
                </Text>
                <Text fontSize="xs">
                  グリルサーモンとサツマイモを試してみてください - 残りのマクロに最適です！
                </Text>
              </Box>
              <Box bg="whiteAlpha.200" borderRadius="lg" p={3}>
                <Text fontSize="sm" fontWeight="semibold" mb={1}>
                  💡 ヒント
                </Text>
                <Text fontSize="xs">
                  今日はもっと健康的な脂質が必要です。アボカドやナッツを追加しましょう！
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Grid>

      {/* Log Meal Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>食事を記録</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                {/* Meal Details */}
                <Box>
                  <Heading size="sm" mb={4}>食事の詳細</Heading>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>食事タイプ</FormLabel>
                      <Select name="meal_type" value={formData.meal_type} onChange={handleChange}>
                        {MEAL_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>日付</FormLabel>
                      <Input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                      />
                    </FormControl>
                  </VStack>

                  {/* Selected Foods */}
                  <Heading size="sm" mt={6} mb={4}>選択した食品</Heading>
                  {selectedFoods.length > 0 ? (
                    <VStack spacing={2} align="stretch">
                      {selectedFoods.map((food, index) => (
                        <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                          <Box>
                            <Text fontSize="sm" fontWeight="medium">{food.name}</Text>
                            <Text fontSize="xs" color="gray.600">
                              100gあたり {food.calories} kcal
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
                    <Text fontSize="sm" color="gray.500">食品が選択されていません</Text>
                  )}
                </Box>

                {/* Food Search */}
                <Box>
                  <Heading size="sm" mb={4}>食品を追加</Heading>
                  <FormControl mb={4}>
                    <FormLabel>食品を検索</FormLabel>
                    <Input
                      placeholder="食品を検索..."
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
                キャンセル
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={submitting}>
                食事を記録
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Create Food Modal */}
      <Modal isOpen={isCreateFoodOpen} onClose={onCreateFoodClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleCreateFood}>
            <ModalHeader>新しい食品を作成</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>食品名</FormLabel>
                  <Input
                    name="name"
                    value={newFoodData.name}
                    onChange={handleNewFoodChange}
                    placeholder="例: 鶏胸肉"
                  />
                </FormControl>

                <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>カロリー (kcal)</FormLabel>
                    <Input
                      type="number"
                      name="calories"
                      value={newFoodData.calories}
                      onChange={handleNewFoodChange}
                      placeholder="100"
                      step="0.1"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>タンパク質 (g)</FormLabel>
                    <Input
                      type="number"
                      name="protein"
                      value={newFoodData.protein}
                      onChange={handleNewFoodChange}
                      placeholder="20"
                      step="0.1"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>炭水化物 (g)</FormLabel>
                    <Input
                      type="number"
                      name="carbs"
                      value={newFoodData.carbs}
                      onChange={handleNewFoodChange}
                      placeholder="30"
                      step="0.1"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>脂質 (g)</FormLabel>
                    <Input
                      type="number"
                      name="fats"
                      value={newFoodData.fats}
                      onChange={handleNewFoodChange}
                      placeholder="10"
                      step="0.1"
                    />
                  </FormControl>
                </Grid>

                <Grid templateColumns="2fr 1fr" gap={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>サービングサイズ</FormLabel>
                    <Input
                      type="number"
                      name="serving_size"
                      value={newFoodData.serving_size}
                      onChange={handleNewFoodChange}
                      placeholder="100"
                      step="0.1"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>単位</FormLabel>
                    <Select
                      name="unit"
                      value={newFoodData.unit}
                      onChange={handleNewFoodChange}
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="個">個</option>
                      <option value="枚">枚</option>
                      <option value="本">本</option>
                    </Select>
                  </FormControl>
                </Grid>

                <Box w="full" p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" color="blue.800" fontWeight="semibold" mb={2}>
                    💡 ヒント
                  </Text>
                  <Text fontSize="xs" color="blue.700">
                    栄養情報は100gあたりの値を入力してください。サービングサイズは1回分の量です。
                  </Text>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCreateFoodClose}>
                キャンセル
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={submitting}>
                作成
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Recipe Detail Modal */}
      <Modal isOpen={isRecipeDetailOpen} onClose={onRecipeDetailClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedRecipe?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRecipe && (
              <VStack spacing={4} align="stretch">
                <Box h="200px" bg="gray.200" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                  <Icon as={selectedRecipe.icon} boxSize={20} color="gray.400" />
                </Box>
                
                <Text color="gray.700">{selectedRecipe.description}</Text>
                
                <Divider />
                
                <Box>
                  <Heading size="sm" mb={3}>栄養情報</Heading>
                  <SimpleGrid columns={2} spacing={3}>
                    <Box p={3} bg={hoverBg} borderRadius="md">
                      <Text fontSize="xs" color="gray.600">カロリー</Text>
                      <Text fontWeight="bold">{selectedRecipe.calories} kcal</Text>
                    </Box>
                    <Box p={3} bg={hoverBg} borderRadius="md">
                      <Text fontSize="xs" color="gray.600">タンパク質</Text>
                      <Text fontWeight="bold">{selectedRecipe.protein}g</Text>
                    </Box>
                    <Box p={3} bg={hoverBg} borderRadius="md">
                      <Text fontSize="xs" color="gray.600">炭水化物</Text>
                      <Text fontWeight="bold">{selectedRecipe.carbs}g</Text>
                    </Box>
                    <Box p={3} bg={hoverBg} borderRadius="md">
                      <Text fontSize="xs" color="gray.600">脂質</Text>
                      <Text fontWeight="bold">{selectedRecipe.fats}g</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
                
                <Divider />
                
                <HStack justify="space-between">
                  <HStack>
                    <Icon as={FiCoffee} />
                    <Text fontSize="sm">調理時間: {selectedRecipe.time}</Text>
                  </HStack>
                  <HStack>
                    <Text fontSize="sm">👤 {selectedRecipe.servings}</Text>
                  </HStack>
                </HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRecipeDetailClose}>
              閉じる
            </Button>
            <Button colorScheme="brand" onClick={() => {
              toast({
                title: 'レシピを食事に追加',
                description: 'この機能は近日公開予定です',
                status: 'info',
                duration: 3000,
              });
            }}>
              食事に追加
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Plan Modal */}
      <Modal isOpen={isCreatePlanOpen} onClose={onCreatePlanClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新しい食事プランを作成</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>プラン名</FormLabel>
                <Input placeholder="例: 私の減量プラン" />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>目標カロリー (kcal/日)</FormLabel>
                <Input type="number" placeholder="2000" />
              </FormControl>
              
              <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
                <FormControl isRequired>
                  <FormLabel>タンパク質 (g)</FormLabel>
                  <Input type="number" placeholder="150" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>炭水化物 (g)</FormLabel>
                  <Input type="number" placeholder="200" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>脂質 (g)</FormLabel>
                  <Input type="number" placeholder="60" />
                </FormControl>
              </Grid>
              
              <FormControl isRequired>
                <FormLabel>期間</FormLabel>
                <Select placeholder="期間を選択">
                  <option value="7">7日間</option>
                  <option value="14">14日間</option>
                  <option value="30">30日間</option>
                </Select>
              </FormControl>
              
              <Box w="full" p={4} bg="purple.50" borderRadius="md">
                <Text fontSize="sm" color="purple.800" fontWeight="semibold" mb={2}>
                  💡 ヒント
                </Text>
                <Text fontSize="xs" color="purple.700">
                  プランを作成すると、毎日の目標値が自動的に設定されます。
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreatePlanClose}>
              キャンセル
            </Button>
            <Button colorScheme="brand" onClick={() => {
              toast({
                title: 'プランを作成しました',
                status: 'success',
                duration: 3000,
              });
              onCreatePlanClose();
            }}>
              作成
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Recipe Modal */}
      <Modal isOpen={isCreateRecipeOpen} onClose={onCreateRecipeClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新しいレシピを追加</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>レシピ名</FormLabel>
                <Input placeholder="例: ヘルシーチキンサラダ" />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>説明</FormLabel>
                <Input placeholder="レシピの簡単な説明" />
              </FormControl>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl isRequired>
                  <FormLabel>カロリー (kcal)</FormLabel>
                  <Input type="number" placeholder="400" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>調理時間</FormLabel>
                  <Input placeholder="例: 30分" />
                </FormControl>
              </Grid>
              
              <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
                <FormControl isRequired>
                  <FormLabel>タンパク質 (g)</FormLabel>
                  <Input type="number" placeholder="40" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>炭水化物 (g)</FormLabel>
                  <Input type="number" placeholder="30" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>脂質 (g)</FormLabel>
                  <Input type="number" placeholder="15" />
                </FormControl>
              </Grid>
              
              <FormControl isRequired>
                <FormLabel>人数</FormLabel>
                <Input placeholder="例: 2人分" />
              </FormControl>
              
              <Box w="full" p={4} bg="green.50" borderRadius="md">
                <Text fontSize="sm" color="green.800" fontWeight="semibold" mb={2}>
                  💡 ヒント
                </Text>
                <Text fontSize="xs" color="green.700">
                  レシピを追加すると、食事計画に簡単に組み込むことができます。
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateRecipeClose}>
              キャンセル
            </Button>
            <Button colorScheme="brand" onClick={() => {
              toast({
                title: 'レシピを追加しました',
                status: 'success',
                duration: 3000,
              });
              onCreateRecipeClose();
            }}>
              追加
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Nutrition;
