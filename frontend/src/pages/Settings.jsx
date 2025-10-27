import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Switch,
  useToast,
  Spinner,
  Center,
  useColorModeValue,
  VStack,
  HStack,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FiSave, FiTrash2, FiLock } from 'react-icons/fi';
import usersService from '../services/users';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Settings = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { logout } = useAuthStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    workout_reminders: true,
    meal_reminders: true,
    progress_updates: true,
    weekly_summary: true,
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await usersService.getPreferences();
      setPreferences(response.data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const handleSavePreferences = async () => {
    setSubmitting(true);
    try {
      await usersService.updatePreferences(preferences);
      toast({
        title: 'Preferences saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error saving preferences',
        description: error.response?.data?.detail || 'Failed to save preferences',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      await usersService.changePassword({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      toast({
        title: 'Password changed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      toast({
        title: 'Error changing password',
        description: error.response?.data?.detail || 'Failed to change password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await usersService.deleteAccount();
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      logout();
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error deleting account',
        description: error.response?.data?.detail || 'Failed to delete account',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    onClose();
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
        <Heading size="lg" mb={2}>Settings</Heading>
        <Text color="gray.600">Manage your account settings and preferences</Text>
      </Box>

      <VStack spacing={6} align="stretch">
        {/* Notification Preferences */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Notification Preferences</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="medium">Email Notifications</FormLabel>
                  <Text fontSize="sm" color="gray.600">Receive email updates about your account</Text>
                </Box>
                <Switch
                  isChecked={preferences.email_notifications}
                  onChange={() => handlePreferenceChange('email_notifications')}
                  colorScheme="brand"
                />
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="medium">Workout Reminders</FormLabel>
                  <Text fontSize="sm" color="gray.600">Get reminded about scheduled workouts</Text>
                </Box>
                <Switch
                  isChecked={preferences.workout_reminders}
                  onChange={() => handlePreferenceChange('workout_reminders')}
                  colorScheme="brand"
                />
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="medium">Meal Reminders</FormLabel>
                  <Text fontSize="sm" color="gray.600">Get reminded to log your meals</Text>
                </Box>
                <Switch
                  isChecked={preferences.meal_reminders}
                  onChange={() => handlePreferenceChange('meal_reminders')}
                  colorScheme="brand"
                />
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="medium">Progress Updates</FormLabel>
                  <Text fontSize="sm" color="gray.600">Receive updates about your progress</Text>
                </Box>
                <Switch
                  isChecked={preferences.progress_updates}
                  onChange={() => handlePreferenceChange('progress_updates')}
                  colorScheme="brand"
                />
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="medium">Weekly Summary</FormLabel>
                  <Text fontSize="sm" color="gray.600">Get a weekly summary of your activities</Text>
                </Box>
                <Switch
                  isChecked={preferences.weekly_summary}
                  onChange={() => handlePreferenceChange('weekly_summary')}
                  colorScheme="brand"
                />
              </FormControl>

              <HStack justify="flex-end" pt={4}>
                <Button
                  colorScheme="brand"
                  leftIcon={<FiSave />}
                  onClick={handleSavePreferences}
                  isLoading={submitting}
                >
                  Save Preferences
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Change Password */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Change Password</Heading>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleChangePassword}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Current Password</FormLabel>
                  <Input
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>New Password</FormLabel>
                  <Input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Confirm New Password</FormLabel>
                  <Input
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />
                </FormControl>

                <HStack justify="flex-end" pt={4}>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    leftIcon={<FiLock />}
                    isLoading={submitting}
                  >
                    Change Password
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>

        {/* Danger Zone */}
        <Card bg={bgColor} borderWidth="1px" borderColor="red.500">
          <CardHeader>
            <Heading size="md" color="red.500">Danger Zone</Heading>
          </CardHeader>
          <CardBody>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Delete Account</AlertTitle>
                <AlertDescription>
                  Once you delete your account, there is no going back. All your data will be permanently deleted.
                </AlertDescription>
              </Box>
            </Alert>
            <Button
              colorScheme="red"
              leftIcon={<FiTrash2 />}
              onClick={onOpen}
            >
              Delete Account
            </Button>
          </CardBody>
        </Card>
      </VStack>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="error" mb={4}>
              <AlertIcon />
              This action cannot be undone!
            </Alert>
            <Text>
              Are you sure you want to delete your account? All your data including measurements, meals, workouts, and progress will be permanently deleted.
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteAccount}>
              Yes, Delete My Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Settings;
