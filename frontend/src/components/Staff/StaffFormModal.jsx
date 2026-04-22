import React, { useState, useEffect } from 'react';
import { 
  Modal, Box, Typography, TextField, Button, 
  IconButton, Fade, Backdrop, MenuItem, Grid, 
  CircularProgress 
} from '@mui/material';
import { FiX, FiUserPlus, FiLock, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { useUsers } from '../../hooks/Users/useUsers';
import { useAuth } from '../../../context/authProvider'; 
import '../../styles/HomeRoles.css'; 
import '../../styles/Staff.css';

const StaffFormModal = ({ open, onClose, onSave, staffToEdit }) => {
  const { createUser, updateUser, loading, error, setError } = useUsers();
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', lastname: '', username: '', email: '', 
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
          name: '', lastname: '', username: '', email: '', 
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
        setSuccess('SISTEMA_ACTUALIZADO_OK');
      } else {
        await createUser(formData);
        setSuccess('USUARIO_REGISTRADO_OK');
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
        <Box className="modal-corp-container">
          <IconButton onClick={onClose} className="modal-close-btn-corp">
            <FiX />
          </IconButton>
          
          <Box className="modal-corp-body">
            <header className="modal-corp-header">
              <Typography className="system-status-corp">
                <span className={loading ? "blink" : "dot-online"}>●</span> 
                {staffToEdit ? 'RECONFIGURING_ACCESS' : 'INITIALIZING_NEW_STAFF'}
              </Typography>
              <Typography variant="h5" className="modal-corp-title">
                {staffToEdit ? 'EDITAR_USUARIO' : 'ALTA_DE_PERSONAL'}
              </Typography>
            </header>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2.5}>
                {/* SECCIÓN IDENTIDAD */}
              
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="NOMBRE" name="name" value={formData.name} onChange={handleChange} required className="industrial-input-corp" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="APELLIDO" name="lastname" value={formData.lastname} onChange={handleChange} required className="industrial-input-corp" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="CELULAR" name="cel" value={formData.cel} onChange={handleChange} required className="industrial-input-corp" />
                </Grid>
                
                {/* SECCIÓN SEGURIDAD */}
                
                <Grid item xs={12}>
                  <TextField fullWidth label="EMAIL_INSTITUCIONAL" name="email" value={formData.email} onChange={handleChange} type="email" required className="industrial-input-corp" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="ID_USUARIO" name="username" value={formData.username} onChange={handleChange} required className="industrial-input-corp" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="NIVEL_ACCESO" name="rol" value={formData.rol} onChange={handleChange} className="industrial-input-corp">
                      <MenuItem value="administrador">ADMINISTRADOR</MenuItem>
                      <MenuItem value="recepcionista">RECEPCIONISTA</MenuItem>
                      <MenuItem value="tecnico">TÉCNICO</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="ACCESS_KEY" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    type="password" 
                    required={!staffToEdit} 
                    className="industrial-input-corp" 
                    placeholder={staffToEdit ? "DEJAR VACÍO PARA MANTENER ACTUAL" : "MÍNIMO 6 CARACTERES"}
                  />
                </Grid>
              </Grid>

              {/* ACCIONES - RESPONSIVAS */}
              <Box className="modal-corp-actions">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Button onClick={onClose} fullWidth className="btn-corp-cancel">DESCARTAR</Button>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Button type="submit" fullWidth className="btn-corp-submit" disabled={loading}>
                      {loading ? <CircularProgress size={20} color="inherit" /> : 'CONFIRMAR_CAMBIOS'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* FEEDBACK AREA */}
              <Box className="feedback-container-corp">
                {success && (
                  <Fade in={!!success}>
                    <Box className="feedback-success-corp"><FiCheckCircle /> {success}</Box>
                  </Fade>
                )}
                {error && (
                  <Fade in={!!error}>
                    <Box className="feedback-error-corp"><FiAlertTriangle /> ERROR: {error.toUpperCase()}</Box>
                  </Fade>
                )}
              </Box>
            </form>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default StaffFormModal;