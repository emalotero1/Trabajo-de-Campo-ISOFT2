import React, { useState, useEffect } from 'react';
// NUEVO: Importamos useNavigate
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, TextField, Grid, 
  List, ListItem, ListItemButton, ListItemText, ListItemIcon, Fade, Divider,
  // NUEVO: Importamos los componentes del Dialog
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { 
  FiCpu, FiAlertCircle, FiUser, FiCheckCircle, 
  FiPlusCircle, FiAlertTriangle, FiEdit3, FiSearch 
} from 'react-icons/fi';
import '../../styles/AltaEquipo.css'; 
import Navbar from '../../components/Layout/Navbar';

import { obtenerClientes, obtenerEquiposDisponibles, guardarEquipo } from '../../Services/equipoServicio';

export default function AltaEquipo() {
  // NUEVO: Instanciamos navigate
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  
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
  
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedEquipoId, setSelectedEquipoId] = useState(null); 
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [busquedaEquipo, setBusquedaEquipo] = useState('');
  const [errorForm, setErrorForm] = useState(null);
  const [tabIzq, setTabIzq] = useState(0); 
  const PAGE_SIZE = 5;
  const [pageEquipos, setPageEquipos] = useState(0);
  const [pageClientes, setPageClientes] = useState(0);

  // NUEVO: Estados para controlar el Pop-up de éxito
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const token = localStorage.getItem('token');

  const cargarDatosBD = async () => {
    try {
      const [dataClientes, dataEquipos] = await Promise.all([
        obtenerClientes(token),
        obtenerEquiposDisponibles(token)
      ]);

      setClientes(dataClientes.clients || []);
      setEquipos(dataEquipos.equipos || []);
    } catch (err) {
      console.error("❌ ERROR AL CARGAR DATOS:", err);
    }
  };

  useEffect(() => {
    cargarDatosBD();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleLimpiarFormulario = () => {
    setSelectedEquipoId(null);
    setSelectedClientId(null);
    setFormData({ cpu: '', ram: '', gpu: '', fuente: '', gabinete: '', mother: '', discos: '', fallaReportada: '' });
    setBusquedaCliente('');
    setErrorForm(null);
  };

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

    if (!payload.clienteId) {
      return setErrorForm("DEBE VINCULAR UN CLIENTE AL EQUIPO OBLIGATORIAMENTE.");
    }
    if (!payload.fallaReportada || payload.fallaReportada.length < 15) {
      return setErrorForm("EL REPORTE DE SERVICIO DEBE DETALLAR AL MENOS 15 CARACTERES.");
    }

    try {
      await guardarEquipo(payload, selectedEquipoId, token);
      
      // NUEVO: Configuramos el mensaje y abrimos el dialog ANTES de limpiar el formulario
      const mensajeExito = selectedEquipoId 
        ? "Las especificaciones del equipo han sido actualizadas correctamente." 
        : "El equipo ha sido registrado e ingresado al taller con éxito.";
      
      setDialogMessage(mensajeExito);
      setOpenDialog(true);
      
      handleLimpiarFormulario();
      cargarDatosBD();

    } catch (error) {
      console.error("❌ ERROR EN LA OPERACIÓN:", error);
      setErrorForm(error.response?.data?.message || "ERROR AL PROCESAR LA SOLICITUD EN EL SERVIDOR");
    }
  };

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

  const totalPagesEquipos = Math.ceil(equiposFiltrados.length / PAGE_SIZE) || 1;
  const equiposPaginados = equiposFiltrados.slice(pageEquipos * PAGE_SIZE, pageEquipos * PAGE_SIZE + PAGE_SIZE);

  const totalPagesClientes = Math.ceil(clientesFiltrados.length / PAGE_SIZE) || 1;
  const clientesPaginados = clientesFiltrados.slice(pageClientes * PAGE_SIZE, pageClientes * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    setPageEquipos(0);
  }, [busquedaEquipo, equipos]);

  useEffect(() => {
    setPageClientes(0);
  }, [busquedaCliente, clientes]);

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
              {selectedEquipoId ? `EDITANDO REGISTRO INTERNO` : "REGISTRO DE ESPECIFICACIONES Y VINCULACIÓN"}
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

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, alignItems: 'flex-start', minHeight: { lg: '75vh' } }}>

          {/* COLUMNA IZQUIERDA: LISTADOS (TABS) */}
          <Box sx={{ width: '100%', maxWidth: { lg: '420px' }, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Box className="corp-panel" sx={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
              
              {/* TABS */}
              <Box sx={{ display: 'flex', borderBottom: '1px solid #2d3238', mb: 2 }}>
                <Button
                  onClick={() => setTabIzq(0)}
                  sx={{
                    flex: 1, py: 2, px: 2, fontWeight: 'bold', textTransform: 'uppercase',
                    fontSize: '0.85rem', letterSpacing: '0.5px',
                    color: tabIzq === 0 ? '#00a8e8' : '#64748b',
                    borderBottom: tabIzq === 0 ? '2px solid #00a8e8' : 'none',
                    transition: 'all 0.2s', backgroundColor: 'transparent',
                    '&:hover': { color: '#e2e8f0' }
                  }}
                >
                  <FiCpu style={{ marginRight: '8px', display: 'inline' }} /> EQUIPOS EN TALLER
                </Button>
                <Button
                  onClick={() => setTabIzq(1)}
                  sx={{
                    flex: 1, py: 2, px: 2, fontWeight: 'bold', textTransform: 'uppercase',
                    fontSize: '0.85rem', letterSpacing: '0.5px',
                    color: tabIzq === 1 ? '#00a8e8' : '#64748b',
                    borderBottom: tabIzq === 1 ? '2px solid #00a8e8' : 'none',
                    transition: 'all 0.2s', backgroundColor: 'transparent',
                    '&:hover': { color: '#e2e8f0' }
                  }}
                >
                  <FiUser style={{ marginRight: '8px', display: 'inline' }} /> DUEÑO DEL EQUIPO
                </Button>
              </Box>

              {/* TAB CONTENT */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
                
                {/* TAB 0: EQUIPOS */}
                {tabIzq === 0 && (
                  <>
                    <TextField 
                      fullWidth 
                      placeholder="BUSCAR POR DUEÑO, CPU, GABINETE..." 
                      value={busquedaEquipo} 
                      onChange={(e) => setBusquedaEquipo(e.target.value)} 
                      className="industrial-input-corp" 
                      size="small"
                      InputProps={{ startAdornment: <FiSearch style={{ color: '#64748b', marginRight: '8px' }} /> }}
                    />

                    <Box className="client-list-container" sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                      <List disablePadding>
                        {equiposPaginados.map(eq => (
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
                            NO SE ENCONTRARON EQUIPOS REGISTRADOS
                          </Typography>
                        )}
                        {equiposFiltrados.length > 0 && equiposPaginados.length === 0 && (
                          <Typography className="no-data-msg-corp" sx={{ p: 3, textAlign: 'center' }}>
                            NO HAY EQUIPOS EN ESTA PÁGINA
                          </Typography>
                        )}
                      </List>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, gap: 2 }}>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setPageEquipos(p => Math.max(0, p - 1))}
                        disabled={pageEquipos <= 0}
                        sx={{ color: '#64748b', fontWeight: 700 }}
                      >
                        ANTERIOR
                      </Button>
                      <Typography sx={{ color: '#8a8f98', fontWeight: 700, fontSize: '0.9rem' }}>
                        Página {pageEquipos + 1} de {totalPagesEquipos}
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setPageEquipos(p => Math.min(totalPagesEquipos - 1, p + 1))}
                        disabled={pageEquipos >= totalPagesEquipos - 1}
                        sx={{ color: '#64748b', fontWeight: 700 }}
                      >
                        SIGUIENTE
                      </Button>
                    </Box>
                  </>
                )}

                {/* TAB 1: CLIENTES */}
                {tabIzq === 1 && (
                  <>
                    <TextField 
                      fullWidth 
                      label={selectedEquipoId ? "CLIENTE FIJADO (NO MODIFICABLE)" : "BUSCAR CLIENTE..."}
                      value={busquedaCliente} 
                      onChange={(e) => setBusquedaCliente(e.target.value)} 
                      disabled={!!selectedEquipoId}
                      className="industrial-input-corp" 
                      size="small"
                    />

                    <Box className="client-list-container" sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                      <List disablePadding>
                        {clientesPaginados.map(c => (
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
                        {clientesFiltrados.length === 0 && (
                          <Typography className="no-data-msg-corp" sx={{ p: 3, textAlign: 'center' }}>
                            NO SE ENCONTRARON DUEÑOS REGISTRADOS
                          </Typography>
                        )}
                        {clientesFiltrados.length > 0 && clientesPaginados.length === 0 && (
                          <Typography className="no-data-msg-corp" sx={{ p: 3, textAlign: 'center' }}>
                            NO HAY DUEÑOS EN ESTA PÁGINA
                          </Typography>
                        )}
                      </List>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, gap: 2 }}>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setPageClientes(p => Math.max(0, p - 1))}
                        disabled={pageClientes <= 0}
                        sx={{ color: '#64748b', fontWeight: 700 }}
                      >
                        ANTERIOR
                      </Button>
                      <Typography sx={{ color: '#8a8f98', fontWeight: 700, fontSize: '0.9rem' }}>
                        Página {pageClientes + 1} de {totalPagesClientes}
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setPageClientes(p => Math.min(totalPagesClientes - 1, p + 1))}
                        disabled={pageClientes >= totalPagesClientes - 1}
                        sx={{ color: '#64748b', fontWeight: 700 }}
                      >
                        SIGUIENTE
                      </Button>
                    </Box>

                    {/* STATUS FOOTER */}
                    <Box className="status-footer-corp" sx={{ pt: 2, borderTop: '1px solid #2d3238', mt: 2 }}>
                      <Typography className="status-label">VINCULACIÓN</Typography>
                      <div className={`status-badge ${selectedClientId ? 'linked' : 'pending'}`}>
                        {selectedClientId ? <><span className="blink">●</span> ASIGNADO</> : <><span>○</span> PENDIENTE</>}
                      </div>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Box>

          {/* COLUMNA DERECHA: FORMULARIO UNIFICADO (ESPECIFICACIONES + REPORTE) */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Box className={`corp-panel ${selectedEquipoId ? 'panel-mode-edit' : ''}`} sx={{ height: '100%', minWidth: 0 }}>
              
              {/* SECCIÓN 1: ESPECIFICACIONES DE HARDWARE */}
              <header className="corp-panel-header">
                <FiCpu color={selectedEquipoId ? "#f59e0b" : "#00a8e8"} size={20} />
                <Typography className="corp-panel-title">ESPECIFICACIONES DE HARDWARE</Typography>
              </header>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="MOTHERBOARD" name="mother" value={formData.mother} onChange={handleChange} className="industrial-input-corp" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="CPU" name="cpu" value={formData.cpu} onChange={handleChange} className="industrial-input-corp" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="RAM" name="ram" value={formData.ram} onChange={handleChange} className="industrial-input-corp" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="GPU" name="gpu" value={formData.gpu} onChange={handleChange} className="industrial-input-corp" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="DISCOS / ALMACENAMIENTO" name="discos" value={formData.discos} onChange={handleChange} className="industrial-input-corp" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="FUENTE" name="fuente" value={formData.fuente} onChange={handleChange} className="industrial-input-corp" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="GABINETE" name="gabinete" value={formData.gabinete} onChange={handleChange} className="industrial-input-corp" />
                </Grid>
              </Grid>

              <Divider sx={{ borderColor: '#2d3238', mb: 4 }} />

              {/* SECCIÓN 2: REPORTE DE CLIENTE */}
              <header className="corp-panel-header">
                <FiAlertCircle color="#f59e0b" size={20} />
                <Typography className="corp-panel-title">REPORTE DE CLIENTE (SÍNTOMAS)</Typography>
              </header>
              <TextField 
                fullWidth 
                multiline 
                rows={8} 
                label="DESCRIPCIÓN DE FALLA" 
                name="fallaReportada" 
                value={formData.fallaReportada} 
                onChange={handleChange} 
                className="industrial-input-corp" 
              />
            </Box>
          </Box>

        </Box>
      </Box>

      {/* NUEVO: POP-UP (DIALOG) DE ÉXITO */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#161c22',
            border: '1px solid #3e484f',
            color: '#bdc8d1',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ color: '#8ed5ff', display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 'bold' }}>
          <FiCheckCircle size={24} color="#10b981" />
          ¡Operación Exitosa!
        </DialogTitle>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            sx={{ color: '#87929a', '&:hover': { color: '#fff' } }}
          >
            ACEPTAR
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}