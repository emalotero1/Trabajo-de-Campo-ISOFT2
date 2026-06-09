import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { FiClock, FiSettings, FiList } from 'react-icons/fi';
import Navbar from '../Layout/Navbar';
import '../../styles/TrabajosPendientes.css';
import { obtenerOrdenesActivas } from '../../Services/ordenServicio';

const calcularTiempoTranscurrido = (fechaCreacion) => {
  if (!fechaCreacion) return '0h 0m';
  const diffMs = Date.now() - new Date(fechaCreacion).getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHoras = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const diffMinutos = Math.floor((diffMs / 1000 / 60) % 60);
  if (diffDias > 0) return `${diffDias}d ${String(diffHoras).padStart(2, '0')}h`;
  if (diffHoras > 0) return `${diffHoras}h ${String(diffMinutos).padStart(2, '0')}m`;
  return `${diffMinutos}m`;
};

export default function TrabajosActivos() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerOrdenesActivas(true);
        if (data.ok || data.status === 'success') {
          setOrdenes((data.ordenes || []).map((orden) => ({
            _id: orden.nro_orden ? `ORD-${orden.nro_orden}` : orden._id.slice(-8),
            _realId: orden._id,
            equipo: {
              cpu: orden.id_equipo?.cpu || 'PC Genérica',
              gpu: orden.id_equipo?.gpu || 'Video Integrado',
              gabinete: orden.id_equipo?.gabinete || 'Gabinete Estándar'
            },
            fallaReportada: orden.id_equipo?.fallaReportada || 'Sin descripción de falla.',
            estadoActual: orden.estado || 'PRESUPUESTADO',
            tiempo: calcularTiempoTranscurrido(orden.createdAt),
            cliente: orden.id_equipo?.cliente || null
          })));
        }
      } catch (error) {
        console.error('Error al cargar trabajos activos:', error);
      }
    };

    cargar();
  }, []);

  return (
    <Box className="alta-equipo-wrapper corporate-dark home-content-z">
      <Navbar />
      <div className="corporate-glow"></div>
      <Box sx={{ maxWidth: '1600px', mx: 'auto', px: { xs: 2, md: 3 }, mt: 4 }}>
        <Box className="corp-panel" sx={{ mb: 4, p: { xs: 3, md: 4 } }}>
          <Typography variant="h4" sx={{ color: '#8ed5ff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <FiSettings size={32} /> TRABAJOS ACTIVOS
          </Typography>
          <Typography sx={{ color: '#bdc8d1', fontSize: '0.9rem' }}>
            Espera de aceptación y ejecución de reparaciones.
          </Typography>
        </Box>

        <Box className="corp-panel" sx={{ mb: 4, px: 3, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161c22' }}>
          <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#bdc8d1', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>
            <FiList color="#8ed5ff" /> ORDENES EN PROCESO
          </Typography>
          <Typography sx={{ color: '#8ed5ff', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>
            {ordenes.length} TRABAJOS ACTIVOS
          </Typography>
        </Box>

        <Box className="tp-cards-grid">
          {ordenes.map((orden) => (
            <Box key={orden._realId} className="tp-card-shell">
              <Box className="technical-card" sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
                  <Box sx={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid #3e484f', borderRadius: '4px', px: 1.5, py: 0.5, mb: 2 }}>
                    <Typography sx={{ color: '#87929a', fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px' }}>
                      PEDIDO Nº: {orden._id}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ color: '#8ed5ff', fontWeight: 700, fontSize: '1.1rem' }}>{orden.equipo.cpu}</Typography>
                  <Typography variant="h6" sx={{ color: '#8ed5ff', fontWeight: 700, fontSize: '1.1rem' }}>{orden.equipo.gpu}</Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 1, fontWeight: 600 }}>{orden.equipo.gabinete}</Typography>
                  <Typography sx={{ color: '#bdc8d1', fontSize: '0.85rem', mb: 2, minHeight: '52px', maxHeight: '52px', overflow: 'hidden' }}>{orden.fallaReportada}</Typography>
                  <Typography sx={{ color: '#8ed5ff', fontSize: '0.75rem', mb: 1, fontWeight: 700 }}>Cliente: {orden.cliente ? `${orden.cliente.name} ${orden.cliente.lastname}` : 'Sin cliente'}</Typography>
                  <Box sx={{ mt: 'auto', borderTop: '1px solid rgba(62,72,79,0.5)', pt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#8ed5ff' }}>
                        <FiClock size={14} />
                        <Typography sx={{ fontSize: '0.75rem', color: '#dde3ec', fontWeight: 600 }}>{orden.tiempo}</Typography>
                      </Box>
                      <Box sx={{ mt: 1, backgroundColor: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '4px', px: 1.5, py: 0.5, width: 'fit-content' }}>
                        <Typography sx={{ color: '#38bdf8', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{orden.estadoActual}</Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/modificar-estado/${orden._realId}`)}
                      sx={{ bgcolor: '#0ea5e9', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'none', py: 0.8, width: '100%', '&:hover': { bgcolor: '#0284c7' } }}
                    >
                      Modificar Estado
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
