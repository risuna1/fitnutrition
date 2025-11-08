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
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Spinner,
  Center,
  useColorModeValue,
  Avatar,
  VStack,
  HStack,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FiSave, FiUser } from 'react-icons/fi';
import usersService from '../services/users';
import { useAuthStore } from '../store/authStore';
import { ACTIVITY_LEVELS, FITNESS_GOALS } from '../utils/constants';

const Profile = () => {
  const toast = useToast();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    gender: '',
    height: '',
    activity_level: '',
    fitness_goal: '',
  });
  const [originalData, setOriginalData] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadProfile();
  }, []);

  // Check for unsaved changes when formData changes
  useEffect(() => {
    if (originalData) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, originalData]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '変更が保存されていません。ページを離れますか？';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await usersService.getProfile();
      const userData = response.data;
      const userProfile = userData.profile || {};
      
      setProfile(userData);
      const profileData = {
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        date_of_birth: userData.date_of_birth || '',
        gender: userProfile.gender || '',
        height: userProfile.height || '',
        activity_level: userProfile.activity_level || '',
        fitness_goal: userProfile.fitness_goal || '',
      };
      setFormData(profileData);
      setOriginalData(profileData);
      setHasUnsavedChanges(false);
    } catch (error) {
      toast({
        title: 'プロフィール読み込みエラー',
        description: error.response?.data?.detail || 'プロフィールの読み込みに失敗しました',
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
      // Separate user data and profile data
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        date_of_birth: formData.date_of_birth || null,
      };

      const profileData = {
        gender: formData.gender || null,
        height: formData.height ? parseFloat(formData.height) : null,
        activity_level: formData.activity_level || null,
        fitness_goal: formData.fitness_goal || null,
      };

      // Update user basic info
      await usersService.updateProfile(userData);
      
      // Update profile details
      await usersService.updateProfileDetails(profileData);

      // Reset unsaved changes flag
      setOriginalData(formData);
      setHasUnsavedChanges(false);

      toast({
        title: 'プロフィールを更新しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadProfile();
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'プロフィール更新エラー',
        description: error.response?.data?.detail || error.response?.data?.error || 'プロフィールの更新に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
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
      <Box mb={8}>
        <Heading size="lg" mb={2}>プロフィール設定</Heading>
        <Text color="gray.600">個人情報と設定を管理</Text>
      </Box>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>未保存の変更があります</AlertTitle>
            <AlertDescription>
              変更を保存するには、下の「変更を保存」ボタンをクリックしてください。
            </AlertDescription>
          </Box>
        </Alert>
      )}

      <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={6}>
        {/* Profile Card */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              <Avatar
                size="2xl"
                name={`${formData.first_name} ${formData.last_name}`}
                bg="brand.500"
              />
              <Box textAlign="center">
                <Heading size="md">{formData.first_name} {formData.last_name}</Heading>
                <Text color="gray.600" fontSize="sm">{formData.email}</Text>
              </Box>
              <Divider />
              <VStack align="stretch" w="full" spacing={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">登録日</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '未設定'}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">活動レベル</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {ACTIVITY_LEVELS.find(l => l.value === formData.activity_level)?.label || '未設定'}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">フィットネス目標</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {FITNESS_GOALS.find(g => g.value === formData.fitness_goal)?.label || '未設定'}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Profile Form */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">個人情報</Heading>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <Box>
                  <Heading size="sm" mb={4}>基本情報</Heading>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <FormControl isRequired>
                      <FormLabel>名</FormLabel>
                      <Input
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="太郎"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>姓</FormLabel>
                      <Input
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="山田"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>生年月日</FormLabel>
                      <Input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>性別</FormLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        placeholder="性別を選択"
                      >
                        <option value="male">男性</option>
                        <option value="female">女性</option>
                        <option value="other">その他</option>
                      </Select>
                    </FormControl>
                  </Grid>
                </Box>

                <Divider />

                {/* Fitness Information */}
                <Box>
                  <Heading size="sm" mb={4}>フィットネス情報</Heading>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <FormControl>
                      <FormLabel>活動レベル</FormLabel>
                      <Select
                        name="activity_level"
                        value={formData.activity_level}
                        onChange={handleChange}
                        placeholder="活動レベルを選択"
                      >
                        {ACTIVITY_LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>フィットネス目標</FormLabel>
                      <Select
                        name="fitness_goal"
                        value={formData.fitness_goal}
                        onChange={handleChange}
                        placeholder="目標を選択"
                      >
                        {FITNESS_GOALS.map((goal) => (
                          <option key={goal.value} value={goal.value}>
                            {goal.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Box>

                <Divider />

                {/* Action Buttons */}
                <HStack justify="flex-end" spacing={4}>
                  <Button variant="outline" onClick={loadProfile}>
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    leftIcon={<FiSave />}
                    isLoading={submitting}
                  >
                    変更を保存
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Grid>

      {/* Account Statistics */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} mt={6}>
        <CardHeader>
          <Heading size="md">アカウント統計</Heading>
        </CardHeader>
        <CardBody>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color="brand.500">
                {profile?.total_measurements || 0}
              </Text>
              <Text fontSize="sm" color="gray.600">記録した測定値</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color="green.500">
                {profile?.total_meals || 0}
              </Text>
              <Text fontSize="sm" color="gray.600">記録した食事</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                {profile?.total_workouts || 0}
              </Text>
              <Text fontSize="sm" color="gray.600">完了したワークアウト</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                {profile?.days_active || 0}
              </Text>
              <Text fontSize="sm" color="gray.600">アクティブ日数</Text>
            </Box>
          </Grid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Profile;
