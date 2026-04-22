import React from 'react';
import { Alert, Snackbar } from '@mui/material';

const SuccessAlert = ({ open, onClose, message }) => (
  <Snackbar
    open={open}
    autoHideDuration={2000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    sx={{ zIndex: 1400 }}
  >
    <Alert
      severity="success"
      variant="filled"
      onClose={onClose}
      sx={{
        backgroundColor: '#10ce1aff', // verde fuerte
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

export default SuccessAlert;
