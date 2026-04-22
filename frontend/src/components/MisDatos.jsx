import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Avatar,
  Divider
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../context/authProvider';
import { useNavigate } from 'react-router-dom';
import '../styles/misDatos.css';

const MisDatos = () => {
  const { user } = useAuth();
  console.log("Contenido de user:", user);
  const navigate = useNavigate();

  if (!user) {
    return <Typography variant="h6">Cargando datos del usuario...</Typography>;
  }

  return (
    <Box className="mis-datos-root">
      <Box className="mis-datos-container">

        <Box className="mis-datos-header">
          <Avatar className="mis-datos-avatar">
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="h5" className="orbitron header-username">
            {user.username}
          </Typography>
          <Typography variant="body2" className="email">{user.email}</Typography>
        </Box>

        <Divider className="divider" />

        <Grid container spacing={2} className="mis-datos-info m-5">
          <Grid item xs={12} md={6}>
            <Grid container direction="column" spacing={1}>
              <Grid item><Typography><strong>Nombre:</strong> {user.name || '-'}</Typography></Grid>
              <Grid item><Typography><strong>Apellido:</strong> {user.lastname || '-'}</Typography></Grid>
              <Grid item><Typography><strong>Celular:</strong> {user.cel || '-'}</Typography></Grid>
              <Grid item><Typography><strong>Email:</strong> {user.email || '-'}</Typography></Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container direction="column" spacing={1}>
              <Grid item><Typography><strong>Rol:</strong> {user.rol}</Typography></Grid>             
              <Grid item><Typography>
                Creado el: {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-AR') : 'Cargando fecha...'}
                </Typography></Grid>
              <Grid item><Typography><strong>Activo:</strong> {user.active ? 'Sí' : 'No'}</Typography></Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider className="divider" />

        <Grid item container spacing={2} justifyContent="center" marginTop={2}>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => console.log('Abrir modal de cambio de contraseña')}
              className="boton"
            >
              Cambiar contraseña
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              className="boton"
            >
              Volver
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default MisDatos;
