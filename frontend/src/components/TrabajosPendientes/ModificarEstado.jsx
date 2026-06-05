// src/components/Taller/ModificarEstado.jsx (o tu ruta actual)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, Grid, Snackbar, Alert, CircularProgress } from '@mui/material';
import { 
  FiSettings, FiArrowLeft, FiClock, FiCpu, FiFileText, 
  FiCheckCircle, FiXCircle, FiTool 
} from 'react-icons/fi';
import Navbar from '../../components/Layout/Navbar';
import { useAuth } from '../../../context/authProvider';
import '../../styles/ModificarEstado.css';

// Importamos el servicio modularizado
import { obtenerOrdenPorId, actualizarEstadoTrabajo } from '../../services/ordenServicio';

const ESTADOS_REPARACION = [
  { id: 'PENDIENTE DE REVISION', icon: FiClock, titulo: 'Pendiente de Revisión', desc: 'EQUIPO EN ESPERA DE TÉCNICO ASIGNADO', nivel: 1 },
  { id: 'EN DIAGNOSTICO', icon: FiCpu, titulo: 'En Diagnóstico', desc: 'IDENTIFICACIÓN TÉCNICA DE FALLAS', nivel: 2 },
  { id: 'PRESUPUESTADO', icon: FiFileText, titulo: 'Presupuestado', desc: 'COSTOS ENVIADOS AL CLIENTE', nivel: 3 },
  { id: 'PRESUPUESTO ACEPTADO', icon: FiCheckCircle, titulo: 'Presupuesto Aceptado', desc: 'REPARACIÓN AUTORIZADA POR CLIENTE', nivel: 4 },
  { id: 'PRESUPUESTO RECHAZADO', icon: FiXCircle, titulo: 'Presupuesto Rechazado', desc: 'CLIENTE DECLINÓ LA REPARACIÓN', nivel: 4 },
  { id: 'REPARADO', icon: FiTool, titulo: 'Reparado', desc: 'INTERVENCIÓN TÉCNICA FINALIZADA', nivel: 5 },
];

