import React, { useState, useEffect } from 'react';
import { 
  Modal, Box, Typography, TextField, Button, 
  IconButton, Fade, Backdrop, CircularProgress, Grid 
} from '@mui/material';
import { FiX, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { useClients } from '../../hooks/useClients'; 
import { useAuth } from '../../../context/authProvider'; 
import '../../styles/HomeRoles.css'; 
import '../../styles/Staff.css'; 

const ClientFormModal = ({ open, onClose, onSave, clientToEdit }) => {
  const { createClient, updateClient, loading, error, setError } = useClients();
  const { user, token } = useAuth();
  
  // SOLUCIÓN DEFINITIVA: Buscamos el token en todas sus posibles ubicaciones
  const authToken = token || user?.token || localStorage.getItem('token');

  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '', 
    lastname: '', 
    email: '', 
    domicilio: '', 
    cel: '', 
    active: true
  });

  useEffect(() => {
    if (open) {
      setSuccess(null);
      if (setError) setError(null);
      if (clientToEdit) {
        setFormData({ ...clientToEdit });
      } else {
        setFormData({ 
          name: '', lastname: '', email: '', domicilio: '', cel: '', active: true 
        });
      }
    }
  }, [clientToEdit, open, setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);

    // Validación de seguridad local antes de enviar
    if (!authToken) {
      if (setError) setError("SESIÓN_EXPIRADA_RELOGUEAR");
      return;
    }

    try {
      if (clientToEdit) {
        await updateClient(clientToEdit._id, formData, authToken);
        setSuccess('CLIENTE_ACTUALIZADO_OK');
      } else {
        await createClient(formData, authToken);
        setSuccess('CLIENTE_REGISTRADO_OK');
      }

      setTimeout(() => {
        if (onSave) onSave();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error en submit:", err);
    }
  };

  return (
    <Modal
      open={open} 
      onClose={!loading ? onClose : null}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ 
        backdrop: { 
          sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.85)' } 
        } 
      }}
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
                {clientToEdit ? 'UPDATING_CLIENT_DATA' : 'INITIALIZING_NEW_CLIENT'}
              </Typography>
              <Typography variant="h5" className="modal-corp-title">
                {clientToEdit ? 'EDITAR_CLIENTE' : 'ALTA_DE_CLIENTE'}
              </Typography>
            </header>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2.5}>
                {/* SECCIÓN DATOS PERSONALES */}
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="NOMBRE" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    className="industrial-input-corp" 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="APELLIDO" 
                    name="lastname" 
                    value={formData.lastname} 
                    onChange={handleChange} 
                    required 
                    className="industrial-input-corp" 
                  />
                </Grid>
                
                {/* SECCIÓN CONTACTO */}
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="CELULAR" 
                    name="cel" 
                    value={formData.cel} 
                    onChange={handleChange} 
                    className="industrial-input-corp" 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="EMAIL_CONTACTO" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    type="email" 
                    required 
                    className="industrial-input-corp" 
                  />
                </Grid>

                {/* SECCIÓN LOCALIZACIÓN */}
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="DOMICILIO" 
                    name="domicilio" 
                    value={formData.domicilio} 
                    onChange={handleChange} 
                    required 
                    className="industrial-input-corp" 
                  />
                </Grid>
              </Grid>

              {/* ACCIONES */}
              <Box className="modal-corp-actions">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Button onClick={onClose} fullWidth className="btn-corp-cancel">
                      DESCARTAR
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Button 
                      type="submit" 
                      fullWidth 
                      className="btn-corp-submit" 
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : 'CONFIRMAR_CAMBIOS'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* ÁREA DE FEEDBACK (ÉXITO / ERROR) */}
              <Box className="feedback-container-corp">
                {success && (
                  <Fade in={!!success}>
                    <Box className="feedback-success-corp">
                      <FiCheckCircle /> {success}
                    </Box>
                  </Fade>
                )}
                {error && (
                  <Fade in={!!error}>
                    <Box className="feedback-error-corp">
                      <FiAlertTriangle /> ERROR: {error.toUpperCase()}
                    </Box>
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

export default ClientFormModal;