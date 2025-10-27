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

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await usersService.getProfile();
      setProfile(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        date_of_birth: response.data.date_of_birth || '',
        gender: response.data.gender || '',
        height: response.data.height || '',
        activity_level: response.data.activity_level || '',
        fitness_goal: response.data.fitness_goal || '',
      });
    } catch (error) {
      toast({
        title: 'Error loading profile',
        description: error.response?.data?.detail || 'Failed to load profile',
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
      const response = await usersService.updateProfile(formData);
      updateUser(response.data);
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadProfile();
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error.response?.data?.detail || 'Failed to update profile',
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
        <Heading size="lg" mb={2}>Profile Settings</Heading>
        <Text color="gray.600">Manage your personal information and preferences</Text>
      </Box>

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
                  <Text fontSize="sm" color="gray.600">Member Since</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Activity Level</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {ACTIVITY_LEVELS.find(l => l.value === formData.activity_level)?.label || 'Not set'}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Fitness Goal</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {FITNESS_GOALS.find(g => g.value === formData.fitness_goal)?.label || 'Not set'}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Profile Form */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Personal Information</Heading>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <Box>
                  <Heading size="sm" mb={4}>Basic Information</Heading>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <FormControl isRequired>
                      <FormLabel>First Name</FormLabel>
                      <Input
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="John"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Doe"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Date of Birth</FormLabel>
                      <Input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        placeholder="Select gender"
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Height (cm)</FormLabel>
                      <Input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="175"
                      />
                    </FormControl>
                  </Grid>
                </Box>

                <Divider />

                {/* Fitness Information */}
                <Box>
                  <Heading size="sm" mb={4}>Fitness Information</Heading>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <FormControl>
                      <FormLabel>Activity Level</FormLabel>
                      <Select
                        name="activity_level"
                        value={formData.activity_level}
                        onChange={handleChange}
                        placeholder="Select activity level"
                      >
                        {ACTIVITY_LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Fitness Goal</FormLabel>
                      <Select
                        name="fitness_goal"
                        value={formData.fitness_goal}
                        onChange={handleChange}
                        placeholder="Select fitness goal"
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
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    leftIcon={<FiSave />}
                    isLoading={submitting}
                  >
                    Save Changes
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
          <Heading size="md">Account Statistics</Heading>
        </CardHeader>
        <CardBody>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color="brand.500">
                {profile?.total_measurements || 0}
              </Text>
              <Text fontSize="sm" color="gray.600">Measurements Logged</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color="green.500">
                {profile?.total_meals || 0}
              </Text>
              <Text fontSize="sm" color="gray.600">Meals Logged</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                {profile?.total_workouts || 0}
              </Text>
              <Text fontSize="sm" color="gray.600">Workouts Completed</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                {profile?.days_active || 0}
              </Text>
              <Text fontSize="sm" color="gray.600">Days Active</Text>
            </Box>
          </Grid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Profile;
