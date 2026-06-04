import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, Select, MenuItem, Button, 
  Tabs, Tab, TextField, IconButton, Snackbar, Alert, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import BuildIcon from '@mui/icons-material/Build';
import { useMesaTrabajo } from '../../hooks/useMesaTrabajo';
import Navbar from '../../components/Layout/Navbar';

import '../../styles/MesaTrabajo.css';

const MesaTrabajo = () => {
  const { listaPendientes, loading, error, actualizarOrden } = useMesaTrabajo();
  
  const [order, setOrder] = useState(null);
  const [activeTab, setActiveTab] = useState(0); 
  const [mostrarExito, setMostrarExito] = useState(false);

  const workStates = ['PENDIENTE DE REVISION', 'EN DIAGNOSTICO', 'PRESUPUESTADO'];
  const currentStateIndex = order ? workStates.indexOf(order.estado) : -1;

  useEffect(() => {
    if (order && order.presupuesto) {
      const partsTotal = order.presupuesto.repuestos.reduce(
        (sum, item) => sum + (Number(item.cantidad) * Number(item.precioUnitario)), 0
      );
      const newTotal = partsTotal + Number(order.presupuesto.manoDeObra.precio);
      setOrder(prev => ({ ...prev, presupuesto: { ...prev.presupuesto, total: newTotal } }));
    }
  }, [order?.presupuesto?.repuestos, order?.presupuesto?.manoDeObra?.precio]);

  const handleSelectOrder = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setOrder(null);
      return;
    }
    
    const ordenEncontrada = listaPendientes.find(o => o._id === selectedId);
    if (ordenEncontrada) {
      setOrder({
        ...ordenEncontrada,
        diagnostico: ordenEncontrada.diagnostico || { informe: '', notasInternas: '' },
        presupuesto: ordenEncontrada.presupuesto || { 
          repuestos: [], 
          manoDeObra: { descripcion: 'Reparación / Mantenimiento', precio: 0 }, 
          total: 0 
        }
      });
    }
  };

  const handleGuardar = async () => {
    if (!order) return;
    const guardadoCorrecto = await actualizarOrden(order._id, order);
    if (guardadoCorrecto) {
      setMostrarExito(true);
    }
  };

  const handleStateChange = (targetState) => {
    const targetIndex = workStates.indexOf(targetState);
    if (targetIndex === currentStateIndex + 1) {
      setOrder({ ...order, estado: targetState });
    }
  };

  const renderStateButton = (stateName, index) => {
    let label = "";
    let btnStyles = { width: '130px', fontWeight: '800', borderRadius: '4px', fontSize: '0.75rem', letterSpacing: '0.5px' };
    let isDisabled = true;

    if (index < currentStateIndex) {
      label = "COMPLETADO";
      btnStyles = { ...btnStyles, bgcolor: 'rgba(0, 168, 232, 0.1)', color: '#00a8e8', border: '1px solid rgba(0, 168, 232, 0.3)' };
    } else if (index === currentStateIndex) {
      label = "ACTUAL";
      btnStyles = { ...btnStyles, bgcolor: 'rgba(0, 168, 232, 0.2)', color: '#fff', border: '1px solid #00a8e8' };
    } else if (index === currentStateIndex + 1) {
      label = "ASIGNAR";
      btnStyles = { ...btnStyles, bgcolor: '#00a8e8', color: '#0b0f19', border: 'none', '&:hover': { bgcolor: '#008bbf' } };
      isDisabled = false;
    } else {
      label = "BLOQUEADO";
      btnStyles = { 
        ...btnStyles, 
        '&.Mui-disabled': {
          bgcolor: 'rgba(255,255,255,0.05)', 
          color: '#ffffff', 
          border: '1px solid #4b5563',
          opacity: 0.6 
        } 
      };
    }

    return (
      <Box key={stateName} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" sx={{ color: '#8a8f98', fontWeight: 600 }}>{stateName}</Typography>
        <Button disabled={isDisabled} onClick={() => handleStateChange(stateName)} sx={btnStyles}>
          {label}
        </Button>
      </Box>
    );
  };

  const clienteData = order?.id_equipo?.cliente;
  const nombreCliente = clienteData?.name ? `${clienteData.name} ${clienteData.lastname || ''}`.trim() : 'Cliente no registrado';
  const infoEquipo = order?.id_equipo?.cpu ? `${order.id_equipo.cpu} - ${order.id_equipo.ram || ''}` : 'Sin detallar';
  const fallaDelEquipo = order?.id_equipo?.fallaReportada || order?.observaciones || 'Sin falla especificada.';
  
  if (loading) return <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#0b0f19', color: '#00a8e8' }}><Typography variant="h5">Cargando mesa de trabajo...</Typography></Box>;
  if (error) return <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#0b0f19', color: '#ef4444' }}><Typography variant="h5">Error: {error}</Typography></Box>;

  return (
    <Box className="mesatrabajo-wrapper" style={{ paddingTop: '100px' }}>
      <Navbar />
      <div className="mesatrabajo-glow"></div>

      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: 3, position: 'relative', zIndex: 10 }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
              Mesa de Trabajo
            </Typography>
            <Typography sx={{ mt: '6px', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#8a8f98', letterSpacing: '1px' }}>
              DIAGNÓSTICO TÉCNICO Y PRESUPUESTADO
            </Typography>
          </Box>
        </header>

        <Snackbar open={mostrarExito} autoHideDuration={3000} onClose={() => setMostrarExito(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity="success" variant="filled" sx={{ width: '100%', bgcolor: '#10b981', color: '#fff', fontWeight: 'bold' }}>
            Cambios guardados exitosamente en el servidor.
          </Alert>
        </Snackbar>

        <Box className="mesatrabajo-panel" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
          <Typography sx={{ fontWeight: 800, color: '#00a8e8', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', minWidth: 'max-content' }}>
            Cargar Orden:
          </Typography>
          <Select
            fullWidth
            size="small"
            value={order?._id || ''}
            onChange={handleSelectOrder}
            displayEmpty
            className="industrial-input"
            sx={{ 
              color: '#ffffff', 
              fontWeight: 600,
              '.MuiSvgIcon-root': { color: '#00a8e8' },
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#374151' }
            }}
          >
            <MenuItem value="" disabled>-- Seleccione una orden de la cola de pendientes --</MenuItem>
            {listaPendientes.map(opcion => (
              <MenuItem key={opcion._id} value={opcion._id} sx={{ fontWeight: 600 }}>
                ORDEN #{opcion.nro_orden} | {opcion.id_equipo?.cliente?.name || 'S/N'} {opcion.id_equipo?.cliente?.lastname || ''} - {opcion.id_equipo?.cpu || 'Hardware Genérico'}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {!order ? (
          <Box sx={{ height: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #2d3238', borderRadius: 2, bgcolor: 'rgba(22, 25, 29, 0.4)' }}>
            <BuildIcon sx={{ color: '#2d3238', fontSize: 48, mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 700 }}>MESA LIBRE</Typography>
            <Typography sx={{ color: '#3e484f', fontSize: '0.85rem' }}>Seleccione un trabajo del menú superior para iniciar.</Typography>
          </Box>
        ) : (
          <Grid container spacing={4} alignItems="stretch" sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
            
            <Grid item xs={12} md={4} sx={{ minWidth: { md: '350px' } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                
                <Box className="mesatrabajo-panel">
                  <Box display="flex" alignItems="center" gap={1.5} mb={3} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 2 }}>
                    <BuildIcon sx={{ color: '#00a8e8' }} fontSize="small" />
                    <Typography sx={{ color: '#fff', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.9rem' }}>Datos del Equipo</Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography sx={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'JetBrains Mono', mb: 0.5 }}>CLIENTE</Typography>
                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>{nombreCliente}</Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography sx={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'JetBrains Mono', mb: 0.5 }}>HARDWARE</Typography>
                    <Typography sx={{ color: '#00a8e8', fontWeight: 700 }}>{infoEquipo}</Typography>
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'JetBrains Mono', mb: 1 }}>SÍNTOMAS / FALLA REPORTADA</Typography>
                    <Box sx={{ p: 2, bgcolor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 1 }}>
                      <Typography sx={{ color: '#f59e0b', fontSize: '0.85rem', fontStyle: 'italic', fontWeight: 600 }}>
                        "{fallaDelEquipo}"
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box className="mesatrabajo-panel" sx={{ borderLeft: '3px solid #00a8e8', flexGrow: 1 }}>
                  <Typography sx={{ color: '#fff', fontWeight: 800, mb: 3, textTransform: 'uppercase', fontSize: '0.9rem' }}>
                    Progreso Técnico
                  </Typography>
                  {workStates.map((state, idx) => renderStateButton(state, idx))}
                </Box>

              </Box>
            </Grid>

            <Grid item xs={12} md={8} sx={{ minWidth: 0 }}>
              <Box className="mesatrabajo-panel" sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 0, overflow: 'hidden' }}>
                
                <Tabs 
                  value={activeTab} 
                  onChange={(e, val) => setActiveTab(val)}
                  variant="fullWidth"
                  sx={{ 
                    borderBottom: '1px solid #2d3238',
                    bgcolor: 'rgba(13, 15, 17, 0.4)',
                    '& .MuiTab-root': { color: '#64748b', fontWeight: 800, py: 2.5, fontFamily: 'Inter' },
                    '& .Mui-selected': { color: '#00a8e8', bgcolor: 'rgba(0, 168, 232, 0.05)' },
                    '& .MuiTabs-indicator': { backgroundColor: '#00a8e8', height: '3px' }
                  }}
                >
                  <Tab label="DIAGNÓSTICO" />
                  <Tab label="ARMADO DE PRESUPUESTO" />
                </Tabs>

                {activeTab === 0 && (
                  <Box sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography sx={{ color: '#8a8f98', fontSize: '0.85rem', mb: 3 }}>
                      Detalle aquí las pruebas realizadas, voltajes medidos, componentes en corto o cualquier nota relevante para la reparación.
                    </Typography>
                    
                    <TextField
                      multiline
                      fullWidth
                      rows={12} 
                      className="industrial-input"
                      placeholder="Ej: Se detectó corto en la línea de 12V..."
                      value={order.diagnostico.informe}
                      onChange={(e) => setOrder({...order, diagnostico: {...order.diagnostico, informe: e.target.value}})}
                    />
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box className="custom-scrollbar" sx={{ p: 4, flexGrow: 1, overflowY: 'auto', maxHeight: '500px' }}>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography sx={{ color: '#fff', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.9rem' }}>Repuestos a Utilizar</Typography>
                      <Button size="small" startIcon={<AddIcon />} sx={{ color: '#0b0f19', bgcolor: '#00a8e8', fontWeight: 700, '&:hover': { bgcolor: '#008bbf' } }} onClick={() => {
                        const newParts = [...order.presupuesto.repuestos, { descripcion: '', cantidad: 1, precioUnitario: 0 }];
                        setOrder({...order, presupuesto: {...order.presupuesto, repuestos: newParts}});
                      }}>
                        AGREGAR ÍTEM
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                      {order.presupuesto.repuestos.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, bgcolor: 'rgba(13, 15, 17, 0.6)', border: '1px solid #2d3238', borderRadius: 1 }}>
                          <TextField 
                            variant="standard" placeholder="Descripción del repuesto" fullWidth value={item.descripcion}
                            onChange={(e) => { const newParts = [...order.presupuesto.repuestos]; newParts[index].descripcion = e.target.value; setOrder({...order, presupuesto: {...order.presupuesto, repuestos: newParts}}); }}
                            InputProps={{ disableUnderline: true, sx: { color: '#fff', fontSize: '0.9rem', fontWeight: 500 } }}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.3)', px: 1, borderRadius: 1, border: '1px solid #2d3238' }}>
                            <Typography sx={{ color: '#64748b', fontSize: '0.75rem', mr: 1, fontWeight: 700 }}>CANT.</Typography>
                            <TextField 
                              type="number" variant="standard" value={item.cantidad} inputProps={{ min: 1, style: { textAlign: 'center', color: '#00a8e8', fontWeight: 700 } }} sx={{ width: '40px' }}
                              onChange={(e) => { const newParts = [...order.presupuesto.repuestos]; newParts[index].cantidad = Number(e.target.value); setOrder({...order, presupuesto: {...order.presupuesto, repuestos: newParts}}); }}
                              InputProps={{ disableUnderline: true }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.3)', px: 1.5, py: 0.5, borderRadius: 1, border: '1px solid #2d3238', minWidth: '130px' }}>
                            <Typography sx={{ color: '#00a8e8', mr: 1, fontWeight: 700 }}>$</Typography>
                            <TextField 
                              type="number" variant="standard" value={item.precioUnitario} inputProps={{ min: 0, style: { textAlign: 'right', color: '#fff', fontWeight: 600 } }} fullWidth
                              onChange={(e) => { const newParts = [...order.presupuesto.repuestos]; newParts[index].precioUnitario = Number(e.target.value); setOrder({...order, presupuesto: {...order.presupuesto, repuestos: newParts}}); }}
                              InputProps={{ disableUnderline: true }}
                            />
                          </Box>
                          <IconButton size="small" sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }} onClick={() => {
                            const newParts = order.presupuesto.repuestos.filter((_, i) => i !== index);
                            setOrder({...order, presupuesto: {...order.presupuesto, repuestos: newParts}});
                          }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                      {order.presupuesto.repuestos.length === 0 && (
                        <Typography sx={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.85rem' }}>No se han agregado repuestos al presupuesto.</Typography>
                      )}
                    </Box>

                    <Typography sx={{ color: '#fff', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.9rem', mb: 2 }}>Mano de Obra y Servicios</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'rgba(0, 168, 232, 0.03)', border: '1px solid rgba(0, 168, 232, 0.2)', borderRadius: 1 }}>
                       <Box sx={{ flexGrow: 1 }}>
                         <Typography sx={{ color: '#e5e7eb', fontWeight: 700, fontSize: '0.95rem' }}>{order.presupuesto.manoDeObra.descripcion}</Typography>
                       </Box>
                       <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.4)', px: 2, py: 1, borderRadius: 1, border: '1px solid #00a8e8' }}>
                         <Typography sx={{ color: '#00a8e8', fontWeight: 800, mr: 1, fontSize: '1.1rem' }}>$</Typography>
                         <TextField 
                            type="number" variant="standard" value={order.presupuesto.manoDeObra.precio} inputProps={{ min: 0, style: { textAlign: 'right', fontWeight: 800, color: '#00a8e8', fontSize: '1.1rem' } }} sx={{ width: '100px' }}
                            onChange={(e) => setOrder({...order, presupuesto: {...order.presupuesto, manoDeObra: {...order.presupuesto.manoDeObra, precio: Number(e.target.value)}}})}
                            InputProps={{ disableUnderline: true }}
                          />
                       </Box>
                    </Box>
                  </Box>
                )}

                <Divider sx={{ borderColor: '#2d3238' }} />
                <Box sx={{ p: 3, bgcolor: 'rgba(13, 15, 17, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <Box>
                    {activeTab === 1 && (
                      <>
                        <Typography sx={{ color: '#8a8f98', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', fontFamily: 'JetBrains Mono', mb: 0.5 }}>Costo Total Estimado</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '1px' }}>$ {order.presupuesto?.total?.toLocaleString('es-AR') || '0'}</Typography>
                      </>
                    )}
                  </Box>
                  <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    onClick={handleGuardar}
                    sx={{ bgcolor: '#00a8e8', color: '#0b0f19', '&:hover': { bgcolor: '#008bbf' }, fontWeight: 800, px: 4, py: 1.5, letterSpacing: '1px' }}
                  >
                    GUARDAR CAMBIOS
                  </Button>
                </Box>

              </Box>
            </Grid>

          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default MesaTrabajo;