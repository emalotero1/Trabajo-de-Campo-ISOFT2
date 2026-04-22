// src/components/Alerts/ErrorAlert.jsx
import React from 'react';
import { Alert, Snackbar } from '@mui/material';

const ErrorAlert = ({ open, onClose, message }) => (
  <Snackbar
    open={open}
    autoHideDuration={2000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bot', horizontal: 'center' }}
    sx={{
      zIndex: 1400, // Asegura que se muestre sobre otros elementos
    }}
  >
    <Alert
      severity="error"
      variant="filled"
      onClose={onClose}
      sx={{
        backgroundColor: '#d32f2f', // rojo fuerte
        color: '#fff',
        fontSize: '0.95rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        minWidth: '300px',
        textAlign: 'center',
      }}
    >
      {message}
    </Alert>
  </Snackbar>
);

export default ErrorAlert;
