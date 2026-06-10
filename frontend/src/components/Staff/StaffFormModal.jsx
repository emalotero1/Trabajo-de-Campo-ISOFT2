import React, { useState, useEffect } from 'react';
import { 
  Modal, Box, Typography, TextField, Button, 
  IconButton, Fade, Backdrop, MenuItem, Grid, 
  CircularProgress 
} from '@mui/material';
import { FiX, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { useUsuarios } from '../../hooks/useUsuario';
import { useAuth } from '../../../context/authProvider'; 

// Objeto de estilos global para los Inputs oscuros
const darkInputStyle = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(0,0,0,0.2)',
    '& fieldset': { borderColor: '#2d3238' },
    '&:hover fieldset': { borderColor: '#3e484f' },
    '&.Mui-focused fieldset': { borderColor: '#00a8e8' },
  },
  '& .MuiInputLabel-root': { color: '#8a8f98', '&.Mui-focused': { color: '#00a8e8' } },
  '& .MuiInputBase-input': { color: '#fff' }
};

// Estilos para que el menú desplegable del Select sea oscuro
const darkMenuProps = {
  PaperProps: {
    sx: { bgcolor: '#1a1d24', color: '#fff', border: '1px solid #2d3238', '& .MuiMenuItem-root:hover': { bgcolor: 'rgba(0, 168, 232, 0.1)' } }
  }
};

const StaffFormModal = ({ open, onClose, onSave, staffToEdit }) => {
  const { createUser, updateUser, loading, error, setError } = useUsuarios();
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', username: '', email: '', 
    password: '', rol: 'recepcionista', cel: '', active: true
  });

  useEffect(() => {
    if (open) {
      setSuccess(null);
      if (setError) setError(null);
      if (staffToEdit) {
        setFormData({ ...staffToEdit, password: '' });
      } else {
        setFormData({ 
          nombre: '', apellido: '', username: '', email: '', 
          password: '', rol: 'recepcionista', cel: '', active: true 
        });
      }
    }
  }, [staffToEdit, open, setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    try {
      if (staffToEdit) {
        await updateUser(staffToEdit._id, formData);
        setSuccess('ACCESO ACTUALIZADO CORRECTAMENTE');
      } else {
        await createUser(formData);
        setSuccess('NUEVO USUARIO REGISTRADO CON ÉXITO');
      }
      setTimeout(() => {
        if (onSave) onSave();
        onClose();
      }, 1500);
    } catch (err) { console.error(err); }
  };

  return (
    <Modal
      open={open} 
      onClose={!loading ? onClose : null}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.85)' } } }}
    >
      <Fade in={open}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '100%', maxWidth: 650, bgcolor: '#0b0f19', border: '1px solid #2d3238',
          borderRadius: 2, boxShadow: '0 0 40px rgba(0,0,0,0.9)', outline: 'none',
          display: 'flex', flexDirection: 'column'
        }}>
          {/* BOTÓN CERRAR */}
          <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16, color: '#8a8f98', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <FiX />
          </IconButton>
          
          <Box sx={{ p: { xs: 3, md: 5 } }}>
            {/* ENCABEZADO */}
            <header style={{ marginBottom: '2rem' }}>
              <Typography sx={{ color: '#8a8f98', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <span style={{ color: loading ? '#f59e0b' : '#10b981' }}>●</span> 
                {staffToEdit ? 'RECONFIGURANDO ACCESOS' : 'INICIALIZANDO NUEVO USUARIO'}
              </Typography>
              <Typography variant="h5" sx={{ color: '#8ed5ff', fontWeight: 900 }}>
                {staffToEdit ? 'EDITAR USUARIO' : 'ALTA DE PERSONAL'}
              </Typography>
            </header>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* IDENTIDAD */}
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="NOMBRE" name="nombre" value={formData.nombre} onChange={handleChange} required sx={darkInputStyle} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="APELLIDO" name="apellido" value={formData.apellido} onChange={handleChange} required sx={darkInputStyle} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="CELULAR" name="cel" value={formData.cel} onChange={handleChange} required sx={darkInputStyle} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="NIVEL DE ACCESO" name="rol" value={formData.rol} onChange={handleChange} sx={darkInputStyle} SelectProps={{ MenuProps: darkMenuProps }}>
                      <MenuItem value="administrador">ADMINISTRADOR</MenuItem>
                      <MenuItem value="recepcionista">RECEPCIONISTA</MenuItem>
                      <MenuItem value="tecnico">TÉCNICO</MenuItem>
                  </TextField>
                </Grid>

                {/* SEGURIDAD */}
                <Grid item xs={12}>
                  <TextField fullWidth label="EMAIL INSTITUCIONAL" name="email" value={formData.email} onChange={handleChange} type="email" required sx={darkInputStyle} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="USERNAME (LOGIN)" name="username" value={formData.username} onChange={handleChange} required sx={darkInputStyle} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="ACCESS KEY (CONTRASEÑA)" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    type="password" 
                    required={!staffToEdit} 
                    sx={darkInputStyle} 
                    placeholder={staffToEdit ? "Dejar vacío para mantener actual" : "Mínimo 6 caracteres"}
                  />
                </Grid>
              </Grid>

              {/* ACCIONES Y BOTONES */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 3, borderTop: '1px solid #2d3238' }}>
                <Button variant="outlined" onClick={onClose} disabled={loading} sx={{ color: '#fff', borderColor: '#3e484f', fontWeight: 700, px: 4, '&:hover': { borderColor: '#fff' } }}>
                  DESCARTAR
                </Button>
                <Button variant="contained" type="submit" disabled={loading} sx={{ bgcolor: '#00a8e8', color: '#0b0f19', fontWeight: 800, px: 4, '&:hover': { bgcolor: '#008bbf' }, '&.Mui-disabled': { bgcolor: '#2d3238', color: '#64748b' } }}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'CONFIRMAR CAMBIOS'}
                </Button>
              </Box>

              {/* FEEDBACK */}
              {success && (
                <Fade in={!!success}>
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1, color: '#10b981', fontWeight: 700 }}>
                    <FiCheckCircle size={18} /> {success}
                  </Box>
                </Fade>
              )}
              {error && (
                <Fade in={!!error}>
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1, color: '#ef4444', fontWeight: 700 }}>
                    <FiAlertTriangle size={18} /> {error.toUpperCase()}
                  </Box>
                </Fade>
              )}
            </form>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default StaffFormModal;