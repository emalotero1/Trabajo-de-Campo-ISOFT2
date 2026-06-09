// src/components/Homes/HomeTecnico.jsx (o tu ruta actual)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid } from '@mui/material';
import { FaReceipt, FaClock, FaArrowRight, FaWrench } from 'react-icons/fa6';
import { FaHistory } from 'react-icons/fa';
import { useAuth } from '../../../context/authProvider';
import Navbar from '../../components/Layout/Navbar';
import '../../styles/HomeRoles.css'; 

// Importamos el servicio para traer las órdenes desde la BD
import { obtenerTodasLasOrdenes } from '../../Services/ordenServicio';

const HomeTecnico = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || user?.username || 'Tech_User';

  // 1. inicializamos los datos en 0
  const [cantOrdenes, setcantOrdenes] = useState({
    pendientes: 0,
    gestion: 0,
    activos: 0,
    historial: 0
  });

  // 2. CONSUMO DE API: Cargar órdenes y agruparlas matemáticamente por estado
  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const data = await obtenerTodasLasOrdenes();

        if (data.status === "success" || data.ok) {
          const ordenes = data.ordenes || [];
          const tecnicoId = String(user?.id || user?._id || '');

          const ordenesAsignadasAlTecnico = ordenes.filter((o) => {
            const asignadoA = o.tecnico_asignado ? String(o.tecnico_asignado._id || o.tecnico_asignado) : '';
            return asignadoA === tecnicoId;
          });

          const pendientesSinAsignar = ordenes.filter(o => o.estado === 'PENDIENTE DE REVISION' && !o.tecnico_asignado).length;
          const gestion = ordenesAsignadasAlTecnico.filter(o => ['ASIGNADO', 'DIAGNOSTICADO'].includes(o.estado)).length;
          const activos = ordenesAsignadasAlTecnico.filter(o => ['PRESUPUESTADO', 'PRESUPUESTO ACEPTADO', 'PRESUPUESTO RECHAZADO', 'REPARADO'].includes(o.estado)).length;
          const historial = ordenesAsignadasAlTecnico.filter(o => o.estado === 'ENTREGADO').length;

          setcantOrdenes({
            pendientes: pendientesSinAsignar,
            gestion,
            activos,
            historial
          });
        }
      } catch (error) {
        console.error("❌ ERROR AL CARGAR LAS ORDENES:", error);
      }
    };

    cargarEstadisticas();
  }, []);

  // 3. Tus acciones ahora se alimentan automáticamente del estado "labStats"
  const actions = [
    {
      title: 'TRABAJOS PENDIENTES',
      desc: 'Órdenes en espera de asignación técnica.',
      icon: <FaClock />,
      path: '/trabajospendientes',
      count: cantOrdenes.pendientes
    },
    {
      title: 'GESTIÓN DE TRABAJOS',
      desc: 'Realizar diagnósticos y asignar presupuestos.',
      icon: <FaReceipt />,
      path: '/mesatrabajo',
      count: cantOrdenes.gestion
    },
    {
      title: 'TRABAJOS ACTIVOS',
      desc: 'Espera de aceptación y ejecución de reparaciones.',
      icon: <FaWrench />,
      path: '/trabajosactivos',
      count: cantOrdenes.activos
    },
    {
      title: 'HISTORIAL DE TRABAJOS',
      desc: 'Registro de trabajos finalizados y entregados.',
      icon: <FaHistory />,
      path: '/historialtrabajos',
      count: cantOrdenes.historial
    }
  ];

  return (
    <div className="home-dashboard-wrapper corporate-dark">
      <Navbar />
      <div className="corporate-glow"></div>

      <div className="container home-content-z">
        {/* HEADER TÉCNICO */}
        <header className="home-welcome-header">
          <h1 className="welcome-title-corp">
            HOLA, <span className="text-highlight">{userName.toUpperCase()}</span>
          </h1>
        </header>
        
        {/* GRID DE ACCIONES: 2 Columnas para mejor visibilidad técnica */}
        <Grid container spacing={3} className="options-grid-container">
          {actions.map((action, index) => (
            <Grid item xs={12} md={6} key={index}>
              <div className="corporate-option-card" onClick={() => navigate(action.path)}>
                <div className="corp-card-accent"></div>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div className="icon-wrapper-corp">{action.icon}</div>
                  
                  {/* Se renderiza dinámicamente si el conteo es mayor o igual a 0 */}
                  {action.count !== undefined && (
                    <Box className="stat-badge-corp">
                      {action.count} PENDIENTES
                    </Box>
                  )}
                </Box>

                <div className="card-info-corp">
                  <h3>{action.title}</h3>
                  <p>{action.desc}</p>
                </div>

                <div className="card-action-arrow">
                  <FaArrowRight />
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default HomeTecnico;