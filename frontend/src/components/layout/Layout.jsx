import React from 'react';
import {
  Box,
  Flex,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Flex minH="100vh" bg={bgColor}>
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} onClose={onClose} />

      {/* Main Content */}
      <Flex flex="1" direction="column" ml={{ base: 0, md: 60 }}>
        {/* Navbar */}
        <Navbar onOpen={onOpen} />

        {/* Page Content */}
        <Box as="main" flex="1" p={{ base: 4, md: 8 }} overflow="auto">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default Layout;