export default function ModificarEstado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rol = user?.rol?.toLowerCase()?.trim() || 'tecnico'; 
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [nuevoEstadoSel, setNuevoEstadoSel] = useState('');
  const [bitacora, setBitacora] = useState('');
  
  const [alertConfig, setAlertConfig] = useState({ open: false, type: 'success', msg: '' });
  
  // CONSUMO DE API: Traer datos de la orden
  useEffect(() => {
    const fetchOrden = async () => {
      try {
        const data = await obtenerOrdenPorId(id);
        
        if (data.status === 'success' || data.ok) {
          const ordenDB = data.orden;
          setOrden(ordenDB);
          setNuevoEstadoSel(ordenDB.estado || 'PENDIENTE DE REVISION');
          setBitacora(ordenDB.observaciones || '');
        }
      } catch (error) {
        console.error("Error cargando orden:", error);
        setAlertConfig({ open: true, type: 'error', msg: 'No se pudo cargar la información de la orden.' });
      } finally {
        setLoading(false);
      }
    };
    fetchOrden();
  }, [id]);

  // CONSUMO DE API: Guardar cambios
  const handleGuardar = async () => {
    try {
      const data = await actualizarEstadoTrabajo(id, nuevoEstadoSel, bitacora);
      
      setAlertConfig({ open: true, type: 'success', msg: 'Estado actualizado correctamente' });
      setTimeout(() => navigate('/trabajospendientes'), 1500); 
    } catch (error) {
      console.error(error);
      setAlertConfig({ open: true, type: 'error', msg: 'Error al actualizar el estado en el servidor' });
    }
  };

  if (loading) return <Box className="modificar-wrapper" display="flex" justifyContent="center" alignItems="center"><CircularProgress sx={{color: '#00a8e8'}}/></Box>;
  if (!orden) return <Box className="modificar-wrapper" p={5}><Typography>Orden no encontrada.</Typography></Box>;

  const estadoGuardado = orden.estado || 'PENDIENTE DE REVISION';
  const nivelDB = ESTADOS_REPARACION.find(e => e.id === estadoGuardado)?.nivel || 1;

  const nombreCliente = orden.id_equipo?.cliente ? `${orden.id_equipo.cliente.name} ${orden.id_equipo.cliente.lastname}` : 'Cliente no registrado';
  const cpuEquipo = orden.id_equipo?.cpu || 'Equipo sin detallar';
  const fechaIngreso = new Date(orden.fecha_alta || orden.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  const falla = orden.id_equipo?.fallaReportada || orden.observaciones || 'Sin falla especificada.';

  return (
    <Box className="modificar-wrapper" style={{ paddingTop: '100px' }}>
      <Navbar />
      <div className="modificar-glow"></div>

      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3, position: 'relative', zIndex: 10 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <Box>
            <Typography sx={{ color: '#8a8f98', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <FiSettings /> GESTIÓN DE TALLER
            </Typography>
            <Typography variant="h4" sx={{ color: '#8ed5ff', fontWeight: 900, mb: 0.5 }}>
              MODIFICAR ESTADO DEL EQUIPO
            </Typography>
            <Typography sx={{ color: '#fff', fontSize: '0.85rem', fontFamily: 'monospace' }}>
              ORDEN #TKT-{(orden.nro_orden || orden._id).toString().slice(-6)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid #2d3238', borderRadius: '4px', px: 2, py: 0.5 }}>
              <Typography sx={{ color: '#8a8f98', fontSize: '0.7rem', fontWeight: 700 }}>
                ● {estadoGuardado}
              </Typography>
            </Box>
            <Button onClick={() => navigate(-1)} sx={{ color: '#fff', fontWeight: 700, display: 'flex', gap: 1 }}>
              <FiArrowLeft /> VOLVER
            </Button>
          </Box>
        </header>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box className="modificar-panel">
                <Typography sx={{ color: '#8ed5ff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <FiFileText size={18} /> Datos de Ingreso
                </Typography>
                
                <Box mb={2}>
                  <Typography sx={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', mb: 0.5 }}>EQUIPO</Typography>
                  <Typography sx={{ color: '#8ed5ff', fontWeight: 600 }}>{cpuEquipo}</Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.7rem' }}>S/N: {orden.id_equipo?._id?.slice(-10).toUpperCase() || 'N/A'}</Typography>
                </Box>

                <Box mb={2}>
                  <Typography sx={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', mb: 0.5 }}>CLIENTE</Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>{nombreCliente}</Typography>
                </Box>

                <Box mb={3}>
                  <Typography sx={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', mb: 0.5 }}>FECHA DE INGRESO</Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>{fechaIngreso}</Typography>
                </Box>

                <Box sx={{ borderTop: '1px solid #2d3238', pt: 2 }}>
                  <Typography sx={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', mb: 1 }}>PROBLEMA REPORTADO</Typography>
                  <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 1, border: '1px solid #1a1d24' }}>
                    <Typography sx={{ color: '#9ca3af', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      "{falla}"
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box className="modificar-panel">
                <Typography sx={{ color: '#8ed5ff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FiFileText size={18} /> Bitácora Interna
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', mb: 2 }}>
                  ESTAS NOTAS SON PRIVADAS PARA EL EQUIPO TÉCNICO.
                </Typography>
                <TextField
                  fullWidth multiline rows={4}
                  placeholder="Ej: Se instaló la batería nueva. Corriendo pruebas de ciclos de carga..."
                  value={bitacora} onChange={(e) => setBitacora(e.target.value)}
                  className="industrial-input"
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Box className="modificar-panel" sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box mb={3}>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>Seleccionar Nuevo Estado</Typography>
                <Typography sx={{ color: '#8a8f98', fontSize: '0.85rem' }}>Actualice el progreso de la reparación seleccionando una de las siguientes etapas.</Typography>
              </Box>

              <Box sx={{ flexGrow: 1 }}>
                {ESTADOS_REPARACION.map((paso) => {
                  const isCompletado = paso.nivel < nivelDB;
                  const isActualSeleccionado = paso.id === nuevoEstadoSel;
                  const isProximo = paso.nivel === nivelDB + 1;
                  let isExcluido = false;

                  if (paso.nivel === 4) {
                    if (nivelDB >= 4 && estadoGuardado !== paso.id && ESTADOS_REPARACION.find(e => e.id === estadoGuardado)?.nivel >= 4) {
                      isExcluido = true;
                    }
                  }

                  const isRechazado = estadoGuardado === 'PRESUPUESTO RECHAZADO' || nuevoEstadoSel === 'PRESUPUESTO RECHAZADO';
                  if (isRechazado && paso.nivel > 4) {
                    isExcluido = true;
                  }

                  const isClickable = (isProximo || isActualSeleccionado) && !isExcluido && paso.nivel >= nivelDB;
                  const isBloqueado = (!isClickable && !isCompletado) || isExcluido;
                  
                  let className = "estado-item";
                  if (isActualSeleccionado) className += " selected";
                  else if (isCompletado) className += " completado";
                  else if (isClickable) className += " clickable";
                  else if (isBloqueado) className += " disabled";

                  const Icon = paso.icon;

                  return (
                    <Box 
                      key={paso.id} 
                      className={className} 
                      onClick={() => isClickable && setNuevoEstadoSel(paso.id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <div className="icon-box">
                          <Icon size={20} />
                        </div>
                        <Box>
                          <Typography sx={{ color: isActualSeleccionado || isCompletado ? '#fff' : '#e2e8f0', fontWeight: 700, fontSize: '0.95rem' }}>
                            {paso.titulo}
                          </Typography>
                          <Typography sx={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', fontFamily: 'monospace' }}>
                            {paso.desc}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {isActualSeleccionado && (
                        <Box sx={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #00a8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Box sx={{ width: '10px', height: '10px', borderRadius: '50%', bgcolor: '#00a8e8' }} />
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, mt: 2, borderTop: '1px solid #2d3238' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate(-1)} 
                  sx={{ color: '#fff', borderColor: '#3e484f', fontWeight: 700, px: 4, '&:hover': { borderColor: '#fff' } }}
                >
                  CANCELAR
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleGuardar} 
                  disabled={nuevoEstadoSel === estadoGuardado}
                  sx={{ bgcolor: '#00a8e8', color: '#0b0f19', fontWeight: 800, px: 4, '&:hover': { bgcolor: '#008bbf' }, '&.Mui-disabled': { bgcolor: '#2d3238', color: '#64748b' } }}
                >
                  GUARDAR CAMBIOS
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Snackbar open={alertConfig.open} autoHideDuration={3000} onClose={() => setAlertConfig({...alertConfig, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={alertConfig.type} variant="filled">{alertConfig.msg}</Alert>
      </Snackbar>
    </Box>
  );
}