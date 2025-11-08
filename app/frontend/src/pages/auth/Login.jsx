import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  Link,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import authService from '../../services/auth';

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const login = useAuthStore((state) => state.login);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData);
      
      // Backend returns { user, tokens: { refresh, access }, message }
      const accessToken = response.tokens?.access || response.access;
      const refreshToken = response.tokens?.refresh || response.refresh;
      
      login(accessToken, refreshToken, response.user);
      
      toast({
        title: 'ログイン成功',
        description: 'おかえりなさい！',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'ログイン失敗',
        description: error.response?.data?.error || error.response?.data?.detail || '認証情報が無効です',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="md" py={12}>
        <Box
          bg={bgColor}
          p={8}
          borderRadius="xl"
          boxShadow="xl"
          border="1px"
          borderColor={borderColor}
        >
          {/* Logo/Title */}
          <Box textAlign="center" mb={8}>
            <Heading
              size="2xl"
              bgGradient="linear(to-r, brand.400, brand.600)"
              bgClip="text"
              mb={2}
            >
              FitNutrition
            </Heading>
            <Text color="gray.600">アカウントにログイン</Text>
          </Box>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>メールアドレス</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="メールアドレスを入力"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>パスワード</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="パスワードを入力"
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                fontSize="md"
                isLoading={loading}
                loadingText="ログイン中..."
              >
                ログイン
              </Button>
            </Stack>
          </form>

          {/* Links */}
          <Stack mt={6} spacing={2}>
            <Text textAlign="center" fontSize="sm">
              アカウントをお持ちでないですか？{' '}
              <Link as={RouterLink} to="/register" color="brand.500" fontWeight="semibold">
                新規登録
              </Link>
            </Text>
          </Stack>
        </Box>

        {/* Demo credentials */}
        {/* <Box mt={4} p={4} bg="blue.50" borderRadius="md" fontSize="sm">
          <Text fontWeight="bold" mb={2}>デモアカウント:</Text>
          <Text>メール: demo@fitnutrition.com</Text>
          <Text>パスワード: demo123456</Text>
        </Box> */}
      </Container>
    </Flex>
  );
};

export default Login;
