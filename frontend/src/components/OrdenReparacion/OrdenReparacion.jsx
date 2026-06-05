import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, MenuItem, Grid, Alert, Snackbar 
} from '@mui/material';
import { 
  FiFileText, FiTool, FiRefreshCw, FiSearch, FiCheckCircle 
} from 'react-icons/fi';
import Navbar from '../../components/Layout/Navbar';

import '../../styles/GenerarOrden.css';

export default function GenerarOrden() {
  const [busqueda, setBusqueda] = useState('');
  const [equiposDb, setEquiposDb] = useState([]); 
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados para alertas de feedback
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ severity: 'success', message: '' });
  
  const [ordenData, setOrdenData] = useState({
    estado: 'PENDIENTE DE REVISION', // Valor por defecto para el estado inicial
    observaciones: ''
  });

  // 1. LLAMADO AL BACKEND: Traer equipos disponibles
  const cargarEquiposDisponibles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // Recuperamos el JWT del login

      const response = await fetch('http://localhost:5000/api/equipos/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        setEquiposDb(data.equipos);
      } else {
        mostrarAlerta('error', data.message || 'Error al cargar equipos.');
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      mostrarAlerta('error', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar el componente
  useEffect(() => {
    cargarEquiposDisponibles();
  }, []);

  // 2. FILTRO DE BÚSQUEDA SOBRE LOS DATOS REALES
  const equiposFiltrados = equiposDb.filter(eq => {
    const termino = busqueda.toLowerCase();
    const cpuMatch = eq.cpu ? eq.cpu.toLowerCase().includes(termino) : false;
    
    const nombreCliente = eq.cliente ? `${eq.cliente.name} ${eq.cliente.lastname}`.toLowerCase() : '';
    const clienteMatch = nombreCliente.includes(termino);

    return cpuMatch || clienteMatch;
  });

  // 3. ENVÍO DE LA ORDEN AL BACKEND
  const handleGenerarOrden = async (e) => {
    e.preventDefault();
    if (!equipoSeleccionado) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/ordenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_equipo: equipoSeleccionado._id, 
          estado: ordenData.estado,
          observaciones: ordenData.observaciones
        })
      });

      const data = await response.json();

      if (data.ok) {
        mostrarAlerta('success', '¡Orden de reparación abierta en el pool exitosamente!');
        handleCancelar(); // Limpiamos selección
        cargarEquiposDisponibles();
      } else {
        mostrarAlerta('error', data.msg || 'Error al generar la orden.');
      }

    } catch (error) {
      console.error("Error al enviar la orden:", error);
      mostrarAlerta('error', 'Error interno al procesar el requerimiento.');
    }
  };

  const handleChange = (e) => {
    setOrdenData({ ...ordenData, [e.target.name]: e.target.value });
  };

  const handleSeleccionarEquipo = (eq) => {
    setEquipoSeleccionado(eq);
  };

  const handleCancelar = () => {
    setEquipoSeleccionado(null);
    setOrdenData({ estado: 'PENDIENTE DE REVISION', observaciones: '' });
  };

  const mostrarAlerta = (severity, message) => {
    setAlertConfig({ severity, message });
    setAlertOpen(true);
  };

  return (
    <Box className="orden-wrapper" style={{ paddingTop: '120px' }}>
      <Navbar />
      <div className="orden-glow"></div>

      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box', position: 'relative', zIndex: 10 }}>
        
        {/* CABECERA */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <Box>
            <Typography variant="h4" style={{ margin: 0, textTransform: 'uppercase', fontWeight: 900, color: '#fff' }}>
              Generar Orden de Reparación
            </Typography>
            <Typography style={{ marginTop: '6px', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#8a8f98', letterSpacing: '1px' }}>
              APERTURA DE TICKET EN POOL DE ESPERA
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {equipoSeleccionado && (
              <Button 
                variant="outlined" 
                onClick={handleCancelar} 
                style={{ borderColor: '#ef4444', color: '#ef4444', fontWeight: 700 }}
              >
                CANCELAR
              </Button>
            )}
            <Button 
              variant="contained" 
              onClick={handleGenerarOrden}
              disabled={!equipoSeleccionado || loading}
              style={{ 
                backgroundColor: equipoSeleccionado ? '#00a8e8' : 'rgba(0, 168, 232, 0.2)', 
                color: equipoSeleccionado ? '#0d0f11' : 'rgba(255,255,255,0.3)', 
                fontWeight: 800, 
                letterSpacing: '1px', 
                padding: '10px 24px'
              }}
            >
              GENERAR ORDEN
            </Button>
          </Box>
        </header>

        {/* GRILLA PRINCIPAL */}
        <Grid container spacing={4} alignItems="flex-start">
          
          {/* COLUMNA IZQUIERDA: SELECCIÓN DE EQUIPO REAL */}
          <Grid item xs={12} lg={7}>
            <div className="orden-panel">
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FiRefreshCw className={loading ? "spin-animation" : ""} color="#00a8e8" size={18} onClick={cargarEquiposDisponibles} style={{ cursor: 'pointer' }} />
                  <Typography style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px' }}>
                    EQUIPOS EN ESPERA ({equiposFiltrados.length})
                  </Typography>
                </Box>
                <TextField 
                  placeholder="Buscar por dueño o hardware..." 
                  value={busqueda} 
                  onChange={(e) => setBusqueda(e.target.value)} 
                  className="industrial-input" 
                  size="small"
                  InputProps={{ startAdornment: <FiSearch style={{ color: '#64748b', marginRight: '8px' }} /> }}
                  sx={{ width: '260px' }}
                />
              </header>

              <div className="orden-table-container">
                <table className="orden-table" style={{ minWidth: '600px' }}>
                  <thead>
                    <tr>
                      <th>Hardware</th>
                      <th>Cliente</th>
                      <th>Falla Reportada</th>
                      <th style={{ textAlign: 'right' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equiposFiltrados.map((eq) => (
                      <tr key={eq._id} className={equipoSeleccionado?._id === eq._id ? 'selected' : ''}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>{eq.cpu || 'N/A'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Gab: {eq.gabinete || 'Genérico'}</div>
                        </td>
                        <td>
                          <div style={{ color: '#00a8e8', fontWeight: 600 }}>
                            {eq.cliente ? `${eq.cliente.name} ${eq.cliente.lastname}` : 'Sin dueño'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{eq.cliente?.email || ''}</div>
                        </td>
                        <td style={{ color: '#8a8f98', fontSize: '0.85rem', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {eq.fallaReportada || 'No especifica'} 
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {equipoSeleccionado?._id === eq._id ? (
                            <FiCheckCircle color="#00a8e8" size={20} />
                          ) : (
                            <Button 
                              onClick={() => handleSeleccionarEquipo(eq)} 
                              sx={{ minWidth: 'auto', color: '#64748b', fontWeight: 700, fontSize: '0.8rem' }}
                            >
                              SELECCIONAR
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {equiposFiltrados.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: '#64748b', padding: '24px', fontFamily: 'JetBrains Mono' }}>
                          NO HAY EQUIPOS DISPONIBLES EN MOSTRADOR
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Grid>

          {/* COLUMNA DERECHA: CONFIGURACIÓN DE LA ORDEN */}
          <Grid item xs={12} lg={5}>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* RESUMEN DEL EQUIPO SELECCIONADO */}
              <div className="orden-panel" style={{ backgroundColor: equipoSeleccionado ? 'rgba(0, 168, 232, 0.05)' : 'rgba(22, 25, 29, 0.8)', borderColor: equipoSeleccionado ? '#00a8e8' : '#2d3238' }}>
                <header style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                  <FiFileText color={equipoSeleccionado ? "#00a8e8" : "#64748b"} size={18} />
                  <Typography style={{ marginLeft: '8px', fontWeight: 700, fontSize: '0.85rem', color: equipoSeleccionado ? '#fff' : '#64748b' }}>
                    Información del Ticket
                  </Typography>
                </header>
                
                {equipoSeleccionado ? (
                  <Box>
                    <Typography style={{ color: '#8a8f98', fontSize: '0.75rem', fontFamily: 'JetBrains Mono', marginBottom: '4px' }}>EQUIPO A REPARAR</Typography>
                    <Typography style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px' }}>{equipoSeleccionado.cpu}</Typography>
                    
                    <Typography style={{ color: '#8a8f98', fontSize: '0.75rem', fontFamily: 'JetBrains Mono', marginBottom: '4px' }}>CLIENTE ASOCIADO</Typography>
                    <Typography style={{ color: '#00a8e8', fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>
                      {equipoSeleccionado.cliente ? `${equipoSeleccionado.cliente.name} ${equipoSeleccionado.cliente.lastname}` : 'N/A'}
                    </Typography>

                    <Typography style={{ color: '#8a8f98', fontSize: '0.75rem', fontFamily: 'JetBrains Mono', marginBottom: '4px' }}>SÍNTOMAS / FALLA REPORTADA</Typography>
                    <Typography style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.03)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                      {equipoSeleccionado.fallaReportada || 'No especifica'}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 3, opacity: 0.5 }}>
                    <FiFileText size={36} color="#64748b" style={{ marginBottom: '10px' }} />
                    <Typography style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: '#64748b' }}>SELECCIONE UN EQUIPO</Typography>
                  </Box>
                )}
              </div>

              {/* FORMULARIO DE RESTRICCIONES */}
              <div className="orden-panel" style={{ opacity: equipoSeleccionado ? 1 : 0.5, pointerEvents: equipoSeleccionado ? 'auto' : 'none' }}>
                <header style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                  <FiTool color="#f59e0b" size={18} />
                  <Typography style={{ marginLeft: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                    Estado Operativo Inicial
                  </Typography>
                </header>
                
                <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <TextField 
                    fullWidth 
                    multiline 
                    rows={4} 
                    label="NOTAS INTERNAS / OBSERVACIONES VISUALES DEL RECEPCIONISTA" 
                    name="observaciones" 
                    value={ordenData.observaciones} 
                    onChange={handleChange} 
                    className="industrial-input" 
                  />
                </Box>
              </div>

            </Box>
          </Grid>
        </Grid>
      </div>

      {/* SNACKBAR PARA POPUPS DE ALERTA SUCCESS/ERROR */}
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={() => setAlertOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setAlertOpen(false)} severity={alertConfig.severity} sx={{ width: '100%', fontWeight: 600 }}>
          {alertConfig.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}