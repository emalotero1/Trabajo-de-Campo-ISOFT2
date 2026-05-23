import React, { useState } from 'react';
import { 
  Box, Typography, Button, TextField, Grid, 
  List, ListItem, ListItemButton, ListItemText, ListItemIcon, Fade
} from '@mui/material';
import { FiCpu, FiAlertCircle, FiUser, FiCheckCircle, FiPlusCircle, FiAlertTriangle } from 'react-icons/fi';
import '../../styles/AltaEquipo.css'; 

export default function AltaEquipo({ clientes = [], onRegistrar }) {
  const [formData, setFormData] = useState({
    cpu: '',
    ram: '',
    gpu: '',
    fuente: '',
    gabinete: '',
    fallaReportada: ''
  });
  
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [errorForm, setErrorForm] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClientId) {
      setErrorForm("DEBE VINCULAR UN CLIENTE AL EQUIPO");
      return;
    }
    setErrorForm(null);
    if (onRegistrar) {
      onRegistrar({ clienteId: selectedClientId, especificaciones: formData });
    }
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nombre?.toLowerCase().includes(busquedaCliente.toLowerCase()) || 
    c.dni?.includes(busquedaCliente)
  );

  return (
    <Box className="alta-equipo-wrapper corporate-dark home-content-z">
      <div className="corporate-glow"></div>
      
      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: 3, position: 'relative', zIndex: 1 }}>
        
        {/* Cabecera */}
        <header className="alta-equipo-header">
          <Box>
            <Typography variant="h4" className="alta-equipo-title">
              ALTA DE EQUIPO
            </Typography>
            <Typography className="alta-equipo-subtitle">
              REGISTRO DE ESPECIFICACIONES DE HARDWARE Y VINCULACIÓN DE CLIENTE
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button className="btn-corp-cancel" variant="outlined">
              CANCELAR
            </Button>
            <Button className="btn-corp-submit" variant="contained" onClick={handleSubmit}>
              REGISTRAR EQUIPO
            </Button>
          </Box>
        </header>

        {/* FEEDBACK DE ERROR */}
        {errorForm && (
          <Fade in={!!errorForm}>
            <Box className="feedback-error-corp" sx={{ mb: 3, maxWidth: '800px' }}>
              <FiAlertTriangle /> ERROR: {errorForm}
            </Box>
          </Fade>
        )}

        <Grid container spacing={3}>
          {/* COLUMNA IZQUIERDA: ESPECIFICACIONES Y REPORTE */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* HARDWARE */}
              <Box className="corp-panel">
                <header className="corp-panel-header">
                  <FiCpu color="#00a8e8" size={20} />
                  <Typography className="corp-panel-title">ESPECIFICACIONES DE HARDWARE</Typography>
                </header>
                
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth label="CPU / PROCESADOR" name="cpu" 
                      value={formData.cpu} onChange={handleChange} 
                      className="industrial-input-corp" 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth label="MEMORIA RAM" name="ram" 
                      value={formData.ram} onChange={handleChange} 
                      className="industrial-input-corp" 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth label="PLACA DE VIDEO" name="gpu" 
                      value={formData.gpu} onChange={handleChange} 
                      className="industrial-input-corp" 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth label="FUENTE DE PODER" name="fuente" 
                      value={formData.fuente} onChange={handleChange} 
                      className="industrial-input-corp" 
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth label="GABINETE / CHASIS" name="gabinete" 
                      value={formData.gabinete} onChange={handleChange} 
                      className="industrial-input-corp" 
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* REPORTE DE FALLA */}
              <Box className="corp-panel">
                <header className="corp-panel-header">
                  <FiAlertCircle color="#f59e0b" size={20} />
                  <Typography className="corp-panel-title">REPORTE DE SERVICIO</Typography>
                </header>
                <TextField 
                  fullWidth multiline rows={4} 
                  label="DESCRIPCIÓN DE FALLA REPORTADA" name="fallaReportada" 
                  value={formData.fallaReportada} onChange={handleChange} 
                  className="industrial-input-corp" 
                />
              </Box>
            </Box>
          </Grid>

          {/* COLUMNA DERECHA: SELECCIÓN DE CLIENTE */}
          <Grid item xs={12} md={4}>
            <Box className="corp-panel" sx={{ display: 'flex', flexDirection: 'column' }}>
              <header className="corp-panel-header">
                <FiUser color="#10b981" size={20} />
                <Typography className="corp-panel-title">ASIGNACIÓN DE CLIENTE</Typography>
              </header>
              
              <TextField 
                fullWidth label="BUSCAR POR DNI O NOMBRE..." 
                value={busquedaCliente} onChange={(e) => setBusquedaCliente(e.target.value)} 
                className="industrial-input-corp" size="small" 
              />

              <Box className="client-list-container">
                <List disablePadding>
                  {clientesFiltrados.length > 0 ? (
                    clientesFiltrados.map(cliente => {
                      const isSelected = selectedClientId === cliente.id;
                      return (
                        <ListItem key={cliente.id} disablePadding className={`client-list-item ${isSelected ? 'selected' : ''}`}>
                          <ListItemButton onClick={() => setSelectedClientId(cliente.id)}>
                            <ListItemText 
                              primary={cliente.nombre} 
                              secondary={`ID: ${cliente.dni}`} 
                              classes={{ 
                                primary: `client-item-name ${isSelected ? 'selected' : ''}`, 
                                secondary: 'client-item-dni' 
                              }}
                            />
                            <ListItemIcon sx={{ minWidth: 'auto' }}>
                              {isSelected ? <FiCheckCircle color="#00a8e8" size={20} /> : <FiPlusCircle color="#64748b" size={20} />}
                            </ListItemIcon>
                          </ListItemButton>
                        </ListItem>
                      );
                    })
                  ) : (
                    <Typography className="no-data-msg-corp">
                      NO HAY COINCIDENCIAS
                    </Typography>
                  )}
                </List>
              </Box>

              <Box className="status-footer-corp" sx={{ mt: 'auto' }}>
                <Typography className="status-label">ESTADO SISTEMA</Typography>
                <div className={`status-badge ${selectedClientId ? 'linked' : 'pending'}`}>
                  {selectedClientId ? (
                    <><span className="blink">●</span> VINCULADO</>
                  ) : (
                    <><span>○</span> PENDIENTE</>
                  )}
                </div>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Botones Mobile */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2, mt: 4 }}>
          <Button className="btn-corp-submit" fullWidth onClick={handleSubmit}>
            REGISTRAR EQUIPO
          </Button>
          <Button className="btn-corp-cancel" fullWidth variant="outlined">
            CANCELAR
          </Button>
        </Box>

      </Box>
    </Box>
  );
}