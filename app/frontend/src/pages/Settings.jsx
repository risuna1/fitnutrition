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
        title: '設定を保存しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '設定保存エラー',
        description: error.response?.data?.detail || '設定の保存に失敗しました',
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
        title: 'パスワードが一致しません',
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
        title: 'パスワードを変更しました',
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
        title: 'パスワード変更エラー',
        description: error.response?.data?.detail || 'パスワードの変更に失敗しました',
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
        title: 'アカウントを削除しました',
        description: 'アカウントは完全に削除されました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      logout();
      navigate('/login');
    } catch (error) {
      toast({
        title: 'アカウント削除エラー',
        description: error.response?.data?.detail || 'アカウントの削除に失敗しました',
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
        <Heading size="lg" mb={2}>設定</Heading>
        <Text color="gray.600">アカウント設定と環境設定を管理</Text>
      </Box>

      <VStack spacing={6} align="stretch">
        {/* Notification Preferences */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">通知設定</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb={0} fontWeight="medium">メール通知</FormLabel>
                  <Text fontSize="sm" color="gray.600">アカウントに関するメール更新を受信</Text>
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
                  <FormLabel mb={0} fontWeight="medium">ワークアウトリマインダー</FormLabel>
                  <Text fontSize="sm" color="gray.600">予定されたワークアウトのリマインダーを受信</Text>
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
                  <FormLabel mb={0} fontWeight="medium">食事リマインダー</FormLabel>
                  <Text fontSize="sm" color="gray.600">食事記録のリマインダーを受信</Text>
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
                  <FormLabel mb={0} fontWeight="medium">進捗更新</FormLabel>
                  <Text fontSize="sm" color="gray.600">進捗に関する更新を受信</Text>
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
                  <FormLabel mb={0} fontWeight="medium">週間サマリー</FormLabel>
                  <Text fontSize="sm" color="gray.600">活動の週間サマリーを受信</Text>
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
                  設定を保存
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Change Password */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">パスワード変更</Heading>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleChangePassword}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>現在のパスワード</FormLabel>
                  <Input
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    placeholder="現在のパスワードを入力"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>新しいパスワード</FormLabel>
                  <Input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    placeholder="新しいパスワードを入力"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>新しいパスワード（確認）</FormLabel>
                  <Input
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    placeholder="新しいパスワードを再入力"
                  />
                </FormControl>

                <HStack justify="flex-end" pt={4}>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    leftIcon={<FiLock />}
                    isLoading={submitting}
                  >
                    パスワードを変更
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>

        {/* Danger Zone */}
        <Card bg={bgColor} borderWidth="1px" borderColor="red.500">
          <CardHeader>
            <Heading size="md" color="red.500">危険な操作</Heading>
          </CardHeader>
          <CardBody>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>アカウント削除</AlertTitle>
                <AlertDescription>
                  アカウントを削除すると元に戻せません。すべてのデータが完全に削除されます。
                </AlertDescription>
              </Box>
            </Alert>
            <Button
              colorScheme="red"
              leftIcon={<FiTrash2 />}
              onClick={onOpen}
            >
              アカウントを削除
            </Button>
          </CardBody>
        </Card>
      </VStack>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>アカウント削除</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="error" mb={4}>
              <AlertIcon />
              この操作は取り消せません！
            </Alert>
            <Text>
              本当にアカウントを削除しますか？測定値、食事、ワークアウト、進捗を含むすべてのデータが完全に削除されます。
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              キャンセル
            </Button>
            <Button colorScheme="red" onClick={handleDeleteAccount}>
              はい、アカウントを削除します
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Settings;
