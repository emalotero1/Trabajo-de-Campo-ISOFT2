import React from 'react';
import { Box } from '@mui/material';
import Navbar from './Layout/Navbar'; 
import TodoPc from './TodoPC';
import MisDatos from './MisDatos';

const Index = () => {
  return (
    <Box className="main-wrapper">
      <Navbar />
     <TodoPc></TodoPc>

    </Box>
  );
};

export default Index;