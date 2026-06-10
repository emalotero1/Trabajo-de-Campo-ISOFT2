import React, { useEffect, useState } from 'react';
// Sumamos CircularProgress de Material UI para el spinner
import { Box, Typography, TextField, CircularProgress } from '@mui/material';
import { FiClock, FiSettings, FiList, FiSearch } from 'react-icons/fi';
import Navbar from '../Layout/Navbar';
import '../../styles/TrabajosPendientes.css';
import { obtenerHistorialOrdenes } from '../../Services/ordenServicio';

export default function HistorialTrabajos() {
  const [busqueda, setBusqueda] = useState('');
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true); // NUEVO: Estado de carga

  useEffect(() => {
    const cargar = async () => {
      setCargando(true); // Avisamos que empieza a cargar
      try {
        const data = await obtenerHistorialOrdenes(busqueda);
        if (data.ok || data.status === 'success') {
          setOrdenes(data.ordenes || []);
        }
      } catch (error) {
        console.error('Error al cargar historial:', error);
      } finally {
        setCargando(false); // Avisamos que terminó, haya o no error
      }
    };
 
    const timer = setTimeout(cargar);
    
    return () => clearTimeout(timer);
  }, [busqueda]);

  return (
    <Box className="alta-equipo-wrapper corporate-dark home-content-z">
      <Navbar />
      <div className="corporate-glow"></div>
      <Box sx={{ maxWidth: '1600px', mx: 'auto', px: { xs: 2, md: 3 }, mt: 4 }}>
        <Box className="corp-panel" sx={{ mb: 4, p: { xs: 3, md: 4 }, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#8ed5ff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <FiSettings size={32} /> HISTORIAL DE TRABAJOS
            </Typography>
            <Typography sx={{ color: '#bdc8d1', fontSize: '0.9rem' }}>
              Registro de trabajos finalizados y entregados.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: '380px' } }}>
            <Box sx={{ position: 'relative', width: '100%' }}>
              <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#87929a' }} />
              <TextField
                fullWidth
                placeholder="Buscar por cliente o Numero de pedido"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                inputProps={{ style: { paddingLeft: '42px', color: '#fff' } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#111827' }, '& fieldset': { borderColor: '#2d3748' } }}
              />
            </Box>
          </Box>
        </Box>

        <Box className="corp-panel" sx={{ mb: 4, px: 3, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161c22' }}>
          <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#bdc8d1', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>
            <FiList color="#8ed5ff" /> TRABAJOS ENTREGADOS
          </Typography>
          <Typography sx={{ color: '#8ed5ff', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>
            {cargando ? 'CARGANDO...' : `${ordenes.length} REGISTROS`}
          </Typography>
        </Box>

        {/* NUEVO: Lógica de renderizado condicional según estado "cargando" */}
        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#8ed5ff' }} />
          </Box>
        ) : (
          <Box className="tp-cards-grid">
            {ordenes.map((orden) => {
              const cliente = orden.id_equipo?.cliente || {};
              return (
                <Box key={orden._id} className="tp-card-shell">
                  <Box className="technical-card" sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
                      <Box sx={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid #3e484f', borderRadius: '4px', px: 1.5, py: 0.5, mb: 2 }}>
                        <Typography sx={{ color: '#87929a', fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px' }}>PEDIDO Nº: ORD-{orden.nro_orden}</Typography>
                      </Box>
                      <Typography sx={{ color: '#8ed5ff', fontSize: '0.9rem', fontWeight: 700, mb: 1 }}>Cliente: {cliente.name} {cliente.lastname}</Typography>
                      <Typography sx={{ color: '#8ed5ff', fontWeight: 700, fontSize: '1.05rem' }}>{orden.id_equipo?.cpu || 'Equipo sin detalle'}</Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600, mb: 1 }}>{orden.id_equipo?.gabinete || 'Gabinete estándar'}</Typography>
                      <Typography sx={{ color: '#bdc8d1', fontSize: '0.85rem', minHeight: '52px', maxHeight: '52px', overflow: 'hidden' }}>{orden.id_equipo?.fallaReportada || 'Sin descripción'}</Typography>
                      <Box sx={{ mt: 'auto', borderTop: '1px solid rgba(62,72,79,0.5)', pt: 2, display: 'grid', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#8ed5ff' }}>
                          <FiClock size={14} />
                          <Typography sx={{ fontSize: '0.75rem', color: '#dde3ec', fontWeight: 600 }}>{new Date(orden.updatedAt || orden.createdAt).toLocaleDateString('es-AR')}</Typography>
                        </Box>
                        <Box sx={{ backgroundColor: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '4px', px: 1.5, py: 0.5, width: 'fit-content' }}>
                          <Typography sx={{ color: '#38bdf8', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{orden.estado || 'ENTREGADO'}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
            
            {/* Mensaje por si la búsqueda no arroja resultados */}
            {ordenes.length === 0 && (
                <Typography sx={{ color: '#87929a', textAlign: 'center', width: '100%', gridColumn: '1 / -1', py: 5 }}>
                  No se encontraron trabajos históricos.
                </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}