import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { FiSettings, FiSearch, FiClock, FiList, FiCheckCircle } from 'react-icons/fi'; 
import '../../styles/AltaEquipo.css'; 
import Navbar from '../../components/Layout/Navbar';
import '../../styles/TrabajosPendientes.css';

import { obtenerOrdenesPendientes, asignarOrden } from '../../Services/ordenServicio';

const calcularTiempoTranscurrido = (fechaCreacion) => {
  if (!fechaCreacion) return '0h 0m';
  const inicio = new Date(fechaCreacion);
  const ahora = new Date();
  const diffMs = ahora - inicio;

  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHoras = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const diffMinutos = Math.floor((diffMs / 1000 / 60) % 60);

  if (diffDias > 0) return `${diffDias}d ${diffHoras.toString().padStart(2, '0')}h`;
  if (diffHoras > 0) return `${diffHoras}h ${diffMinutos.toString().padStart(2, '0')}m`;
  return `${diffMinutos}m`;
};

export default function TrabajosPendientes() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [ordenes, setOrdenes] = useState([]);
  
  // NUEVO ESTADO PARA EL POP-UP
  const [openDialog, setOpenDialog] = useState(false);

  const cargarOrdenesBD = async () => {
    try {
      const data = await obtenerOrdenesPendientes();

      if (data.status === "success") {
        const ordenesFormateadas = data.ordenes.map(orden => ({
          _id: orden.nro_orden ? `ORD-${orden.nro_orden}` : orden._id.slice(-8), 
          _realId: orden._id,
          equipo: {
            cpu: orden.id_equipo?.cpu || 'PC Genérica', 
            gpu: orden.id_equipo?.gpu || 'Video Integrado',
            gabinete: orden.id_equipo?.gabinete || 'Gabinete Estándar'
          },
          fallaReportada: orden.id_equipo?.fallaReportada || 'Sin descripción de falla.',
          estadoActual: orden.estado || 'PENDIENTE DE REVISION',
          tiempo: calcularTiempoTranscurrido(orden.createdAt) 
        }));

        setOrdenes(ordenesFormateadas);
      }
    } catch (error) {
      console.error("❌ ERROR AL CARGAR LAS ÓRDENES:", error);
    }
  };

  useEffect(() => {
    cargarOrdenesBD();
  }, []);

  const handleAsignar = async (id) => {
    try {
      await asignarOrden(id);
      cargarOrdenesBD(); 
      // ABRIMOS EL POP-UP AL TENER ÉXITO
      setOpenDialog(true);
    } catch (error) {
      console.error("Error al asignar la orden:", error);
      alert("Hubo un error al asignarse la orden. Revisa la consola.");
    }
  };

  const ordenesFiltradas = ordenes.filter(orden => {
    const query = busqueda.toLowerCase();
    const textoEquipo = `${orden.equipo?.cpu} ${orden.equipo?.gpu} ${orden.equipo?.gabinete}`.toLowerCase();
    return textoEquipo.includes(query) || orden._id.toLowerCase().includes(query);
  });

  return (
    <Box className="alta-equipo-wrapper corporate-dark home-content-z">
      <Navbar />
      <div className="corporate-glow"></div>
      
      <Box sx={{ maxWidth: '1600px', mx: 'auto', px: { xs: 2, md: 3 }, position: 'relative', zIndex: 1, mt: 4 }}>
        
        {/* HEADER MODULAR */}
        <Box className="corp-panel" sx={{ mb: 5, p: { xs: 3, md: 4 }, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#8ed5ff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <FiSettings size={32} /> TRABAJOS PENDIENTES
            </Typography>
            <Typography sx={{ color: '#bdc8d1', fontSize: '0.9rem' }}>
              Tablero de monitoreo de hardware ordenado por llegada.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: '350px' } }}>
            <Box sx={{ position: 'relative', width: '100%' }}>
              <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#87929a' }} />
              <input 
                type="text" 
                className="industrial-input-corp" 
                style={{ paddingLeft: '45px', borderRadius: '8px', width: '100%' }}
                placeholder="Buscar modelo, Numero de pedido..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </Box>
          </Box>
        </Box>

        {/* SUBHEADER: COLA DE SERVICIO */}
        <Box className="corp-panel" sx={{ mb: 4, px: 3, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161c22' }}>
          <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#bdc8d1', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>
            <FiList color="#8ed5ff" /> ORDEN DE LLEGADA
          </Typography>
          <Typography sx={{ color: '#8ed5ff', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>
            {ordenesFiltradas.length} ÓRDENES EN PANTALLA
          </Typography>
        </Box>

        {/* GRILLA DE TARJETAS TÉCNICAS */}
        <Box className="tp-cards-grid">
          {ordenesFiltradas.map((orden) => {
            const esPendiente = orden.estadoActual === 'PENDIENTE DE REVISION';
            const estadosBloqueados = ['INGRESADO', 'EN DIAGNOSTICO'];
            const botonHabilitado = !estadosBloqueados.includes(orden.estadoActual.toUpperCase());

            return (
              <Box key={orden._id} className="tp-card-shell">
                <Box className="technical-card" sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }} data-technical-body>
                    
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }} className="tp-card-copy">
                      <Box sx={{ display: 'inline-block', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid #3e484f', borderRadius: '4px', px: 1.5, py: 0.5, mb: 2 }}>
                        <Typography sx={{ color: '#87929a', fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px' }}>
                          PEDIDO Nº: {orden._id} 
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                        <Typography variant="h6" sx={{ color: '#8ed5ff', fontWeight: 700, fontSize: '1.1rem' }}>
                          {orden.equipo.cpu}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#8ed5ff', fontWeight: 700, fontSize: '1.1rem' }}>
                          {orden.equipo.gpu}
                        </Typography>
                        <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 1, fontWeight: 600 }}>
                          {orden.equipo.gabinete}
                        </Typography>
                        <Typography sx={{ color: '#bdc8d1', fontSize: '0.85rem', mb: 3, minHeight: '52px', maxHeight: '52px', overflow: 'hidden' }} className="tp-card-description">
                          {orden.fallaReportada}
                        </Typography>
                      </Box>

                      <Box sx={{ flexGrow: 1 }} />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'end', pt: 2, borderTop: '1px solid rgba(62, 72, 79, 0.5)' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#8ed5ff' }}>
                          <FiClock size={14} />
                          <Typography sx={{ fontSize: '0.75rem', color: '#dde3ec', fontWeight: 600 }}>{orden.tiempo}</Typography>
                        </Box>

                        <Box sx={{
                          backgroundColor: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '4px',
                          px: 1.5,
                          py: 0.5,
                          width: 'fit-content'
                        }}>
                          <Typography sx={{ color: '#38bdf8', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            {orden.estadoActual}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {esPendiente ? (
                          <Button 
                            variant="contained"
                            onClick={() => handleAsignar(orden._realId)}
                            sx={{
                              bgcolor: '#10b981',
                              color: '#fff',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              letterSpacing: '0.5px',
                              textTransform: 'none',
                              py: 0.8,
                              width: '100%',
                              '&:hover': { bgcolor: '#059669' }
                            }}
                          >
                            Asignarme Orden
                          </Button>
                        ) : (
                          <Button 
                            variant="contained"
                            disabled={!botonHabilitado}
                            onClick={() => navigate(`/modificar-estado/${orden._realId}`)}
                            sx={{
                              bgcolor: botonHabilitado ? '#0ea5e9' : '#374151',
                              color: botonHabilitado ? '#fff' : '#6b7280',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              letterSpacing: '0.5px',
                              textTransform: 'none',
                              py: 0.8,
                              width: '100%',
                              '&:hover': { bgcolor: botonHabilitado ? '#0284c7' : '#374151' },
                              '&.Mui-disabled': {
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                color: '#64748b'
                              }
                            }}
                          >
                            Modificar Estado
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* --- INICIO DEL POP-UP (DIALOG) --- */}
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
          ¡Orden Asignada!
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#87929a', mt: 1 }}>
            La orden se ha asignado correctamente a tu usuario. ¿Deseas dirigirte a la gestión de trabajos para comenzar el diagnóstico o prefieres seguir viendo los trabajos pendientes?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            sx={{ color: '#87929a', '&:hover': { color: '#fff' } }}
          >
            Quedarme aquí
          </Button>
          <Button 
            variant="contained"
            onClick={() => navigate('/mesatrabajo')} 
            sx={{
              bgcolor: '#0ea5e9',
              color: '#fff',
              '&:hover': { bgcolor: '#0284c7' }
            }}
            autoFocus
          >
            Ir a Gestión de Trabajos
          </Button>
        </DialogActions>
      </Dialog>
      {/* --- FIN DEL POP-UP --- */}

    </Box>
  );
}