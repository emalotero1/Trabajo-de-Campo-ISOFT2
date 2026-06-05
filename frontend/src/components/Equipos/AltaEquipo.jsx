// src/components/AltaEquipo/AltaEquipo.jsx (o la ruta donde lo tengas)
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, Grid, 
  List, ListItem, ListItemButton, ListItemText, ListItemIcon, Fade
} from '@mui/material';
import { 
  FiCpu, FiAlertCircle, FiUser, FiCheckCircle, 
  FiPlusCircle, FiAlertTriangle, FiEdit3, FiRefreshCw, FiSearch 
} from 'react-icons/fi';
import '../../styles/AltaEquipo.css'; 
import Navbar from '../../components/Layout/Navbar';

// Importamos la lógica extraída
import { obtenerClientes, obtenerEquiposDisponibles, guardarEquipo } from '../../Services/equipoServicio';

export default function AltaEquipo() {
  // Estados para los datos lógicos
  const [clientes, setClientes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  
  // Estado para el formulario (Alta/Edición)
  const [formData, setFormData] = useState({
    mother: '',
    cpu: '',
    ram: '',
    gpu: '',
    fuente: '',
    gabinete: '',
    discos: '',
    fallaReportada: ''
  });
  
  // Estados de control y UI
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedEquipoId, setSelectedEquipoId] = useState(null); 
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [busquedaEquipo, setBusquedaEquipo] = useState('');
  const [errorForm, setErrorForm] = useState(null);

  const token = localStorage.getItem('token');

  // 1. CARGA INICIAL DE DATOS (Delegada al servicio)
  const cargarDatosBD = async () => {
    try {
      const [dataClientes, dataEquipos] = await Promise.all([
        obtenerClientes(token),
        obtenerEquiposDisponibles(token)
      ]);

      setClientes(dataClientes.clients || []);
      setEquipos(dataEquipos.equipos || []);
    } catch (err) {
      console.error("❌ ERROR AL CARGAR DATOS DESDE EL BACKEND:", err);
    }
  };

  useEffect(() => {
    cargarDatosBD();
  }, []);

  // 2. TEMPORIZADOR DE ERRORES
  useEffect(() => {
    if (!errorForm) return;
    const timer = setTimeout(() => setErrorForm(null), 5000);
    return () => clearTimeout(timer);
  }, [errorForm]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. SELECCIONAR UN EQUIPO PARA EDITAR
  const handleSeleccionarEquipo = (equipo) => {
    setSelectedEquipoId(equipo._id);
    setSelectedClientId(equipo.cliente?._id || null); 
    setFormData({
      cpu: equipo.cpu || '',
      ram: equipo.ram || '',
      gpu: equipo.gpu || '',
      fuente: equipo.fuente || '',
      gabinete: equipo.gabinete || '',
      mother: equipo.mother || '',
      discos: equipo.discos || '',
      fallaReportada: equipo.fallaReportada || ''
    });
    setErrorForm(null);
  };

  // 4. LIMPIAR FORMULARIO 
  const handleLimpiarFormulario = () => {
    setSelectedEquipoId(null);
    setSelectedClientId(null);
    setFormData({ cpu: '', ram: '', gpu: '', fuente: '', gabinete: '', mother: '', discos: '', fallaReportada: '' });
    setBusquedaCliente('');
    setErrorForm(null);
  };

  // 5. PROCESAR ACCIÓN (Delegada al servicio)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const payload = {
      clienteId: selectedClientId,
      mother: formData.mother?.trim(),
      cpu: formData.cpu.trim(),
      ram: formData.ram.trim(),
      gpu: formData.gpu.trim(),
      fuente: formData.fuente.trim(),
      gabinete: formData.gabinete.trim(),
      discos: formData.discos?.trim(),
      fallaReportada: formData.fallaReportada.trim()
    };

    // Validaciones de negocio
    if (!payload.clienteId) {
      return setErrorForm("DEBE VINCULAR UN CLIENTE AL EQUIPO OBLIGATORIAMENTE.");
    }
    if (!payload.fallaReportada || payload.fallaReportada.length < 15) {
      return setErrorForm("EL REPORTE DE SERVICIO DEBE DETALLAR AL MENOS 15 CARACTERES.");
    }

    try {
      // Delegamos la complejidad de Axios a nuestro archivo apiService
      await guardarEquipo(payload, selectedEquipoId, token);
      
      alert(selectedEquipoId ? "ÉXITO: Especificaciones del equipo actualizadas." : "ÉXITO: Equipo registrado e ingresado al taller.");
      
      handleLimpiarFormulario();
      cargarDatosBD();

    } catch (error) {
      console.error("❌ ERROR EN LA OPERACIÓN:", error);
      setErrorForm(error.response?.data?.message || "ERROR AL PROCESAR LA SOLICITUD EN EL SERVIDOR");
    }
  };

  // --- FILTROS EN TIEMPO REAL ---
  const clientesFiltrados = clientes.filter(c => {
    const nombreCompleto = `${c.name || ''} ${c.lastname || ''}`.toLowerCase();
    return nombreCompleto.includes(busquedaCliente.toLowerCase());
  });

  const equiposFiltrados = equipos.filter(eq => {
    const dueño = `${eq.cliente?.name || ''} ${eq.cliente?.lastname || ''}`.toLowerCase();
    const hardware = `${eq.cpu || ''} ${eq.gabinete || ''}`.toLowerCase();
    const query = busquedaEquipo.toLowerCase();
    return dueño.includes(query) || hardware.includes(query);
  });

  return (
    <Box className="alta-equipo-wrapper corporate-dark home-content-z">
      <Navbar />
      <div className="corporate-glow"></div>
      <Box sx={{ maxWidth: '1600px', mx: 'auto', px: 3, position: 'relative', zIndex: 1 }}>
        
        {/* CABECERA PRINCIPAL */}
        <header className="alta-equipo-header">
          <Box>
            <Typography variant="h4" className="alta-equipo-title">
              {selectedEquipoId ? "MODIFICACIÓN DE EQUIPO" : "ALTA DE EQUIPO"}
            </Typography>
            <Typography className="alta-equipo-subtitle">
              {selectedEquipoId ? `EDITANDO REGISTRO INTERNO [ID: ${selectedEquipoId.slice(-6)}]` : "REGISTRO DE ESPECIFICACIONES Y VINCULACIÓN"}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
           {selectedEquipoId && (
              <Button 
                className="btn-corp-cancel" 
                variant="outlined" 
                onClick={handleLimpiarFormulario}
                style={{ borderColor: '#ef4444', color: '#ef4444' }} 
              >
                CANCELAR EDICIÓN
              </Button>
            )}
            <Button 
              className={selectedEquipoId ? "btn-corp-update" : "btn-corp-submit"} 
              variant="contained" 
              onClick={handleSubmit}
              style={{ backgroundColor: selectedEquipoId ? '#f59e0b' : '#00a8e8' }}
            >
              {selectedEquipoId ? "GUARDAR CAMBIOS" : "REGISTRAR EQUIPO"}
            </Button>
          </Box>
        </header>

        {/* FEEDBACK DE VALIDACIÓN AUTOMÁTICA */}
        {errorForm && (
          <Fade in={!!errorForm}>
            <Box className="feedback-error-corp" sx={{ mb: 3 }}>
              <FiAlertTriangle /> ERROR: {errorForm}
            </Box>
          </Fade>
        )}

        <Grid container spacing={3}>
          
          {/* PANEL IZQUIERDO: LISTADO COMPLETO DE EQUIPOS */}
          <Grid item xs={12} lg={4}>
            <Box className="corp-panel" sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px' }}>
              <header className="corp-panel-header">
                <FiRefreshCw color="#00a8e8" size={20} className="spin-hover" />
                <Typography className="corp-panel-title">EQUIPOS EN TALLER</Typography>
              </header>
              
              <TextField 
                fullWidth 
                placeholder="BUSCAR POR DUEÑO, CPU, GABINETE..." 
                value={busquedaEquipo} 
                onChange={(e) => setBusquedaEquipo(e.target.value)} 
                className="industrial-input-corp" 
                size="small"
                InputProps={{ startAdornment: <FiSearch style={{ color: '#64748b', marginRight: '8px' }} /> }}
                sx={{ mb: 2 }}
              />

              <Box className="client-list-container" sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '500px' }}>
                <List disablePadding>
                  {equiposFiltrados.map(eq => (
                    <ListItem key={eq._id} disablePadding className={`client-list-item ${selectedEquipoId === eq._id ? 'selected-edit' : ''}`}>
                      <ListItemButton onClick={() => handleSeleccionarEquipo(eq)}>
                        <ListItemText 
                          primary={eq.cpu ? eq.cpu : `Gabinete: ${eq.gabinete || 'Genérico'}`}
                          secondary={`Dueño: ${eq.cliente?.name || 'S/N'} ${eq.cliente?.lastname || ''}`}
                          secondaryTypographyProps={{ style: { color: '#818cf8', fontWeight: 500 } }}
                          classes={{ primary: 'client-item-name' }}
                        />
                        <ListItemIcon sx={{ minWidth: 'auto' }}>
                          <FiEdit3 color={selectedEquipoId === eq._id ? "#f59e0b" : "#64748b"} size={18} />
                        </ListItemIcon>
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {equiposFiltrados.length === 0 && (
                    <Typography className="no-data-msg-corp" sx={{ p: 3, textAlign: 'center' }}>
                      NO SE ENCONTRARON EQUIPOS registrados
                    </Typography>
                  )}
                </List>
              </Box>
            </Box>
          </Grid>

          {/* PANEL CENTRAL: FORMULARIO DE ESPECIFICACIONES CON MOTHER Y DISCOS */}
          <Grid item xs={12} md={7} lg={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box className={`corp-panel ${selectedEquipoId ? 'panel-mode-edit' : ''}`}>
                <header className="corp-panel-header">
                  <FiCpu color={selectedEquipoId ? "#f59e0b" : "#00a8e8"} size={20} />
                  <Typography className="corp-panel-title">ESPECIFICACIONES DE HARDWARE</Typography>
                </header>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="MOTHERBOARD" name="mother" value={formData.mother} onChange={handleChange} className="industrial-input-corp" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="CPU" name="cpu" value={formData.cpu} onChange={handleChange} className="industrial-input-corp" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="RAM" name="ram" value={formData.ram} onChange={handleChange} className="industrial-input-corp" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="GPU" name="gpu" value={formData.gpu} onChange={handleChange} className="industrial-input-corp" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="DISCOS / ALMACENAMIENTO" name="discos" value={formData.discos} onChange={handleChange} className="industrial-input-corp" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="FUENTE" name="fuente" value={formData.fuente} onChange={handleChange} className="industrial-input-corp" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="GABINETE" name="gabinete" value={formData.gabinete} onChange={handleChange} className="industrial-input-corp" />
                  </Grid>
                </Grid>
              </Box>

              <Box className="corp-panel">
                <header className="corp-panel-header">
                  <FiAlertCircle color="#f59e0b" size={20} />
                  <Typography className="corp-panel-title">REPORTE DE CLIENTE (SÍNTOMAS)</Typography>
                </header>
                <TextField fullWidth multiline rows={5} label="DESCRIPCIÓN DE FALLA" name="fallaReportada" value={formData.fallaReportada} onChange={handleChange} className="industrial-input-corp" />
              </Box>
            </Box>
          </Grid>

          {/* PANEL DERECHO: CLIENTES ASOCIADOS */}
          <Grid item xs={12} md={5} lg={3}>
            <Box className="corp-panel" sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px' }}>
              <header className="corp-panel-header">
                <FiUser color="#10b981" size={20} />
                <Typography className="corp-panel-title">DUEÑO DEL EQUIPO</Typography>
              </header>
              
              <TextField 
                fullWidth 
                label={selectedEquipoId ? "CLIENTE FIJADO (NO MODIFICABLE)" : "BUSCAR CLIENTE..."}
                value={busquedaCliente} 
                onChange={(e) => setBusquedaCliente(e.target.value)} 
                disabled={!!selectedEquipoId}
                className="industrial-input-corp" 
                size="small" 
                sx={{ mb: 2 }}
              />

              <Box className="client-list-container" sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '400px' }}>
                <List disablePadding>
                  {clientesFiltrados.map(c => (
                    <ListItem key={c._id} disablePadding className={`client-list-item ${selectedClientId === c._id ? 'selected' : ''}`}>
                      <ListItemButton onClick={() => !selectedEquipoId && setSelectedClientId(c._id)} disabled={!!selectedEquipoId}>
                        <ListItemText 
                          primary={`${c.name} ${c.lastname}`} 
                          secondary={c.email || 'Sin Correo'} 
                          secondaryTypographyProps={{ style: { color: '#818cf8', fontSize: '0.8rem' } }}
                          classes={{ primary: 'client-item-name' }}
                        />
                        <ListItemIcon sx={{ minWidth: 'auto' }}>
                          {selectedClientId === c._id ? <FiCheckCircle color="#00a8e8" size={20} /> : <FiPlusCircle color="#64748b" size={20} />}
                        </ListItemIcon>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box className="status-footer-corp" sx={{ mt: 'auto', pt: 2 }}>
                <Typography className="status-label">VINCULACIÓN</Typography>
                <div className={`status-badge ${selectedClientId ? 'linked' : 'pending'}`}>
                  {selectedClientId ? <><span className="blink">●</span> ASIGNADO</> : <><span>○</span> PENDIENTE</>}
                </div>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}