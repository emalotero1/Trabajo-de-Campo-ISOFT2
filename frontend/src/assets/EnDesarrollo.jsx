// src/components/Utils/EnDesarrollo.jsx
import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { FiTool } from 'react-icons/fi';
import Navbar from '../components/Layout/Navbar';

const EnDesarrollo = ({ titulo, porcentaje }) => (
    <>
    <Navbar />
  <Box className="corp-panel" sx={{ p: 4, textAlign: 'center', mt: 4 }}>
    <FiTool size={48} color="#00a8e8" />
    <Typography variant="h5" sx={{ mt: 2, color: '#fff' }}>{titulo}</Typography>
    <Typography sx={{ color: '#64748b', mb: 3 }}>Esta funcionalidad se encuentra actualmente en desarrollo.</Typography>
    
    <Box sx={{ width: '50%', mx: 'auto' }}>
      <Typography sx={{ color: '#00a8e8', mb: 1, fontWeight: 'bold' }}>Progreso: {porcentaje}%</Typography>
      <LinearProgress variant="determinate" value={porcentaje} sx={{ height: 10, borderRadius: 5 }} />
    </Box>
  </Box>
  </>
);

export default EnDesarrollo;