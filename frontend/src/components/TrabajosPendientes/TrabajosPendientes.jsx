import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Button } from '@mui/material';
import { FiSettings, FiSearch, FiClock, FiList } from 'react-icons/fi';
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
      
      <Box className="tp-main-container">
        
        {/* HEADER MODULAR */}
        <Box className="corp-panel tp-header-panel">
          <Box>
            <Typography variant="h4" className="tp-header-title">
              <FiSettings size={32} /> TRABAJOS PENDIENTES
            </Typography>
            <Typography className="tp-header-subtitle" align="center">
              Tablero de monitoreo de hardware ordenado por llegada.
            </Typography>
          </Box>

          <Box className="tp-search-wrapper">
            <Box className="tp-search-inner">
              <FiSearch className="tp-search-icon" />
              <input 
                type="text" 
                className="industrial-input-corp tp-search-input" 
                placeholder="Buscar modelo, ID de pedido..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </Box>
          </Box>
        </Box>

        {/* SUBHEADER: COLA DE SERVICIO */}
        <Box className="corp-panel tp-subheader-panel">
          <Typography className="tp-subheader-left">
            <FiList color="#8ed5ff" /> ORDEN DE LLEGADA
          </Typography>
          <Typography className="tp-subheader-right">
            {ordenesFiltradas.length} ÓRDENES EN PANTALLA
          </Typography>
        </Box>

        {/* GRILLA DE TARJETAS TÉCNICAS */}
        {/* Usamos alignItems="flex-start" para evitar que las tarjetas se estiren a lo alto de la fila */}
        {/* LISTA DE ÓRDENES (NUEVO DISEÑO HORIZONTAL) */}
        <Box className="tp-list-container">
          {ordenesFiltradas.map((orden) => {
            const esPendiente = orden.estadoActual === 'PENDIENTE DE REVISION';
            const estadosBloqueados = ['INGRESADO', 'DIAGNOSTICADO'];
            const botonHabilitado = !estadosBloqueados.includes(orden.estadoActual.toUpperCase());

            return (
              <Box className="tp-list-row" key={orden._id}>
                
                {/* Columna Izquierda: Meta (ID y Estado) */}
                <Box className="tp-row-meta">
                  <Typography className="tp-badge-text">
                    PEDIDO Nº: {orden._id}
                  </Typography>
                  <Box className="tp-status-badge">
                    <Typography className="tp-status-text">
                      {orden.estadoActual}
                    </Typography>
                  </Box>
                </Box>

                {/* Columna Central: Información del Hardware y Falla */}
                <Box className="tp-row-content">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                    <Typography className="tp-hw-title">
                      {orden.equipo.cpu}
                    </Typography>
                    <Typography sx={{ color: '#3e484f' }}>|</Typography>
                    <Typography className="tp-hw-title">
                      {orden.equipo.gpu}
                    </Typography>
                  </Box>
                  <Typography className="tp-hw-subtitle">
                    {orden.equipo.gabinete}
                  </Typography>
                  <Typography className="tp-hw-desc">
                    {orden.fallaReportada}
                  </Typography>
                </Box>

                {/* Columna Derecha: Tiempo y Acciones */}
                <Box className="tp-row-actions">
                  <Box className="tp-time-wrapper">
                    <FiClock size={16} />
                    <Typography className="tp-time-text">{orden.tiempo}</Typography>
                  </Box>
                  
                  {esPendiente ? (
                    <Button 
                      variant="contained"
                      onClick={() => handleAsignar(orden._realId)}
                      className="tp-btn-action tp-btn-assign"
                    >
                      Asignarme Orden
                    </Button>
                  ) : (
                    <Button 
                      variant="contained"
                      disabled={!botonHabilitado}
                      onClick={() => navigate(`/modificar-estado/${orden._realId}`)}
                      className={`tp-btn-action tp-btn-modify ${!botonHabilitado ? 'tp-btn-disabled' : ''}`}
                    >
                      Modificar Estado
                    </Button>
                  )}
                </Box>
                
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}